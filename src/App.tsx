/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Target, Search, Gamepad2, AlignJustify, Youtube, Rocket, Coins } from 'lucide-react';
import Home from './components/Home';
import MonteCarlo from './components/MonteCarlo';
import BuffonNeedle from './components/BuffonNeedle';
import BirthdaySearch from './components/BirthdaySearch';
import PiGame from './components/PiGame';
import Videos from './components/Videos';
import LunarLander from './components/LunarLander';
import KopOfMunt from './components/KopOfMunt';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');

  const sections = [
    { id: 'home', label: 'Ontdek', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'montecarlo', label: 'Monte Carlo', icon: <Target className="w-5 h-5" /> },
    { id: 'buffon', label: 'Naald van Buffon', icon: <AlignJustify className="w-5 h-5" /> },
    { id: 'kopmunt', label: 'Kop of Munt', icon: <Coins className="w-5 h-5" /> },
    { id: 'birthday', label: 'Zoek in Pi', icon: <Search className="w-5 h-5" /> },
    { id: 'game', label: 'Daag uit', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: 'videos', label: "Video's", icon: <Youtube className="w-5 h-5" /> },
    { id: 'lunar', label: 'Maanlander', icon: <Rocket className="w-5 h-5" /> },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory bg-slate-50 font-sans text-slate-900 custom-scrollbar">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between py-3 lg:py-4 gap-3 lg:gap-4 w-full">
            <div className="flex items-center gap-3 shrink-0">
              <img 
                src="https://sjsp.be/wp-content/uploads/sjsp-logo.png" 
                alt="SJSP Logo" 
                className="h-8 sm:h-10 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="text-lg sm:text-xl font-bold text-slate-800 whitespace-nowrap">Pi-Dag Ontdekker</span>
            </div>
            
            <nav className="flex w-full lg:w-auto overflow-x-auto justify-start lg:justify-end gap-1 sm:space-x-1 bg-slate-100/80 p-1 rounded-xl hide-scrollbar">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex shrink-0 items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeSection === section.id 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                  title={section.label}
                >
                  {section.icon}
                  <span className="inline">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="home" className="snap-start scroll-mt-20 sm:scroll-mt-24 min-h-[calc(100vh-8rem)] flex flex-col justify-center py-12">
          <Home />
        </section>
        
        <section id="montecarlo" className="snap-start scroll-mt-20 sm:scroll-mt-24 min-h-screen flex flex-col justify-center py-12">
          <MonteCarlo />
        </section>
        
        <section id="buffon" className="snap-start scroll-mt-20 sm:scroll-mt-24 min-h-screen flex flex-col justify-center py-12">
          <BuffonNeedle />
        </section>
        
        <section id="kopmunt" className="snap-start scroll-mt-20 sm:scroll-mt-24 min-h-screen flex flex-col justify-center py-12">
          <KopOfMunt />
        </section>
        
        <section id="birthday" className="snap-start scroll-mt-20 sm:scroll-mt-24 min-h-screen flex flex-col justify-center py-12">
          <BirthdaySearch />
        </section>
        
        <section id="game" className="snap-start scroll-mt-20 sm:scroll-mt-24 min-h-screen flex flex-col justify-center py-12">
          <PiGame />
        </section>
        
        <section id="videos" className="snap-start scroll-mt-20 sm:scroll-mt-24 min-h-screen flex flex-col justify-center py-12">
          <Videos />
        </section>

        <section id="lunar" className="snap-start scroll-mt-20 sm:scroll-mt-24 min-h-screen flex flex-col justify-center py-12">
          <LunarLander />
        </section>
      </main>

      {/* Global Footer */}
      <footer className="snap-start bg-slate-900 text-slate-400 py-8 text-center">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4">
          <img 
            src="https://sjsp.be/wp-content/uploads/sjsp-logo.png" 
            alt="SJSP Logo" 
            className="h-12 object-contain opacity-80 hover:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
          />
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Kristof De Beer | Sint-Jozef Sint-Pieter Blankenberge
          </p>
        </div>
      </footer>
    </div>
  );
}
