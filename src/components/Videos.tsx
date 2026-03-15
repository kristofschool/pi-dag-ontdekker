import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ExternalLink, Youtube, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description?: string;
  year?: string;
  isNew?: boolean;
}

const HARDCODED_VIDEOS: Video[] = [
  {
    id: "ZNiRzZ66YN0",
    title: "Calculating Pi with Real Pies",
    description: "Matt Parker berekent Pi door echte taarten te meten en te wegen. Een absolute klassieker voor Pi-dag!",
    year: "2017"
  },
  {
    id: "vlUTlbZT4ig",
    title: "We calculated pi with colliding blocks",
    description: "Een bizar wiskundig fenomeen: botsende blokken tellen levert exact de cijfers van Pi op!",
    year: "2019"
  },
  {
    id: "RZBhSi_PwHU",
    title: "Generating π from 1,000 random numbers",
    description: "Matt genereert 1.000 willekeurige getallen om Pi te berekenen via de kans dat twee getallen relatief priem zijn.",
    year: "2015"
  },
  {
    id: "nGtVej1Qx5Y",
    title: "I'm going to calculate π on the Moon. Literally.",
    description: "Matt stuurt een CubeRover mee op de Griffin-1 maanlander (NASA CLPS-missie). De rover rijdt een perfecte cirkel in het maanstof om zo Pi te berekenen.",
    year: "2023"
  },
  {
    id: "LIg-6glbLkU",
    title: "The biggest hand calculation in a century!",
    description: "Voor Pi-dag 2024 deed Matt de grootste handmatige berekening van Pi in meer dan honderd jaar.",
    year: "2024"
  },
  {
    id: "CKl1B8y4qXw",
    title: "Calculating π by hand the Isaac Newton way",
    description: "Hoe berekende Isaac Newton Pi tijdens de grote pestepidemie? Matt doet het hem na met pen en papier.",
    year: "2020"
  }
];

const KNOWN_IDS = new Set(HARDCODED_VIDEOS.map(v => v.id));

type FetchStatus = 'idle' | 'loading' | 'done' | 'error';

function extractYear(published: string): string {
  return published ? published.slice(0, 4) : '';
}

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>(HARDCODED_VIDEOS);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [newCount, setNewCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const zoekNieuweVideos = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/matt-parker-videos');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data: { videos: { id: string; title: string; published: string }[] } = await res.json();

      const nieuweVideos: Video[] = data.videos
        .filter(v => !KNOWN_IDS.has(v.id))
        .map(v => ({
          id: v.id,
          title: v.title,
          year: extractYear(v.published),
          isNew: true,
        }));

      if (nieuweVideos.length > 0) {
        nieuweVideos.forEach(v => KNOWN_IDS.add(v.id));
        setVideos(prev => [...prev, ...nieuweVideos]);
        setNewCount(nieuweVideos.length);
      } else {
        setNewCount(0);
      }
      setStatus('done');
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Onbekende fout');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
          <Youtube className="w-10 h-10 text-red-600" />
          Matt Parker's Pi-Dag Video's
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          De wiskundige en komiek Matt Parker (bekend van het YouTube-kanaal <strong>Stand-up Maths</strong>) 
          probeert elk jaar op 14 maart (Pi-dag) op een steeds absurdere manier Pi te berekenen. 
          Bekijk hier zijn meest legendarische pogingen!
        </p>
      </div>

      {/* Zoek nieuwe video's knop */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={zoekNieuweVideos}
          disabled={status === 'loading'}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-sm transition-all ${
            status === 'loading'
              ? 'bg-primary-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 hover:shadow-md'
          }`}
        >
          <RefreshCw className={`w-5 h-5 ${status === 'loading' ? 'animate-spin' : ''}`} />
          {status === 'loading' ? 'Stand-up Maths doorzoeken…' : 'Zoek nieuwe Pi-video\'s'}
        </button>

        <AnimatePresence>
          {status === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl ${
                newCount > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              {newCount > 0
                ? `🎉 ${newCount} nieuwe video${newCount > 1 ? "'s" : ''} gevonden en toegevoegd!`
                : 'Geen nieuwe Pi-video\'s gevonden — de lijst is up-to-date!'}
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-100"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Video grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.08, 0.5) }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group flex flex-col relative"
          >
            {video.isNew && (
              <div className="absolute top-3 left-3 z-10 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                NIEUW
              </div>
            )}
            <div className="relative aspect-video bg-slate-100 overflow-hidden">
              <img
                src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"
                >
                  <Play className="w-8 h-8 ml-1" fill="currentColor" />
                </a>
              </div>
              {video.year && (
                <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md">
                  {video.year}
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{video.title}</h3>
              {video.description ? (
                <p className="text-slate-600 text-sm flex-1">{video.description}</p>
              ) : (
                <p className="text-slate-400 text-sm flex-1 italic">Video gevonden via Stand-up Maths feed.</p>
              )}
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
              >
                Bekijk op YouTube <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-primary-50 rounded-2xl p-6 text-center border border-primary-100 mt-8">
        <p className="text-primary-800 font-medium">
          Meer zien? Abonneer je op het kanaal <a href="https://www.youtube.com/user/standupmaths" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-primary-900">Stand-up Maths</a> voor nog veel meer wiskundige avonturen!
        </p>
      </div>
    </div>
  );
}
