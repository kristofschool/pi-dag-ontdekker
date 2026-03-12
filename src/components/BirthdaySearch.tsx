import { useState } from 'react';
import { Search, Loader2, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BirthdaySearch() {
  const [date, setDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'not-found' | 'error'>('idle');
  const [result, setResult] = useState<{ position: number, context: string } | null>(null);

  const searchPi = async () => {
    if (!date || !month) return;
    
    const searchString = `${date.padStart(2, '0')}${month.padStart(2, '0')}${year}`;
    setStatus('searching');
    setResult(null);

    try {
      const response = await fetch(`/api/search-pi?q=${searchString}`);
      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();

      if (data.status === 'OK' && data.r && data.r.length > 0) {
        const match = data.r[0];
        if (match.status === 'found') {
          // format the context
          const context = `${match.db}${match.k}${match.da}`;
          
          setResult({
            position: match.p, // 1-based index
            context: context
          });
          
          setStatus('found');
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else {
          setStatus('not-found');
        }
      } else {
        setStatus('not-found');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const shareResult = async () => {
    if (!result) return;
    const formattedDate = `${date.padStart(2, '0')}/${month.padStart(2, '0')}${year ? '/' + year : ''}`;
    const searchString = `${date.padStart(2, '0')}${month.padStart(2, '0')}${year}`;
    
    // Voeg de context toe met vierkante haken rond de verjaardag
    const formattedContext = `...${result.context.replace(searchString, `[${searchString}]`)}...`;
    
    const text = `🎉 Ik vond mijn verjaardag (${formattedDate}) op decimaal ${result.position.toLocaleString('nl-NL')} in Pi!\n\n${formattedContext}\n\n🕵️‍♂️ Kan jij de jouwe ook vinden? Zoek het nu op in de Pi-Dag Ontdekker van Sint-Jozef Sint-Pieter Blankenberge! 🥧`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Mijn verjaardag in Pi!',
          text: text,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        alert('Resultaat gekopieerd naar klembord!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <img 
            src="https://sjsp.be/wp-content/uploads/sjsp-logo.png" 
            alt="Sint-Jozef Sint-Pieter Blankenberge" 
            className="h-16 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Zit jouw verjaardag in Pi?</h2>
        <p className="text-slate-600">
          Omdat Pi oneindig doorgaat zonder patroon, zit vrijwel elke getallencombinatie ergens in Pi verstopt. 
          We zoeken live in de eerste <strong>200 miljoen decimalen</strong>!
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex gap-4 justify-center">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Dag</label>
            <input 
              type="text" 
              maxLength={2}
              placeholder="DD"
              value={date}
              onChange={(e) => setDate(e.target.value.replace(/\D/g, ''))}
              disabled={status === 'searching'}
              className="w-20 px-4 py-3 text-center text-xl font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Maand</label>
            <input 
              type="text" 
              maxLength={2}
              placeholder="MM"
              value={month}
              onChange={(e) => setMonth(e.target.value.replace(/\D/g, ''))}
              disabled={status === 'searching'}
              className="w-20 px-4 py-3 text-center text-xl font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Jaar (optioneel)</label>
            <input 
              type="text" 
              maxLength={4}
              placeholder="JJJJ"
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))}
              disabled={status === 'searching'}
              className="w-28 px-4 py-3 text-center text-xl font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            />
          </div>
        </div>

        <button 
          onClick={searchPi}
          disabled={!date || !month || status === 'searching'}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
        >
          {status === 'searching' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          {status === 'searching' ? 'Bliksemsnel aan het zoeken...' : 'Zoek in Pi'}
        </button>

        {status === 'found' && result && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-emerald-800">Gevonden! 🎉</h3>
            <p className="text-emerald-700">
              Jouw datum begint op decimaal <strong>{result.position.toLocaleString('nl-NL')}</strong>.
            </p>
            <div className="bg-white px-4 py-3 rounded-xl border border-emerald-100 font-mono text-lg break-all">
              ...{result.context.split(`${date.padStart(2, '0')}${month.padStart(2, '0')}${year}`).map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="bg-emerald-200 text-emerald-900 font-bold px-1 rounded">
                      {`${date.padStart(2, '0')}${month.padStart(2, '0')}${year}`}
                    </span>
                  )}
                </span>
              ))}...
            </div>
            
            <button 
              onClick={shareResult}
              className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105"
            >
              <Share2 className="w-5 h-5" />
              Deel op Socials
            </button>
          </div>
        )}

        {status === 'not-found' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-amber-800 mb-2">Helaas! 🕵️</h3>
            <p className="text-amber-700">
              We konden deze combinatie niet vinden in de eerste 200 miljoen decimalen. 
              Maar wees gerust, omdat Pi oneindig is, staat jouw datum er 100% zeker ergens in!
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700">
            Er ging iets mis bij het ophalen van Pi. Probeer het later opnieuw!
          </div>
        )}
      </div>
    </div>
  );
}
