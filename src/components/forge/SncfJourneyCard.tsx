import { motion } from "framer-motion";
import { TrainFront, ArrowRight, Leaf, Clock, MapPin, Navigation, Footprints } from "lucide-react";
import { formatNavitiaTime, formatDuration } from "@/lib/format-utils";

interface SncfJourneySection {
  type: string;
  duration: number;
  departureTime: string;
  arrivalTime: string;
  fromName: string;
  toName: string;
  commercialMode: string;
  network: string;
  label: string;
  code: string;
  color: string;
  direction: string;
}

interface SncfJourney {
  duration: number;
  nbTransfers: number;
  departureTime: string;
  arrivalTime: string;
  co2EmissionValue: number;
  co2EmissionUnit: string;
  sections: SncfJourneySection[];
}

interface SncfJourneyCardProps {
  data: {
    journeys?: SncfJourney[];
  };
  from: string;
  to: string;
}

export function SncfJourneyCard({ data, from, to }: SncfJourneyCardProps) {
  const journeys = data.journeys || [];
  
  if (journeys.length === 0) {
    return (
      <div className="w-full max-w-4xl my-4 rounded-xl bg-blue-950 border-[6px] border-blue-900 font-mono text-white p-8 text-center">
        <p className="text-white/60 uppercase tracking-widest font-bold">Aucun itinéraire trouvé</p>
      </div>
    );
  }

  // On affiche le premier itinéraire (le plus pertinent)
  const journey = journeys[0];
  const validSections = journey.sections.filter(
    (s) => s.type === "public_transport" || s.type === "transfer" || s.type === "street_network" || s.type === "waiting"
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-3xl my-4 rounded-xl overflow-hidden bg-blue-950 border-[6px] border-blue-900 font-mono text-white"
    >
      {/* Header */}
      <div className="bg-blue-900 p-4 sm:px-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-b-2 border-blue-800">
        <div className="flex flex-row items-center justify-between gap-6 min-w-max">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white rounded-lg shrink-0">
              <TrainFront className="text-blue-950" size={28} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base sm:text-xl font-black tracking-widest uppercase text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] flex items-center gap-2">
                <span>{from}</span>
                <ArrowRight size={18} className="text-blue-400 shrink-0" />
                <span>{to}</span>
              </h2>
            <p className="text-xs text-white/70 uppercase tracking-widest mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {formatDuration(journey.duration)}
              </span>
              <span className="flex items-center gap-1">
                <RefreshCcwIcon size={12} /> {journey.nbTransfers} correspondance(s)
              </span>
            </p>
          </div>
        </div>
        
        {journey.co2EmissionValue && (
          <div className="flex items-center gap-2 bg-blue-950/50 px-3 py-1.5 rounded-lg border border-blue-800/50 shrink-0">
            <Leaf size={16} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-emerald-100 whitespace-nowrap">
              {journey.co2EmissionValue.toFixed(1)} {journey.co2EmissionUnit}
            </span>
          </div>
        )}
        </div>
      </div>

      {/* Timeline des sections */}
      <div className="p-4 sm:p-6 bg-blue-950/80 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="relative border-l-2 border-blue-800 ml-4 sm:ml-6 pb-4 min-w-max pr-6">
          {validSections.map((section, idx) => {
            const isPublicTransport = section.type === "public_transport";
            
            if (isPublicTransport) {
              const trainColor = section.color ? (section.color.startsWith('#') ? section.color : `#${section.color}`) : '#4b5563';
              
              return (
                <div key={idx} className="mb-8 relative pl-6 sm:pl-8">
                  {/* Point sur la timeline */}
                  <div className="absolute w-4 h-4 rounded-full bg-blue-400 border-4 border-blue-950 -left-[9px] top-1"></div>
                  
                  {/* Départ */}
                  <div className="flex flex-row items-baseline gap-3 mb-2">
                    <span className="text-lg font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] shrink-0">
                      {formatNavitiaTime(section.departureTime)}
                    </span>
                    <span className="text-base sm:text-lg font-black uppercase text-white/90 whitespace-nowrap">
                      {section.fromName}
                    </span>
                  </div>

                  {/* Ligne de trajet (Train) */}
                  <div className="my-3 p-3 sm:p-4 bg-blue-900/40 rounded-lg border border-blue-800/50 flex flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <span 
                        className="px-2 py-1 rounded-sm text-xs font-black text-white uppercase tracking-wider shadow-sm"
                        style={{ backgroundColor: trainColor, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                      >
                        {section.commercialMode || section.network}
                      </span>
                      <span className="text-sm font-bold text-white/80">{section.code}</span>
                    </div>
                    {section.direction && (
                      <div className="text-xs text-white/60 flex items-center gap-1.5 uppercase tracking-wider whitespace-nowrap">
                        <Navigation size={12} className="shrink-0" /> Dir: {section.direction}
                      </div>
                    )}
                  </div>

                  {/* Arrivée */}
                  <div className="flex flex-row items-baseline gap-3">
                    <span className="text-lg font-bold text-white/70 shrink-0">
                      {formatNavitiaTime(section.arrivalTime)}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-white/80 whitespace-nowrap">
                      {section.toName}
                    </span>
                  </div>
                </div>
              );
            } else if (section.type === "transfer" || section.type === "waiting" || section.type === "street_network") {
              // Section de marche / attente
              if (!section.duration || section.duration === 0) return null;
              
              return (
                <div key={idx} className="mb-8 relative pl-6 sm:pl-8">
                  <div className="absolute w-3 h-3 rounded-full bg-blue-800 -left-[7px] top-2"></div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-300/60 uppercase tracking-widest pt-1">
                    {section.type === "waiting" ? <Clock size={12} /> : <Footprints size={12} />}
                    {section.type === "waiting" ? "Attente" : "Correspondance"} • {formatDuration(section.duration)}
                  </div>
                </div>
              );
            }
            return null;
          })}
          
          {/* Point final d'arrivée globale */}
          <div className="absolute w-4 h-4 rounded-full bg-emerald-400 border-4 border-blue-950 -left-[9px] -bottom-2"></div>
          <div className="absolute -bottom-2 left-6 sm:left-8 flex flex-row items-baseline gap-3">
            <span className="text-xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] shrink-0">
              {formatNavitiaTime(journey.arrivalTime)}
            </span>
            <span className="text-lg sm:text-xl font-black uppercase text-white whitespace-nowrap">
              {validSections[validSections.length - 1]?.toName || to}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-900 h-3 w-full border-t-2 border-blue-800 mt-6" />
    </motion.div>
  );
}

function RefreshCcwIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21v-5h5" />
    </svg>
  );
}
