import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Rocket, Moon, Orbit } from 'lucide-react';

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
    
    // Moon surface background
    const drawMoonSurface = () => {
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw some craters
      ctx.fillStyle = '#334155'; // slate-700
      ctx.beginPath(); ctx.arc(50, 50, 20, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(250, 80, 35, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(80, 220, 15, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(280, 250, 25, 0, Math.PI * 2); ctx.fill();
      
      // Draw the intended path (faint)
      ctx.strokeStyle = '#475569'; // slate-600
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const animate = () => {
      if (!isCalculating) {
        drawMoonSurface();
        // Draw lander at start
        drawLander(centerX + radius, centerY, 0);
        return;
      }

      drawMoonSurface();

      // Draw path driven so far
      ctx.strokeStyle = '#e5738c'; // primary-400
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, angle);
      ctx.stroke();

      // Calculate current position
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Draw lander
      drawLander(x, y, angle);

      // Update stats
      const currentDistance = angle * radius;
      const currentDiameter = radius * 2;
      setDistance(Math.round(currentDistance));
      setDiameter(Math.round(currentDiameter));
      
      if (angle > 0) {
        // Pi = Circumference / Diameter
        // Circumference for full circle is 2*pi*r. 
        // We estimate Pi by taking the distance driven when a full circle is completed.
        // Or continuously: distance / (diameter * (angle / (2*PI))) -> which is just Pi.
        // Let's add some "sensor noise" to make it look like a real measurement
        const noise = (Math.random() - 0.5) * 0.05 * (1 / (angle + 0.1));
        const currentPi = (currentDistance / (currentDiameter * (angle / (2 * Math.PI)))) + noise;
        setPiEstimate(currentPi);
      }

      angle += 0.02;

      if (angle <= Math.PI * 2) {
        animationId = requestAnimationFrame(animate);
      } else {
        // Finished
        setPiEstimate(Math.PI);
        setIsCalculating(false);
      }
    };

    const drawLander = (x: number, y: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation + Math.PI / 2); // Point forward along the path
      
      // Draw a simple rover
      ctx.fillStyle = '#cbd5e1'; // slate-300
      ctx.fillRect(-10, -15, 20, 30);
      
      // Wheels
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(-14, -10, 4, 8);
      ctx.fillRect(10, -10, 4, 8);
      ctx.fillRect(-14, 5, 4, 8);
      ctx.fillRect(10, 5, 4, 8);
      
      // Solar panel / antenna
      ctx.fillStyle = '#fbbf24'; // amber-400
      ctx.fillRect(-5, -5, 10, 10);
      
      ctx.restore();
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
    <div className="space-y-8">
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
          Wiskundige Matt Parker (Stand-up Maths) heeft een episch plan: hij gaat letterlijk Pi op de maan berekenen! 
          Via zijn <a href="https://www.kickstarter.com/projects/standupmaths/moon-pi-were-going-to-calculate-on-the-moon" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 font-semibold underline">Moon Pi Kickstarter</a> huurt hij een echte maanrover (de FLEX rover van Astrolab) in. 
          De missie? Een perfecte cirkel rijden in het maanstof, de omtrek meten en delen door de diameter.
        </p>
      </div>

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
                  onClick={() => {
                    setIsCalculating(true);
                    setHasStarted(true);
                  }}
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
              Missie Telemetrie
            </h3>
            
            <div className="space-y-4 font-mono">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Afgelegde afstand (Omtrek):</span>
                <span className="text-lg font-bold text-slate-800">{distance} m</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Diameter van de krater:</span>
                <span className="text-lg font-bold text-slate-800">{diameter} m</span>
              </div>
              
              <div className="mt-6 p-4 bg-primary-50 border border-primary-100 rounded-xl">
                <div className="text-sm text-primary-600 font-sans font-semibold mb-1 uppercase tracking-wider">Berekende Pi Waarde</div>
                <div className="text-4xl font-bold text-primary-600">
                  {piEstimate === 0 ? "---" : piEstimate.toFixed(5)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <p className="text-slate-600 text-sm leading-relaxed">
              <strong>Wist je dat?</strong> Omdat de maan geen atmosfeer, wind of regen heeft, zullen de bandensporen van deze berekening miljoenen jaren zichtbaar blijven. Het wordt letterlijk het grootste en langstlevende wiskundige diagram in het zonnestelsel!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
