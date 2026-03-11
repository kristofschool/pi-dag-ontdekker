import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Keyboard, Globe, Medal, AlertCircle, Instagram } from 'lucide-react';

const PI_DECIMALS = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446854256768146116246929199";

const BAD_WORDS = ['kut', 'lul', 'slet', 'hoer', 'kanker', 'tyfus', 'tering', 'mongool', 'klootzak', 'fuck', 'shit', 'bitch', 'dick', 'pussy', 'cunt', 'whore', 'slut', 'asshole', 'nigger', 'nigga', 'fag', 'faggot', 'penis', 'vagina', 'porno', 'porn'];

const containsProfanity = (text: string) => {
  const lower = text.toLowerCase();
  const noSpaces = lower.replace(/[\s_.-]+/g, '');
  
  // Check exact words with boundaries
  const hasWord = BAD_WORDS.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lower));
  
  // Check for longer bad words even if they try to bypass with spaces (e.g. "k a n k e r")
  const longBadWords = ['kanker', 'tyfus', 'tering', 'mongool', 'klootzak', 'asshole', 'faggot', 'bitch', 'pussy'];
  const hasHiddenWord = longBadWords.some(word => noSpaces.includes(word));
  
  return hasWord || hasHiddenWord;
};

interface LeaderboardEntry {
  userName: string;
  score: number;
}

