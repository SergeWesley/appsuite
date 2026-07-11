import React from "react";
import { motion } from "framer-motion";
import { TrainFront, Clock, ArrowRight, Leaf, MapPin, Footprints } from "lucide-react";
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

export function SncfJourney3Card({ data, from, to }: SncfJourneyCardProps) {
  const journeys = data.journeys || [];
  
  if (journeys.length === 0) {
    return (
      <div className="w-full max-w-4xl my-4 rounded-3xl bg-gray-50 border border-gray-100 p-8 text-center">
        <p className="text-gray-500 uppercase tracking-widest font-bold">Aucun itinéraire trouvé</p>
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
      className="w-full max-w-4xl my-4 flex flex-col gap-4 font-sans"
    >
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <TrainFront className="text-indigo-600" />
          Aperçu de l'itinéraire
        </h3>
        {journey.co2EmissionValue && (
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Leaf size={14} /> {journey.co2EmissionValue.toFixed(1)} {journey.co2EmissionUnit}
          </div>
        )}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Departure Box */}
        <div className="col-span-2 bg-indigo-50/70 border border-indigo-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-center transition-transform hover:scale-[1.01]">
          <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <MapPin size={14} /> Départ
          </span>
          <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter">
            {formatNavitiaTime(journey.departureTime)}
          </span>
          <span className="text-gray-600 font-medium mt-3 leading-tight max-w-[90%]">
            {validSections[0]?.fromName || from}
          </span>
        </div>

        {/* Arrival Box */}
        <div className="col-span-2 bg-rose-50/70 border border-rose-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-center transition-transform hover:scale-[1.01]">
          <span className="text-rose-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <MapPin size={14} /> Arrivée
          </span>
          <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter">
            {formatNavitiaTime(journey.arrivalTime)}
          </span>
          <span className="text-gray-600 font-medium mt-3 leading-tight max-w-[90%]">
            {validSections[validSections.length - 1]?.toName || to}
          </span>
        </div>

        {/* Duration Box */}
        <div className="col-span-2 md:col-span-1 bg-amber-50/70 border border-amber-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02]">
          <Clock size={28} className="text-amber-500 mb-3" />
          <span className="text-2xl font-black text-gray-900 tracking-tight">{formatDuration(journey.duration)}</span>
          <span className="text-amber-700/80 text-[10px] font-bold uppercase tracking-widest mt-2">
            {journey.nbTransfers} changement{journey.nbTransfers > 1 ? 's' : ''}
          </span>
        </div>

        {/* Path / Trains Box */}
        <div className="col-span-2 md:col-span-3 bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col justify-center">
          <span className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Séquence</span>
          <div className="flex flex-wrap items-center gap-y-3 gap-x-2">
            {validSections.map((sec, idx) => {
               if (sec.type === "public_transport") {
                 return (
                   <React.Fragment key={idx}>
                     <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl flex items-center gap-2">
                       <span className="font-bold text-sm text-gray-900">{sec.network || sec.commercialMode}</span>
                       <span className="text-xs font-semibold text-gray-500">{sec.code}</span>
                     </div>
                     {idx !== validSections.length - 1 && <ArrowRight size={16} className="text-gray-300 mx-1" />}
                   </React.Fragment>
                 )
               } else if (sec.type === "waiting" || sec.type === "street_network") {
                 if (!sec.duration) return null;
                 return (
                   <React.Fragment key={idx}>
                     <div className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-1.5">
                        {sec.type === "waiting" ? <Clock size={10} /> : <Footprints size={10} />}
                        {formatDuration(sec.duration)}
                     </div>
                     {idx !== validSections.length - 1 && <ArrowRight size={16} className="text-gray-300 mx-1" />}
                   </React.Fragment>
                 )
               }
               return null;
            })}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
