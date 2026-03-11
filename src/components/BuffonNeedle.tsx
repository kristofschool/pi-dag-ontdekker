import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Square, RotateCcw } from 'lucide-react';

export default function BuffonNeedle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [totalNeedles, setTotalNeedles] = useState(0);
  const [crossingNeedles, setCrossingNeedles] = useState(0);
  const animationRef = useRef<number>();

  const estimatedPi = crossingNeedles > 0 ? (2 * totalNeedles) / crossingNeedles : 0;

  const drawBase = (ctx: CanvasRenderingContext2D, width: number, height: number, spacing: number) => {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#cbd5e1'; // slate-300
    ctx.lineWidth = 2;
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawNeedle = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, length: number, crosses: boolean) => {
    const x1 = x - (length / 2) * Math.cos(angle);
    const y1 = y - (length / 2) * Math.sin(angle);
    const x2 = x + (length / 2) * Math.cos(angle);
    const y2 = y + (length / 2) * Math.sin(angle);

    ctx.strokeStyle = crosses ? '#ef4444' : '#10b981'; // red if crosses, emerald if not
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const reset = () => {
    setIsRunning(false);
    setTotalNeedles(0);
    setCrossingNeedles(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawBase(ctx, canvas.width, canvas.height, 40);
    }
  };

  useEffect(() => {
    reset();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const spacing = 40; // t
    const length = 40;  // L (we set L = t for simplicity)

    let currentTotal = totalNeedles;
    let currentCrossing = crossingNeedles;

    const loop = () => {
      // Drop 5 needles per frame
      for (let i = 0; i < 5; i++) { 
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const angle = Math.random() * Math.PI;

        const y1 = y - (length / 2) * Math.sin(angle);
        const y2 = y + (length / 2) * Math.sin(angle);

        // Check if it crosses a horizontal line
        const crosses = Math.floor(y1 / spacing) !== Math.floor(y2 / spacing);

        currentTotal++;
        if (crosses) currentCrossing++;

        drawNeedle(ctx, x, y, angle, length, crosses);
      }
      
      setTotalNeedles(currentTotal);
      setCrossingNeedles(currentCrossing);
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
        <h2 className="text-3xl font-bold text-slate-800">De Naald van Buffon</h2>
        <p className="text-slate-600">
          In 1733 bedacht Georges-Louis Leclerc, graaf van Buffon, dit experiment. 
          Als je naalden laat vallen op een vel papier met lijnen, kun je Pi berekenen! 
          De kans dat een naald een lijn raakt is precies <strong className="font-mono">2/π</strong> (als de naald even lang is als de afstand tussen de lijnen).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={320} 
            className="bg-slate-50 rounded-lg shadow-inner mb-6 w-full max-w-[300px]"
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
            <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Totaal aantal naalden</div>
            <div className="text-3xl font-mono font-bold text-slate-800">{totalNeedles.toLocaleString('nl-NL')}</div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-sm text-red-500 uppercase tracking-wider font-semibold mb-1">Naalden op een lijn</div>
            <div className="text-3xl font-mono font-bold text-red-500">{crossingNeedles.toLocaleString('nl-NL')}</div>
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
              Formule: (2 × Totaal) / Op een lijn
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