export default function PiGame() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'playing' | 'gameover'>('playing');
  const [highScore, setHighScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Leaderboard state
  const [playerName, setPlayerName] = useState('');
  const [nameError, setNameError] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('piHighScore');
    if (saved) setHighScore(parseInt(saved, 10));
    
    const savedName = localStorage.getItem('piPlayerName');
    if (savedName) {
      setPlayerName(savedName);
      setIsJoined(true);
    }
  }, []);

  // Fetch leaderboard periodically if joined
  useEffect(() => {
    if (!isJoined) return;

    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`/api/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [isJoined]);

  const submitScore = async (score: number) => {
    if (!isJoined || !playerName || score === 0) return;
    
    try {
      await fetch(`/api/leaderboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, score })
      });
      
      // Fetch immediately after submitting
      const res = await fetch(`/api/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error("Failed to submit score", err);
    }
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (status === 'gameover') return;
    
    // Alleen cijfers toestaan
    const val = e.target.value.replace(/\D/g, '');
    
    // Voorkom copy-paste van meerdere cijfers tegelijk
    if (val.length > input.length + 1) {
      return;
    }
    
    // Controleer of de nieuwe input overeenkomt met Pi
    if (val === PI_DECIMALS.substring(0, val.length)) {
      setInput(val);
    } else {
      // Fout gemaakt!
      setStatus('gameover');
      const finalScore = input.length;
      
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('piHighScore', finalScore.toString());
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
      
      // Submit score to leaderboard if active
      submitScore(finalScore);
    }
  };

  const resetGame = () => {
    setInput('');
    setStatus('playing');
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const joinLeaderboard = (e: React.FormEvent) => {
    e.preventDefault();
    const name = playerName.trim();
    
    if (containsProfanity(name)) {
      setNameError("Houd het netjes! Kies een andere naam.");
      return;
    }
    
    setNameError('');
    if (name) {
      setIsJoined(true);
      localStorage.setItem('piPlayerName', name);
      
      // Submit current high score to the leaderboard if it's > 0
      if (highScore > 0) {
        submitScore(highScore);
      }
    }
  };

  const leaveLeaderboard = () => {
    setIsJoined(false);
    setLeaderboard([]);
    localStorage.removeItem('piPlayerName');
  };

  const shareToInstagram = async () => {
    const text = `Ik heb zojuist ${input.length} decimalen van Pi onthouden in De Grote Pi Uitdaging! Kan jij mij verslaan? 🥧🧠`;
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mijn Pi Highscore!',
          text: text,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(`${text} ${url}`);
      alert("Score gekopieerd naar je klembord! Je kan dit nu plakken in Instagram of een andere app.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-800">Leven Pi-dag!</h2>
        <p className="text-slate-600">
          Hoeveel decimalen van Pi ken jij uit je hoofd? Typ ze in en zie je reeks groeien!
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 text-center space-y-8">
          <div className="flex justify-center items-center gap-8">
            <div className="space-y-1">
              <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Huidige Score</div>
              <div className="text-4xl font-bold text-primary-600">{input.length}</div>
            </div>
            <div className="w-px h-12 bg-slate-200"></div>
            <div className="space-y-1">
              <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1 justify-center">
                <Trophy className="w-4 h-4 text-amber-500" /> Record
              </div>
              <div className="text-4xl font-bold text-slate-800">{highScore}</div>
            </div>
          </div>

          {/* Zichtbare decimalen weergave */}
          <div 
            className="relative max-w-2xl mx-auto text-left bg-slate-50 p-6 rounded-2xl border border-slate-200 min-h-[200px] cursor-text shadow-inner"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="text-2xl md:text-3xl font-mono break-all leading-relaxed tracking-wide">
              <span className="text-slate-800 font-bold">3,</span>
              <span className="text-emerald-600 font-medium">{input}</span>
              {status === 'gameover' && (
                <span className="text-red-500 font-bold underline decoration-red-500 decoration-4 underline-offset-4">
                  {PI_DECIMALS[input.length]}
                </span>
              )}
              {status === 'playing' && (
                <span className="animate-pulse text-primary-400 border-b-4 border-primary-400 ml-1">_</span>
              )}
            </div>
            
            {status === 'playing' && input.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="flex items-center gap-2 text-slate-500 font-sans">
                  <Keyboard className="w-6 h-6" />
                  <span>Begin met typen... (1415...)</span>
                </div>
              </div>
            )}

            {/* Verborgen input veld voor mobiel toetsenbord en focus */}
            <input 
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInput}
              onPaste={(e) => e.preventDefault()}
              disabled={status === 'gameover'}
              className="absolute opacity-0 w-0 h-0"
              autoFocus
            />
          </div>

          {status === 'gameover' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-red-500 font-medium text-lg bg-red-50 inline-block px-6 py-3 rounded-xl border border-red-100">
                Oeps! Het volgende cijfer moest een <strong>{PI_DECIMALS[input.length]}</strong> zijn.
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={resetGame}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                >
                  <RefreshCw className="w-5 h-5" />
                  Probeer Opnieuw
                </button>
                <button 
                  onClick={shareToInstagram}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                >
                  <Instagram className="w-5 h-5" />
                  Deel Score
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Leaderboard Sidebar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xl">
            <Globe className="w-6 h-6 text-primary-500" />
            <h3>Wereldwijde Highscores</h3>
          </div>

          {!isJoined ? (
            <form onSubmit={joinLeaderboard} className="space-y-4">
              <p className="text-sm text-slate-600">
                Doe mee met de wereldwijde competitie! Vul je naam in om je scores te delen.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Jouw Naam</label>
                  <input 
                    type="text" 
                    required
                    maxLength={20}
                    value={playerName}
                    onChange={(e) => {
                      setPlayerName(e.target.value);
                      setNameError('');
                    }}
                    className={`w-full px-4 py-2 bg-slate-50 border ${nameError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-primary-500'} rounded-xl focus:outline-none focus:ring-2`}
                    placeholder="Bijv. Einstein"
                  />
                  {nameError && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {nameError}
                    </p>
                  )}
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold transition-colors"
                >
                  Doe Mee
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-primary-50 px-4 py-3 rounded-xl border border-primary-100">
                <div>
                  <div className="text-xs text-primary-600 font-semibold uppercase tracking-wider">Speler</div>
                  <div className="font-bold text-slate-800">{playerName}</div>
                </div>
                <button 
                  onClick={leaveLeaderboard}
                  className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors underline"
                >
                  Afmelden
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                  <Medal className="w-4 h-4 text-amber-500" />
                  Top 5 Spelers
                </h4>
                
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-slate-500 italic py-4 text-center">Laden...</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {leaderboard.slice(0, 5).map((entry, idx) => (
                      <div 
                        key={idx} 
                        className={`flex justify-between items-center p-3 rounded-xl border ${
                          entry.userName.toLowerCase() === playerName.toLowerCase() 
                            ? 'bg-primary-50 border-primary-200' 
                            : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-bold w-5 text-center ${
                            idx === 0 ? 'text-amber-500' : 
                            idx === 1 ? 'text-slate-400' : 
                            idx === 2 ? 'text-amber-700' : 'text-slate-400'
                          }`}>
                            {idx + 1}.
                          </span>
                          <span className="font-medium text-slate-700 truncate max-w-[100px]" title={entry.userName}>
                            {entry.userName}
                          </span>
                        </div>
                        <span className="font-bold text-primary-600">{entry.score}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
