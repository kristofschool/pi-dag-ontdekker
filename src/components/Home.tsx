import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calculator, Globe, Trophy, Info, Waves, Rocket, Triangle } from 'lucide-react';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      let piDay = new Date(now.getFullYear(), 2, 14); // March 14
      if (now > piDay) {
        piDay = new Date(now.getFullYear() + 1, 2, 14);
      }
      const difference = piDay.getTime() - now.getTime();
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
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

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-8 text-white text-center shadow-xl"
      >
        <h2 className="text-2xl font-semibold mb-6">Aftellen tot Pi-Dag (14 Maart)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { label: 'Dagen', value: timeLeft.days },
            { label: 'Uren', value: timeLeft.hours },
            { label: 'Minuten', value: timeLeft.minutes },
            { label: 'Seconden', value: timeLeft.seconds }
          ].map((item, i) => (
            <div key={i} className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-3xl md:text-5xl font-bold font-mono">{item.value}</div>
              <div className="text-sm md:text-base mt-2 opacity-80 uppercase tracking-wider">{item.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

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
