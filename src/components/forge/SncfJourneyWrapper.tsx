import React, { useState } from "react";
import { SncfJourneyCard } from "./SncfJourneyCard";
import { SncfJourney2Card } from "./SncfJourney2Card";
import { SncfJourney3Card } from "./SncfJourney3Card";
import { SncfJourney4Card } from "./SncfJourney4Card";
import { List, AlignLeft, Grid, Ticket, Maximize2, Minimize2 } from "lucide-react";

export function SncfJourneyWrapper(props: any) {
  // Start with the Boarding Pass style by default
  const [styleIndex, setStyleIndex] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const components = [
    SncfJourneyCard,
    SncfJourney2Card,
    SncfJourney3Card,
    SncfJourney4Card
  ];

  const icons = [
    { icon: List, tooltip: "Timeline Verticale" },
    { icon: AlignLeft, tooltip: "Chemin Horizontal" },
    { icon: Grid, tooltip: "Bento Box" },
    { icon: Ticket, tooltip: "Billet d'Avion" },
  ];

  const ActiveComponent = components[styleIndex];

  const renderSwitcher = (isModal: boolean) => (
    <div className={`absolute ${isModal ? '-top-4 -right-4 sm:-top-6 sm:-right-6' : '-top-3 right-4'} z-[100] ${isModal ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} transition-opacity bg-white border border-gray-200 shadow-sm rounded-full p-1 flex gap-1`}>
      {icons.map((item, idx) => (
        <button
          key={idx}
          onClick={() => setStyleIndex(idx)}
          title={item.tooltip}
          className={`p-1.5 rounded-full transition-colors ${
            styleIndex === idx
              ? "bg-indigo-100 text-indigo-700"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-800"
          }`}
        >
          <item.icon size={14} />
        </button>
      ))}
      <div className="w-px bg-gray-200 my-1 mx-0.5" />
      <button 
        onClick={() => setIsFullscreen(!isModal)}
        title={isModal ? "Quitter le plein écran" : "Plein écran"}
        className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-colors"
      >
        {isModal ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Inline View */}
      <div className="w-full flex flex-col items-start gap-1 relative group">
        {renderSwitcher(false)}
        <div className="w-full">
          <ActiveComponent {...props} />
        </div>
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-12 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          {/* Clic en dehors pour fermer */}
          <div className="absolute inset-0" onClick={() => setIsFullscreen(false)} />
          
          <div className="relative w-full max-w-[95vw] lg:max-w-[90vw] flex justify-center z-10">
            {renderSwitcher(true)}
            <div className="w-full flex justify-center max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&>div]:!max-w-[1400px] [&>div]:!w-full">
              <ActiveComponent {...props} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
