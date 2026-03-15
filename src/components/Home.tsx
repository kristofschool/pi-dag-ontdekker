import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Globe, Trophy, Info, Waves, Rocket, Triangle, Pi } from 'lucide-react';

// π = 3.14159265358979...
// De "pi-dag-momenten" zijn de tijdstippen waarop het exact
//   314.159... dagen, 31.4159... dagen, 3.14159... dagen, 0.314159... dagen
// tot Pi-dag (14 maart) duurt.
//
// 0.314159... dagen = 314.159... * 86400 / 1000 seconden = 27143,... seconden
// We draaien de lijst van groot naar klein zodat elk jaar door alle niveaus
// heen wordt geteld.

const PI = Math.PI; // 3.14159265358979...

// De 4 schaalfactoren: 100, 10, 1, 0.1 × π
const PI_LEVELS = [
  { factor: 100, label: '314 dagen', digits: '314' },
  { factor: 10,  label: '31 dagen',  digits: '31'  },
  { factor: 1,   label: '3 dagen',   digits: '3'   },
  { factor: 0.1, label: '7 uur',     digits: '0'   },
];

/** Geeft de volgende Pi-dag (14 maart) ná de gegeven datum terug */
function nextPiDay(from: Date): Date {
  const piDay = new Date(from.getFullYear(), 2, 14, 9, 26, 53); // 9:26:53 = Pi-moment
  return piDay > from ? piDay : new Date(from.getFullYear() + 1, 2, 14, 9, 26, 53);
}

/**
 * Bereken alle eerstvolgende "π × 10^n dagen voor Pi-dag" momenten.
 * Voor elk niveau zoeken we het moment M zodat:
 *   piDay.getTime() - M.getTime() = factor × π × 86400000 (ms)
 */
