import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, TrainFront } from "lucide-react";
import { formatNavitiaTime } from "@/lib/format-utils";

interface SncfTrainEntry {
  direction: string;
  commercialMode: string;
  network: string;
  label: string;
  code: string;
  color: string;
  /** Heure effective (retardée ou non) */
  time: string;
  /** Heure initialement prévue */
  baseTime: string;
}

type BoardMode = "departures" | "arrivals";

interface SncfBoardProps {
  data: {
    departures?: SncfTrainEntry[];
    arrivals?: SncfTrainEntry[];
  };
  station: string;
  mode?: BoardMode;
}

const THEMES: Record<BoardMode, {
  bg: string;
  bgHeader: string;
  bgClock: string;
  bgColumnHeader: string;
  borderOuter: string;
  borderHeader: string;
  borderRow: string;
  borderClock: string;
  hoverRow: string;
  voieBg: string;
  voieBorder: string;
  columnHeaderText: string;
  iconText: string;
}> = {
  departures: {
    bg: "bg-blue-950",
    bgHeader: "bg-blue-900",
    bgClock: "bg-blue-950",
    bgColumnHeader: "bg-blue-950",
    borderOuter: "border-blue-900",
    borderHeader: "border-blue-800",
    borderRow: "border-blue-900/50",
    borderClock: "border-blue-800",
    hoverRow: "hover:bg-blue-900",
    voieBg: "bg-blue-900",
    voieBorder: "border-blue-800",
    columnHeaderText: "text-blue-200",
    iconText: "text-blue-950",
  },
  arrivals: {
    bg: "bg-emerald-950",
    bgHeader: "bg-emerald-900",
    bgClock: "bg-emerald-950",
    bgColumnHeader: "bg-emerald-950",
    borderOuter: "border-emerald-900",
    borderHeader: "border-emerald-800",
    borderRow: "border-emerald-900/50",
    borderClock: "border-emerald-800",
    hoverRow: "hover:bg-emerald-900",
    voieBg: "bg-emerald-900",
    voieBorder: "border-emerald-800",
    columnHeaderText: "text-emerald-200",
    iconText: "text-emerald-950",
  },
};

function isDelayed(entry: SncfTrainEntry) {
  if (!entry.baseTime || !entry.time) return false;
  return entry.time !== entry.baseTime;
}

/**
 * Normalise les données brutes de l'API (departures ou arrivals) vers un format unifié.
 */
function normalizeEntries(data: SncfBoardProps["data"], mode: BoardMode): SncfTrainEntry[] {
  if (mode === "departures") {
    const raw = data.departures || [];
    return raw.map((d: any) => ({
      direction: d.direction,
      commercialMode: d.commercialMode,
      network: d.network,
      label: d.label,
      code: d.code,
      color: d.color,
      time: d.departureTime || d.time || "",
      baseTime: d.baseDepartureTime || d.baseTime || "",
    }));
  }
  const raw = data.arrivals || [];
  return raw.map((a: any) => ({
    direction: a.direction,
    commercialMode: a.commercialMode,
    network: a.network,
    label: a.label,
    code: a.code,
    color: a.color,
    time: a.arrivalTime || a.time || "",
    baseTime: a.baseArrivalTime || a.baseTime || "",
  }));
}

