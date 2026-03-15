import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Rocket, Moon, Orbit, Radio, Newspaper, RefreshCw } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LaunchData {
  name: string;
  net: string; // "No Earlier Than" launch date
  status: { name: string; description: string };
  rocket: { configuration: { name: string } };
}

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FALLBACK_DATE = new Date("2026-07-01T00:00:00Z");

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function msToCountdown(ms: number) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms % 86400000) / 3600000),
    minutes: Math.floor((ms % 3600000) / 60000),
    seconds: Math.floor((ms % 60000) / 1000),
  };
}

// ─── Mission Tracker Component ────────────────────────────────────────────────
function MissionTracker() {
  const [launchDate, setLaunchDate] = useState<Date>(FALLBACK_DATE);
  const [launchName, setLaunchName] = useState("CubeRover-1 / Griffin-1");
  const [rocketName, setRocketName] = useState("Falcon Heavy (verwacht)");
  const [statusDesc, setStatusDesc] = useState<string | null>(null);
  const [news, setNews] = useState<NewsItem | null>(null);
  const [countdown, setCountdown] = useState(msToCountdown(FALLBACK_DATE.getTime() - Date.now()));
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'live' | 'fallback'>('fallback');
  const [newsError, setNewsError] = useState(false);

  // Countdown tick
  useEffect(() => {
    const tick = () => setCountdown(msToCountdown(launchDate.getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [launchDate]);

  const fetchData = async () => {
    setLoading(true);

    // 1. Launch data
    try {
      const r = await fetch('/api/cuberover-launch');
      if (r.ok) {
        const data = await r.json();
        if (data.results && data.results.length > 0) {
          const launch: LaunchData = data.results[0];
          setLaunchDate(new Date(launch.net));
          setLaunchName(launch.name);
          setRocketName(launch.rocket.configuration.name);
          setStatusDesc(launch.status.description);
          setDataSource('live');
        }
      }
    } catch { /* gebruik fallback */ }

    // 2. Nieuws
    try {
      setNewsError(false);
      const r = await fetch('/api/cuberover-news');
      if (r.ok) {
        const data = await r.json();
        if (data.items && data.items.length > 0) {
          const moonItem: NewsItem =
            data.items.find((it: NewsItem) =>
              /moon|lunar|cuberov|griffin/i.test(it.title)
            ) || data.items[0];
          setNews(moonItem);
        }
      }
    } catch { setNewsError(true); }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
            Missie Actief
          </span>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {dataSource === 'live' ? 'Live data' : 'Vernieuwen'}
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Mission title */}
        <div className="text-center">
          <h3 className="text-2xl font-black text-white tracking-tight">{launchName.toUpperCase()}</h3>
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mt-1">
            {rocketName} · NASA CLPS
          </p>
        </div>

        {/* Lanceer datum */}
        <div className="text-center text-slate-400 text-sm">
          Doeldatum lancering (NET):{' '}
          <strong className="text-white">
            {launchDate.toLocaleDateString('nl-NL', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </strong>
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Dagen',   value: countdown.days },
            { label: 'Uren',    value: countdown.hours },
            { label: 'Min',     value: countdown.minutes },
            { label: 'Sec',     value: countdown.seconds },
          ].map((item) => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl py-4 text-center">
              <div className="text-3xl font-black font-mono text-blue-400">{pad(item.value)}</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Status */}
        {statusDesc && (
          <div className="bg-black/30 border-l-4 border-blue-500 rounded-r-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">Live API Status</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">{statusDesc}</p>
          </div>
        )}

        {/* Nieuws */}
        <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Newspaper className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Laatste Nieuws</span>
          </div>
          {news ? (
            <a href={news.link} target="_blank" rel="noopener noreferrer"
              className="text-slate-300 text-xs leading-relaxed hover:text-amber-300 transition-colors block">
              <strong className="text-slate-200">{news.title}</strong>
              <span className="block text-slate-500 mt-0.5">
                {new Date(news.pubDate).toLocaleDateString('nl-NL')} · Klik om te lezen →
              </span>
            </a>
          ) : newsError ? (
            <p className="text-slate-500 text-xs">Nieuws momenteel niet beschikbaar.</p>
          ) : (
            <p className="text-slate-500 text-xs animate-pulse">Nieuws ophalen…</p>
          )}
        </div>

        {/* Bron */}
        <div className="flex justify-between text-[10px] text-slate-600 uppercase tracking-widest">
          <span>Bron: {dataSource === 'live' ? 'The Space Devs API' : 'Vaste planning (fallback)'}</span>
          <span>Raket: {rocketName}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main LunarLander Component ───────────────────────────────────────────────
export default function LunarLander() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.5 });

  const [piEstimate, setPiEstimate] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [diameter, setDiameter] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (isInView && !hasStarted) {
      setIsCalculating(true);
      setHasStarted(true);
    }
  }, [isInView, hasStarted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let angle = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    const drawMoonSurface = () => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.arc(50, 50, 20, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(250, 80, 35, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(80, 220, 15, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(280, 250, 25, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#475569';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const drawLander = (x: number, y: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation + Math.PI / 2);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-10, -15, 20, 30);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-14, -10, 4, 8);
      ctx.fillRect(10, -10, 4, 8);
      ctx.fillRect(-14, 5, 4, 8);
      ctx.fillRect(10, 5, 4, 8);

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-5, -5, 10, 10);

      ctx.restore();
    };

    const animate = () => {
      if (!isCalculating) {
        drawMoonSurface();
        drawLander(centerX + radius, centerY, 0);
        return;
      }

      drawMoonSurface();

      ctx.strokeStyle = '#e5738c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, angle);
      ctx.stroke();

      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      drawLander(x, y, angle);

      const currentDistance = angle * radius;
      const currentDiameter = radius * 2;
      setDistance(Math.round(currentDistance));
      setDiameter(Math.round(currentDiameter));

      if (angle > 0) {
        const noise = (Math.random() - 0.5) * 0.05 * (1 / (angle + 0.1));
        const currentPi = (currentDistance / (currentDiameter * (angle / (2 * Math.PI)))) + noise;
        setPiEstimate(currentPi);
      }

      angle += 0.02;

      if (angle <= Math.PI * 2) {
        animationId = requestAnimationFrame(animate);
      } else {
        setPiEstimate(Math.PI);
        setIsCalculating(false);
      }
    };

    drawMoonSurface();
    drawLander(centerX + radius, centerY, 0);

    if (isCalculating) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isCalculating]);

  return (
    <div className="space-y-10">
      {/* Titel */}
      <div className="text-center space-y-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-slate-800 flex items-center justify-center gap-3"
        >
          <Moon className="w-8 h-8 text-slate-600" />
          Pi op de Maan
          <Rocket className="w-8 h-8 text-primary-500" />
        </motion.h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Wiskundige Matt Parker (Stand-up Maths) gaat letterlijk Pi op de maan berekenen!
          Via zijn{' '}
          <a
            href="https://www.kickstarter.com/projects/standupmaths/moon-pi-were-going-to-calculate-on-the-moon"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-800 font-semibold underline"
          >
            Moon Pi Kickstarter
          </a>{' '}
          stuurt hij een <strong>CubeRover</strong> mee op de{' '}
          <strong>Griffin-1 maanlander</strong> van Astrobotic (NASA CLPS-missie).
          De opdracht: een perfecte cirkel rijden in het maanstof, de omtrek meten en delen door de diameter.
        </p>
      </div>

      {/* Simulator + telemetrie */}
      <div className="grid md:grid-cols-2 gap-8 items-center" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-700 text-white"
        >
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-slate-900">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full h-full object-contain"
            />
            {!isCalculating && piEstimate === 0 && !hasStarted && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                <button
                  onClick={() => { setIsCalculating(true); setHasStarted(true); }}
                  className="bg-primary-500 hover:bg-primary-400 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-primary-500/30 transition-all flex items-center gap-2 transform hover:scale-105"
                >
                  <Orbit className="w-5 h-5" />
                  Start Maanwandeling
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Orbit className="w-5 h-5 text-primary-500" />
              Missie Telemetrie (Simulatie)
            </h3>

            <div className="space-y-4 font-mono">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Afgelegde afstand (Omtrek):</span>
                <span className="text-lg font-bold text-slate-800">{distance} m</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Diameter van de cirkel:</span>
                <span className="text-lg font-bold text-slate-800">{diameter} m</span>
              </div>

              <div className="mt-6 p-4 bg-primary-50 border border-primary-100 rounded-xl">
                <div className="text-sm text-primary-600 font-sans font-semibold mb-1 uppercase tracking-wider">
                  Berekende Pi Waarde
                </div>
                <div className="text-4xl font-bold text-primary-600">
                  {piEstimate === 0 ? '---' : piEstimate.toFixed(5)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <p className="text-slate-600 text-sm leading-relaxed">
              <strong>Wist je dat?</strong> Omdat de maan geen atmosfeer, wind of regen heeft, zullen de
              bandensporen van de CubeRover miljoenen jaren zichtbaar blijven. Het wordt letterlijk het
              grootste en langstlevende wiskundige diagram in het zonnestelsel!
            </p>
          </div>
        </motion.div>
      </div>

      {/* Live Mission Tracker */}
      <div>
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2"
        >
          <Radio className="w-5 h-5 text-red-500" />
          Live Missie-Tracker – Griffin-1 / CubeRover
        </motion.h3>
        <MissionTracker />
      </div>
    </div>
  );
}
