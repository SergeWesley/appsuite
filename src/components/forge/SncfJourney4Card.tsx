import React from "react";
import { motion } from "framer-motion";
import { TrainFront, Leaf, ArrowRight } from "lucide-react";
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

export function SncfJourney4Card({ data, from, to }: SncfJourneyCardProps) {
  const journeys = data.journeys || [];
  
  if (journeys.length === 0) {
    return (
      <div className="w-full max-w-4xl my-4 rounded-2xl bg-white border border-gray-200 p-8 text-center">
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl my-4 bg-white rounded-3xl overflow-hidden flex flex-col sm:flex-row relative"
      style={{
        boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)"
      }}
    >
       {/* Côté gauche : Billet principal */}
       <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center gap-2">
               <TrainFront className="text-indigo-600" size={24} />
               <span className="font-bold tracking-widest text-indigo-600 uppercase text-xs">Billet Électronique Premium</span>
             </div>
             {journey.co2EmissionValue && (
                <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold uppercase tracking-widest">
                  <Leaf size={14} /> {journey.co2EmissionValue.toFixed(1)} {journey.co2EmissionUnit}
                </div>
             )}
          </div>

          {/* Informations principales */}
          <div className="flex items-center justify-between gap-4 mb-10">
             <div className="flex flex-col w-1/3">
                <span className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tighter leading-none">{formatNavitiaTime(journey.departureTime)}</span>
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 leading-tight">
                  {validSections[0]?.fromName || from}
                </span>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-6 relative">
                <div className="w-full border-t-[3px] border-dashed border-gray-200 relative">
                   <div className="absolute left-1/2 -top-4 -translate-x-1/2 bg-white px-3 text-indigo-400">
                     <ArrowRight size={28} />
                   </div>
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 mt-4 tracking-widest uppercase">
                  {formatDuration(journey.duration)}
                </span>
             </div>

             <div className="flex flex-col w-1/3 text-right">
                <span className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tighter leading-none">{formatNavitiaTime(journey.arrivalTime)}</span>
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 leading-tight">
                  {validSections[validSections.length-1]?.toName || to}
                </span>
             </div>
          </div>

          {/* Informations sur les trains */}
          <div className="flex items-center gap-3 flex-wrap">
            {validSections.filter(s => s.type === "public_transport").map((sec, i) => (
               <div key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black text-gray-600 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-indigo-600">{sec.network || sec.commercialMode}</span>
                  <span>{sec.code}</span>
               </div>
            ))}
          </div>
       </div>

       {/* Côté droit : Stub de billet */}
       <div className="w-full sm:w-72 bg-indigo-50 border-t-2 sm:border-t-0 sm:border-l-2 border-dashed border-indigo-200/50 p-6 sm:p-10 flex flex-col justify-between relative">
          
          {/* Trous de découpure en haut et en bas (pour se fondre dans la bulle de discussion grise) */}
          <div className="hidden sm:block absolute -left-4 -top-4 w-8 h-8 bg-gray-100 rounded-full" />
          <div className="hidden sm:block absolute -left-4 -bottom-4 w-8 h-8 bg-gray-100 rounded-full" />
          
          {/* Trous de découpure pour les appareils mobiles */}
          <div className="sm:hidden absolute -top-4 -left-4 w-8 h-8 bg-gray-100 rounded-full" />
          <div className="sm:hidden absolute -top-4 -right-4 w-8 h-8 bg-gray-100 rounded-full" />

          <div className="flex flex-col gap-6">
             <div>
               <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Passager</span>
               <span className="block text-sm font-black text-indigo-900 uppercase">Utilisateur Forge</span>
             </div>
             <div>
               <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Trajet</span>
               <span className="block text-sm font-black text-indigo-900 uppercase">Aller Simple</span>
             </div>
             <div>
               <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Correspondances</span>
               <span className="block text-sm font-black text-indigo-900 uppercase">{journey.nbTransfers}</span>
             </div>
          </div>

          {/* Illusion de code à barres */}
          <div 
            className="mt-8 h-12 w-full opacity-50 mix-blend-multiply" 
            style={{
              backgroundImage: `repeating-linear-gradient(to right, #312e81, #312e81 2px, transparent 2px, transparent 4px, #312e81 4px, #312e81 5px, transparent 5px, transparent 8px, #312e81 8px, #312e81 12px, transparent 12px, transparent 14px, #312e81 14px, #312e81 17px, transparent 17px, transparent 19px)`
            }} 
          />
       </div>
    </motion.div>
  );
}