export function SncfBoard({ data, station, mode = "departures" }: SncfBoardProps) {
  const [currentTime, setCurrentTime] = useState("");
  const theme = THEMES[mode];
  const entries = normalizeEntries(data, mode);
  const title = mode === "departures" ? "Prochains Départs" : "Prochaines Arrivées";
  const emptyLabel = mode === "departures" ? "Aucun départ prévu" : "Aucune arrivée prévue";
  const originLabel = mode === "departures" ? "Destination" : "Provenance";

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full max-w-4xl my-4 rounded-xl overflow-hidden ${theme.bg} border-[6px] ${theme.borderOuter} font-mono text-white`}
    >
      {/* Header du panneau */}
      <div className={`${theme.bgHeader} p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between ${theme.borderHeader} border-b-2 gap-4`}>
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white rounded-lg">
            <TrainFront className={theme.iconText} size={28} />
          </div>
          <div>
            <h2 className="text-base sm:text-2xl font-black tracking-widest uppercase text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              {title}
            </h2>
            <p className="text-[8px] sm:text-sm text-white/80 uppercase tracking-widest truncate max-w-[200px] sm:max-w-md">
              {station}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 sm:gap-2 ${theme.bgClock} px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border ${theme.borderClock} shadow-inner`}>
          <Clock size={18} className="text-white/70 animate-pulse" />
          <span className="text-base sm:text-2xl font-bold tracking-wider text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
            {currentTime || "--:--:--"}
          </span>
        </div>
      </div>

      {/* En-têtes de colonnes */}
      <div className={`grid grid-cols-12 gap-1 sm:gap-4 px-3 sm:px-6 py-1.5 sm:py-2 ${theme.bgColumnHeader} ${theme.columnHeaderText} text-[8px] sm:text-xs uppercase tracking-widest font-bold border-b ${theme.borderHeader}`}>
        <div className="col-span-3 sm:col-span-2">Heure</div>
        <div className="col-span-5 sm:col-span-6">{originLabel}</div>
        <div className="col-span-4 sm:col-span-3">Train</div>
        <div className="hidden sm:block sm:col-span-1 text-right">Voie</div>
      </div>

      {/* Liste des trains */}
      <div className={`flex flex-col ${theme.bg} min-h-[300px]`}>
        {entries.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-white/40 uppercase tracking-widest text-lg font-bold">
            {emptyLabel}
          </div>
        ) : (
          entries.slice(0, 8).map((entry, idx) => {
            const time = formatNavitiaTime(entry.time);
            const delayed = isDelayed(entry);
            const trainColor = entry.color ? (entry.color.startsWith('#') ? entry.color : `#${entry.color}`) : '#4b5563';
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`grid grid-cols-12 gap-1 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 border-b ${theme.borderRow} items-center group ${theme.hoverRow} transition-colors`}
              >
                {/* Heure */}
                <div className="col-span-3 sm:col-span-2 relative flex items-center h-full pt-2 sm:pt-0">
                  {delayed && (
                    <span className="absolute -top-1 sm:-top-1 left-0 text-white/50 line-through text-[8px] sm:text-xs font-bold tracking-wider">
                      {formatNavitiaTime(entry.baseTime)}
                    </span>
                  )}
                  <span className={`text-base sm:text-3xl font-bold tracking-wider leading-none ${delayed ? "text-orange-500 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" : "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]"}`}>
                    {time}
                  </span>
                </div>

                {/* Direction / Provenance */}
                <div className="col-span-5 sm:col-span-6 text-sm sm:text-2xl font-black uppercase line-clamp-3 sm:truncate tracking-wide text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] leading-tight sm:leading-normal">
                  {entry.direction}
                </div>

                {/* Code Train */}
                <div className="col-span-4 sm:col-span-3 flex flex-col sm:flex-row items-start sm:items-center gap-0.5 sm:gap-3 mt-0.5 sm:mt-0">
                  <span 
                    className="px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-sm text-[8px] sm:text-xs font-black text-white uppercase tracking-wider shadow-sm"
                    style={{ backgroundColor: trainColor, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                  >
                    {entry.commercialMode || entry.network}
                  </span>
                  <span className="text-[10px] sm:text-lg text-white/80 font-bold tracking-wider">{entry.code}</span>
                </div>

                {/* Voie */}
                <div className="hidden sm:block sm:col-span-1 text-right">
                  <div className={`inline-block ${theme.voieBg} border-2 ${theme.voieBorder} text-white/30 px-3 py-1 rounded text-xl font-black min-w-[3rem] text-center shadow-inner`}>
                    -
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer décoratif */}
      <div className={`${theme.bgHeader} h-3 w-full border-t-2 ${theme.borderHeader}`} />
    </motion.div>
  );
}