function computePiMoments(now: Date): { factor: number; target: Date; piDay: Date; ms: number }[] {
  const results: { factor: number; target: Date; piDay: Date; ms: number }[] = [];

  // Probeer voor zowel dit jaar als volgend jaar Pi-dag
  for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
    const baseYear = now.getFullYear() + yearOffset;
    const piDay = new Date(baseYear, 2, 14, 9, 26, 53);

    for (const level of PI_LEVELS) {
      const msBeforePiDay = level.factor * PI * 24 * 60 * 60 * 1000;
      const target = new Date(piDay.getTime() - msBeforePiDay);
      if (target > now) {
        results.push({ factor: level.factor, target, piDay, ms: target.getTime() - now.getTime() });
      }
    }
  }

  // Sorteer op dichtstbijzijnde moment eerst
  results.sort((a, b) => a.ms - b.ms);
  return results;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function msToTimeLeft(ms: number): TimeLeft {
  return {
    days: Math.floor(ms / (1000 * 60 * 60 * 24)),
    hours: Math.floor((ms / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((ms / (1000 * 60)) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

function pad(n: number, digits = 2) {
  return String(n).padStart(digits, '0');
}

/** Label voor het "π × factor dagen voor Pi-dag"-niveau */
function piLabel(factor: number): string {
  if (factor === 100) return '314,159… dagen';
  if (factor === 10)  return '31,4159… dagen';
  if (factor === 1)   return '3,14159… dagen';
  return '0,314159… dagen (≈ 7u 33min)';
}

function piDigitsShown(factor: number): string {
  if (factor === 100) return '3 1 4';
  if (factor === 10)  return '3 1 . 4';
  if (factor === 1)   return '3 . 1 4';
  return '0 . 3 1 4';
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  // Standaard countdown naar Pi-dag
  const [piDayLeft, setPiDayLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  // Huidig π-moment
  const [currentMoment, setCurrentMoment] = useState<{ factor: number; target: Date; piDay: Date } | null>(null);
  const [allMoments, setAllMoments] = useState<{ factor: number; target: Date; piDay: Date; ms: number }[]>([]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();

      // Standaard Pi-dag countdown
      const piDay = nextPiDay(now);
      const piDayMs = piDay.getTime() - now.getTime();
      setPiDayLeft(msToTimeLeft(piDayMs));

      // π-momenten
      const moments = computePiMoments(now);
      setAllMoments(moments);
      if (moments.length > 0) {
        const next = moments[0];
        setCurrentMoment(next);
        setTimeLeft(msToTimeLeft(next.ms));
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const facts = [
    {
      icon: <Info className="w-6 h-6 text-primary-500" />,
      title: "Wat is Pi?",
      desc: "Pi (π) is de verhouding tussen de omtrek en de diameter van een cirkel. Het is altijd ongeveer 3,14159, ongeacht hoe groot de cirkel is!"
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-500" />,
      title: "Oneindig en Onvoorspelbaar",
      desc: "Pi is een irrationaal getal. Dit betekent dat de cijfers achter de komma oneindig doorgaan zonder dat er ooit een herhalend patroon ontstaat."
    },
    {
      icon: <Trophy className="w-6 h-6 text-amber-500" />,
      title: "Wereldrecord",
      desc: "Het wereldrecord voor het uit het hoofd opzeggen van pi staat op naam van Rajveer Meena, die in 2015 maar liefst 70.000 decimalen wist op te noemen!"
    },
    {
      icon: <Calculator className="w-6 h-6 text-rose-500" />,
      title: "Supercomputers",
      desc: "In 2024 hebben supercomputers pi berekend tot meer dan 105 biljoen decimalen. Dit kostte maanden aan rekenkracht!"
    },
    {
      icon: <Waves className="w-6 h-6 text-cyan-500" />,
      title: "Rivieren en Pi",
      desc: "De mate waarin een rivier kronkelt (de meander-ratio) is gemiddeld over de hele wereld ongeveer gelijk aan Pi! Dit werd ontdekt door Albert Einstein."
    },
    {
      icon: <Rocket className="w-6 h-6 text-purple-500" />,
      title: "Pi in de Ruimte",
      desc: "NASA gebruikt slechts 15 decimalen van Pi voor hun interplanetaire navigatie. Dat is precies genoeg om de positie van een ruimteschip tot op een paar centimeter nauwkeurig te berekenen!"
    },
    {
      icon: <Triangle className="w-6 h-6 text-orange-500" />,
      title: "De Piramide van Cheops",
      desc: "Als je de omtrek van de basis van de Grote Piramide van Gizeh deelt door de hoogte, krijg je ongeveer 2 keer Pi. Toeval of briljante architectuur?"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <img
            src="https://sjsp.be/wp-content/uploads/sjsp-logo.png"
            alt="Sint-Jozef Sint-Pieter Blankenberge"
            className="h-24 object-contain drop-shadow-md"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-slate-800"
        >
          Welkom bij de <span className="text-primary-600">Pi-Dag Ontdekker</span>!
        </motion.h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Ontdek de magie van het beroemdste getal ter wereld: 3,14159...
        </p>
      </div>

      {/* Standaard Pi-dag countdown */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-8 text-white text-center shadow-xl"
      >
        <h2 className="text-2xl font-semibold mb-6">Aftellen tot Pi-Dag (14 Maart)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { label: 'Dagen',    value: piDayLeft.days },
            { label: 'Uren',     value: piDayLeft.hours },
            { label: 'Minuten',  value: piDayLeft.minutes },
            { label: 'Seconden', value: piDayLeft.seconds }
          ].map((item, i) => (
            <div key={i} className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-3xl md:text-5xl font-bold font-mono">{item.value}</div>
              <div className="text-sm md:text-base mt-2 opacity-80 uppercase tracking-wider">{item.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* π-dag momenten */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Pi className="w-7 h-7 text-primary-300" />
            <h2 className="text-xl font-bold">De π-Dag Momenten</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Er is niet één Pi-dag per jaar — er zijn er <strong className="text-white">vier</strong>! 
            Op elk moment dat het <em>exact π × 10ⁿ dagen</em> duurt tot 14 maart, 
            kun je al een beetje Pi-dag vieren. 🎉
          </p>
        </div>

        {/* Eerstvolgende π-moment highlight */}
        {currentMoment && (
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-500">Volgend π-moment</span>
              <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                nog {piLabel(currentMoment.factor)}
              </span>
            </div>
            <p className="text-slate-500 text-xs mb-4">
              Op <strong className="text-slate-700">
                {currentMoment.target.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </strong> om <strong className="text-slate-700">
                {pad(currentMoment.target.getHours())}:{pad(currentMoment.target.getMinutes())}:{pad(currentMoment.target.getSeconds())}
              </strong> is het precies <span className="font-mono font-bold text-primary-600">{currentMoment.factor * PI | 0},{((currentMoment.factor * PI) % 1).toFixed(5).slice(2)}…</span> dagen tot Pi-dag.
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentMoment.factor}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                {[
                  { label: 'Dagen',    value: timeLeft.days },
                  { label: 'Uren',     value: timeLeft.hours },
                  { label: 'Minuten',  value: timeLeft.minutes },
                  { label: 'Seconden', value: timeLeft.seconds }
                ].map((item, i) => (
                  <div key={i} className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-2xl p-4 text-center">
                    <div className="text-2xl md:text-4xl font-bold font-mono text-primary-700">{pad(item.value)}</div>
                    <div className="text-xs mt-1 text-primary-500 uppercase tracking-wider font-semibold">{item.label}</div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Alle π-momenten van dit jaar */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Alle π-momenten dit jaar</h3>
          <div className="space-y-3">
            {allMoments.slice(0, 8).map((m, i) => {
              const isNext = i === 0;
              const isPast = m.ms <= 0;
              const daysBeforePiDay = m.factor * PI;
              return (
                <div
                  key={`${m.factor}-${m.piDay.getFullYear()}`}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    isNext
                      ? 'border-primary-200 bg-primary-50'
                      : isPast
                      ? 'border-slate-100 bg-slate-50 opacity-50'
                      : 'border-slate-100 bg-white hover:bg-slate-50'
                  }`}
                >
                  {/* π × 10ⁿ visualisatie */}
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black font-mono ${
                    isNext ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {piDigitsShown(m.factor)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm">
                      {daysBeforePiDay.toFixed(5)}… dagen voor Pi-dag {m.piDay.getFullYear()}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {m.target.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })} om {pad(m.target.getHours())}:{pad(m.target.getMinutes())}:{pad(m.target.getSeconds())}
                    </div>
                  </div>
                  <div className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                    isNext
                      ? 'bg-primary-600 text-white'
                      : isPast
                      ? 'bg-slate-200 text-slate-500'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isNext ? '← nu' : isPast ? 'voorbij' : 'komend'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Facts grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {facts.map((fact, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                {fact.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{fact.title}</h3>
                <p className="text-slate-600 leading-relaxed">{fact.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
