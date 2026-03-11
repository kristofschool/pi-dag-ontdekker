import { motion } from 'motion/react';
import { Play, ExternalLink, Youtube } from 'lucide-react';

export default function Videos() {
  const videos = [
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
      description: "Een episch avontuur waarbij Matt de afstand tot de maan gebruikt om Pi te berekenen met lasers.",
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

  return (
    <div className="space-y-8">
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, i) => (
          <motion.div 
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group flex flex-col"
          >
            <div className="relative aspect-video bg-slate-100 overflow-hidden">
              <img 
                src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} 
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback to hqdefault if maxresdefault is not available
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
              <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md">
                {video.year}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{video.title}</h3>
              <p className="text-slate-600 text-sm flex-1">{video.description}</p>
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
