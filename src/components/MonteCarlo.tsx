import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Square, RotateCcw } from 'lucide-react';

export default function MonteCarlo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [insidePoints, setInsidePoints] = useState(0);
  const animationRef = useRef<number>();

  const estimatedPi = totalPoints > 0 ? (4 * insidePoints) / totalPoints : 0;

  const drawPoint = (ctx: CanvasRenderingContext2D, x: number, y: number, inside: boolean, width: number, height: number) => {
    const cx = x * width;
    const cy = height - y * height;
    ctx.fillStyle = inside ? '#10b981' : '#ef4444'; // emerald-500 vs red-500
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawBase = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    // Draw square
    ctx.strokeStyle = '#cbd5e1'; // slate-300
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    // Draw quarter circle
    ctx.beginPath();
    ctx.arc(0, height, width, 0, -Math.PI / 2, true);
    ctx.stroke();
  };

  const reset = () => {
    setIsRunning(false);
    setTotalPoints(0);
    setInsidePoints(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawBase(ctx, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawBase(ctx, canvas.width, canvas.height);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let currentTotal = totalPoints;
    let currentInside = insidePoints;

    const loop = () => {
      // Add 100 points per frame for speed
      for (let i = 0; i < 100; i++) {
        const x = Math.random();
        const y = Math.random();
        const inside = x * x + y * y <= 1;
        
        currentTotal++;
        if (inside) currentInside++;
        
        drawPoint(ctx, x, y, inside, canvas.width, canvas.height);
      }
      
      setTotalPoints(currentTotal);
      setInsidePoints(currentInside);
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-800">Schat Pi met Willekeur!</h2>
        <p className="text-slate-600">
          Dit is de <strong>Monte Carlo methode</strong>. We gooien willekeurige puntjes in een vierkant. 
          De verhouding van de puntjes die binnen de kwartcirkel vallen ten opzichte van het totaal, 
          komt overeen met de verhouding van hun oppervlaktes (π/4).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={300} 
            className="bg-slate-50 rounded-lg shadow-inner mb-6 w-full max-w-[300px] aspect-square"
          />
          
          <div className="flex gap-4">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-colors ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary-600 hover:bg-primary-700'}`}
            >
              {isRunning ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isRunning ? 'Pauze' : 'Start'}
            </button>
            <button 
              onClick={reset}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Totaal aantal punten</div>
            <div className="text-3xl font-mono font-bold text-slate-800">{totalPoints.toLocaleString('nl-NL')}</div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-sm text-emerald-600 uppercase tracking-wider font-semibold mb-1">Punten in cirkel</div>
            <div className="text-3xl font-mono font-bold text-emerald-600">{insidePoints.toLocaleString('nl-NL')}</div>
          </div>

          <motion.div 
            animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-primary-600 p-6 rounded-2xl shadow-lg text-white"
          >
            <div className="text-sm text-primary-200 uppercase tracking-wider font-semibold mb-1">Geschatte waarde van Pi</div>
            <div className="text-5xl font-mono font-bold">
              {estimatedPi.toFixed(5)}
            </div>
            <div className="mt-2 text-primary-200 text-sm">
              Echte Pi: 3.14159...
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
