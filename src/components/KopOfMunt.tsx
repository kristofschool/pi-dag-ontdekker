import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Square, RotateCcw } from 'lucide-react';

const MAX_LOGS = 5;

interface LogEntry {
  reeksNummer: number;
  flips: string[];
  verhouding: number;
}

export default function KopOfMunt() {
  const [aantalFlips, setAantalFlips] = useState(100000);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);

  // Results
  const [totaleKop, setTotaleKop] = useState<number | null>(null);
  const [totaleMunt, setTotaleMunt] = useState<number | null>(null);
  const [aantalVerhoudingen, setAantalVerhoudingen] = useState<number | null>(null);
  const [gemiddelde, setGemiddelde] = useState<number | null>(null);
  const [eindResultaat, setEindResultaat] = useState<number | null>(null);
  const [logData, setLogData] = useState<LogEntry[]>([]);

  const rafRef = useRef<number>();

  const reset = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsRunning(false);
    setProgress(0);
    setTotaleKop(null);
    setTotaleMunt(null);
    setAantalVerhoudingen(null);
    setGemiddelde(null);
    setEindResultaat(null);
    setLogData([]);
    setError(false);
  };

  const startSimulatie = () => {
    if (isNaN(aantalFlips) || aantalFlips <= 0) {
      setError(true);
      return;
    }
    setError(false);
    reset();

    // Give React one tick to clear state, then start
    setTimeout(() => {
      setIsRunning(true);
      runSimulatie(aantalFlips);
    }, 0);
  };

  const runSimulatie = (totaalFlips: number) => {
    let totKop = 0;
    let totMunt = 0;
    let serieKop = 0;
    let serieMunt = 0;
    let serieFlips = 0;
    let somVerhoudingen = 0;
    let aantalVerh = 0;
    let huidigeFlip = 1;

    const logs: LogEntry[] = [];
    let currentSerieFlips: string[] = [];

    const chunkSize = Math.max(10000, Math.floor(totaalFlips / 100));

    const processChunk = () => {
      const eindeChunk = Math.min(huidigeFlip + chunkSize - 1, totaalFlips);

      for (; huidigeFlip <= eindeChunk; huidigeFlip++) {
        serieFlips++;
        const isKop = Math.random() < 0.5;

        if (isKop) { serieKop++; totKop++; }
        else { serieMunt++; totMunt++; }

        if (aantalVerh < MAX_LOGS) {
          currentSerieFlips.push(isKop ? 'K' : 'M');
        }

        if (serieKop > serieMunt) {
          const verhouding = serieKop / serieFlips;
          somVerhoudingen += verhouding;

          if (aantalVerh < MAX_LOGS) {
            logs.push({
              reeksNummer: aantalVerh + 1,
              flips: [...currentSerieFlips],
              verhouding,
            });
            currentSerieFlips = [];
          }

          aantalVerh++;
          serieKop = 0;
          serieMunt = 0;
          serieFlips = 0;
        }
      }

      setProgress(Math.min(((huidigeFlip - 1) / totaalFlips) * 100, 100));

      if (huidigeFlip <= totaalFlips) {
        rafRef.current = requestAnimationFrame(processChunk);
      } else {
        // Done
        const gem = aantalVerh > 0 ? somVerhoudingen / aantalVerh : 0;
        setTotaleKop(totKop);
        setTotaleMunt(totMunt);
        setAantalVerhoudingen(aantalVerh);
        setGemiddelde(gem);
        setEindResultaat(gem * 4);
        setLogData(logs);
        setIsRunning(false);
        setProgress(100);
      }
    };

    rafRef.current = requestAnimationFrame(processChunk);
  };

  const hasResult = eindResultaat !== null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-800">Kop of Munt Simulatie</h2>
        <p className="text-slate-600">
          Gooi een munt op. Elke keer dat er <strong>meer kop dan munt</strong> is, noteer je de verhouding (kop/totaal).
          Het gemiddelde van al die verhoudingen × 4 benadert Pi!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left: Controls */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Hoeveel keer opgooien?
            </label>
            <input
              type="number"
              value={aantalFlips}
              min={1}
              step={10000}
              disabled={isRunning}
              onChange={(e) => setAantalFlips(parseInt(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-lg font-mono disabled:opacity-60"
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">Voer een geldig getal groter dan 0 in.</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={isRunning ? undefined : startSimulatie}
              disabled={isRunning}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-colors ${isRunning ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
            >
              {isRunning ? (
                <>
                  <Square className="w-5 h-5 animate-pulse" />
                  Bezig...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start
                </>
              )}
            </button>
            <button
              onClick={reset}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>

          {/* Progress bar */}
          {(isRunning || progress > 0) && (
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Voortgang</span>
                <span>{Math.floor(progress)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Visual log */}
          {hasResult && logData.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Eerste {logData.length} reeksen (kop &gt; munt):
              </h3>
              <div className="space-y-3 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-64 overflow-y-auto custom-scrollbar">
                {logData.map((log) => {
                  const maxWeergave = 24;
                  const shown = log.flips.slice(0, maxWeergave);
                  const extra = log.flips.length - maxWeergave;
                  return (
                    <div key={log.reeksNummer} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-600 text-xs">Reeks {log.reeksNummer}</span>
                        <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                          {log.verhouding.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {shown.map((flip, i) => (
                          <span
                            key={i}
                            className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold shadow-sm ${
                              flip === 'K' ? 'bg-primary-500' : 'bg-slate-400'
                            }`}
                          >
                            {flip}
                          </span>
                        ))}
                        {extra > 0 && (
                          <span className="text-slate-400 text-xs self-center italic">+{extra}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Stats */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Aantal Kop</div>
            <div className="text-3xl font-mono font-bold text-slate-800">
              {totaleKop !== null ? totaleKop.toLocaleString('nl-NL') : '—'}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Aantal Munt</div>
            <div className="text-3xl font-mono font-bold text-slate-800">
              {totaleMunt !== null ? totaleMunt.toLocaleString('nl-NL') : '—'}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Keer dat Kop &gt; Munt was
            </div>
            <div className="text-3xl font-mono font-bold text-slate-800">
              {aantalVerhoudingen !== null ? aantalVerhoudingen.toLocaleString('nl-NL') : '—'}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Gemiddelde verhouding</span>
            <span className="font-mono font-bold text-slate-900">
              {gemiddelde !== null ? gemiddelde.toFixed(6) : '—'}
            </span>
          </div>

          <motion.div
            animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-primary-600 p-6 rounded-2xl shadow-lg text-white"
          >
            <div className="text-sm text-primary-200 uppercase tracking-wider font-semibold mb-1">
              Geschatte waarde van Pi
            </div>
            <div className="text-5xl font-mono font-bold">
              {eindResultaat !== null ? eindResultaat.toFixed(5) : '0.00000'}
            </div>
            <div className="mt-2 text-primary-200 text-sm">
              Formule: Gemiddelde × 4
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
