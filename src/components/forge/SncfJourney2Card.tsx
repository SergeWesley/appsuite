import { motion } from "framer-motion";
import { TrainFront, Clock, ArrowRight, Leaf, Info } from "lucide-react";
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

export function SncfJourney2Card({ data, from, to }: SncfJourneyCardProps) {
  const journeys = data.journeys || [];
  
  if (journeys.length === 0) {
    return (
      <div className="w-full max-w-4xl my-4 rounded-xl bg-white border-4 border-black font-mono text-black p-8 text-center">
        <p className="text-black uppercase tracking-widest font-black">Aucun itinéraire trouvé</p>
      </div>
    );
  }

  const journey = journeys[0];
  const validSections = journey.sections.filter(
    (s) => s.type === "public_transport" || s.type === "transfer" || s.type === "street_network" || s.type === "waiting"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl my-4 rounded-xl bg-white border-[3px] border-black font-mono text-black overflow-hidden flex flex-col"
    >
      {/* Header - Minimalist */}
      <div className="p-4 sm:p-8 border-b-[3px] border-black overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex flex-row items-center justify-between gap-6 min-w-max">
          <div className="flex items-center gap-4">
            <div className="p-2 border-2 border-black rounded-lg bg-black text-white shrink-0">
              <TrainFront size={28} className="sm:w-8 sm:h-8" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <span>{from}</span>
                <ArrowRight size={20} className="shrink-0" />
                <span>{to}</span>
              </h2>
              <div className="flex items-center gap-3 sm:gap-4 mt-1 sm:mt-2 text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-widest">
                <span className="flex items-center gap-1.5 text-black">
                  <Clock size={14} className="sm:w-4 sm:h-4" /> {formatDuration(journey.duration)}
                </span>
                <span>•</span>
                <span>{journey.nbTransfers} correspondance(s)</span>
              </div>
            </div>
          </div>

          {journey.co2EmissionValue && (
            <div className="flex items-center gap-2 border-2 border-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shrink-0">
              <Leaf size={16} className="sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-black uppercase whitespace-nowrap">
                {journey.co2EmissionValue.toFixed(1)} {journey.co2EmissionUnit}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pathway Visualization */}
      <div className="p-6 sm:p-12 overflow-x-auto bg-gray-50 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex flex-row items-center w-max min-w-full pb-16 pt-12 px-6 sm:px-8">
          {validSections.map((section, idx) => {
            const isLast = idx === validSections.length - 1;
            const isTransport = section.type === "public_transport";
            
            return (
              <div key={idx} className="flex items-center">
                {/* Start Node */}
                <div className="relative flex flex-col items-center justify-center">
                  <div className="absolute bottom-6 flex flex-col items-center w-32 text-center pb-2">
                    <span className="text-2xl font-black text-black">{formatNavitiaTime(section.departureTime)}</span>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-tight mt-1 line-clamp-2 px-2">{section.fromName}</span>
                  </div>
                  {/* Circle */}
                  <div className="w-5 h-5 rounded-full border-[4px] border-black bg-white z-10" />
                </div>

                {/* Connecting Edge */}
                <div className={`relative flex flex-col items-center justify-center ${isTransport ? 'w-48 sm:w-64' : 'w-24 sm:w-32'}`}>
                  {/* Line */}
                  <div className={`absolute top-1/2 -translate-y-1/2 w-full ${isTransport ? 'h-[4px] bg-black' : 'border-t-[3px] border-dashed border-gray-400'}`} />
                  
                  {/* Label below line */}
                  <div className="absolute top-6 flex flex-col items-center text-center pt-2">
                    {isTransport ? (
                      <div className="px-3 py-1 bg-black text-white text-[11px] font-black tracking-widest rounded-sm uppercase shadow-sm">
                        {section.commercialMode || section.network} {section.code}
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-2 flex items-center gap-1">
                        <Info size={12} />
                        {section.type === "waiting" ? "Attente" : "Marche"} {formatDuration(section.duration)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Final End Node */}
                {isLast && (
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="absolute bottom-6 flex flex-col items-center w-32 text-center pb-2">
                      <span className="text-2xl font-black text-black">{formatNavitiaTime(section.arrivalTime)}</span>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-tight mt-1 line-clamp-2 px-2">{section.toName}</span>
                    </div>
                    {/* Circle */}
                    <div className="w-5 h-5 rounded-full bg-black border-[4px] border-black z-10 shadow-[0_0_0_4px_rgba(255,255,255,1)]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
