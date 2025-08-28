"use client";

import { useMemo } from "react";
import { DailyStat } from "@/hooks/booker/useReadingAnalytics";

interface ReadingHeatmapProps {
  data: DailyStat[];
}

export function ReadingHeatmap({ data }: ReadingHeatmapProps) {
  // Préparer les données pour la heatmap (12 derniers mois)
  const heatmapData = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    // Créer un map des données par date
    const dataMap = new Map<string, DailyStat>();
    data.forEach((day) => {
      dataMap.set(day.date, day);
    });

    // Créer la grille de 52 semaines x 7 jours
    const weeks: (DailyStat | null)[][] = [];
    const currentDate = new Date(startDate);

    // Aller au dimanche précédent pour commencer la grille
    while (currentDate.getDay() !== 0) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    while (currentDate <= endDate) {
      const week: (DailyStat | null)[] = [];
      
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const dayData = dataMap.get(dateStr);
        
        if (currentDate >= startDate && currentDate <= endDate) {
          week.push(dayData || {
            date: dateStr,
            readingTime: 0,
            sessions: 0,
            pagesRead: 0,
          });
        } else {
          week.push(null);
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(week);
    }

    return weeks;
  }, [data]);

  // Calculer l'intensité maximale pour la mise à l'échelle des couleurs
  const maxIntensity = useMemo(() => {
    return Math.max(
      ...data.map(d => d.readingTime),
      1 // minimum 1 pour éviter la division par zéro
    );
  }, [data]);

  // Fonction pour obtenir la couleur en fonction de l'intensité
  const getIntensityColor = (readingTime: number) => {
    if (readingTime === 0) return "bg-gray-100";
    
    const intensity = readingTime / maxIntensity;
    
    if (intensity <= 0.2) return "bg-blue-200";
    if (intensity <= 0.4) return "bg-blue-300";
    if (intensity <= 0.6) return "bg-blue-400";
    if (intensity <= 0.8) return "bg-blue-500";
    return "bg-blue-600";
  };

  // Fonction pour formater le temps
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
  };

  // Fonction pour formater la date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", { 
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Noms des jours en français
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  
  // Noms des mois
  const monthNames = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
    "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"
  ];

  return (
    <div className="w-full">
      {/* En-têtes des mois */}
      <div className="flex mb-2">
        <div className="w-8"></div> {/* Espace pour les labels des jours */}
        <div className="flex-1 flex justify-between text-xs text-gray-600">
          {Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - 11 + i);
            return (
              <span key={i} className="flex-1 text-center">
                {monthNames[date.getMonth()]}
              </span>
            );
          })}
        </div>
      </div>

      {/* Grille principale */}
      <div className="flex">
        {/* Labels des jours */}
        <div className="flex flex-col justify-between w-8 pr-2">
          {[1, 3, 5].map((dayIndex) => (
            <div key={dayIndex} className="text-xs text-gray-600 h-3 flex items-center">
              {dayNames[dayIndex]}
            </div>
          ))}
        </div>

        {/* Grille des semaines */}
        <div className="flex flex-1 gap-1">
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1 flex-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`
                    h-3 rounded-sm cursor-pointer transition-all duration-200 group relative
                    ${day ? getIntensityColor(day.readingTime) : "bg-transparent"}
                    ${day && day.readingTime > 0 ? "hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50" : ""}
                  `}
                  title={day ? `${formatDate(day.date)}: ${formatTime(day.readingTime)}` : ""}
                >
                  {/* Tooltip détaillé */}
                  {day && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                      <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap">
                        <div className="font-semibold">{formatDate(day.date)}</div>
                        <div className="text-blue-200">
                          {day.readingTime > 0 ? formatTime(day.readingTime) : "Pas de lecture"}
                        </div>
                        {day.sessions > 0 && (
                          <div className="text-green-200">
                            {day.sessions} session{day.sessions > 1 ? 's' : ''}
                          </div>
                        )}
                        {day.pagesRead > 0 && (
                          <div className="text-purple-200">
                            {day.pagesRead} page{day.pagesRead > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      {/* Flèche du tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
        <span>Moins</span>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-300 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
        </div>
        <span>Plus</span>
      </div>

      {/* Statistiques rapides */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-lg font-semibold text-blue-600">
            {data.filter(day => day.readingTime > 0).length}
          </div>
          <div className="text-xs text-gray-600">Jours de lecture</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-lg font-semibold text-green-600">
            {Math.round((data.filter(day => day.readingTime > 0).length / Math.max(data.length, 1)) * 100)}%
          </div>
          <div className="text-xs text-gray-600">Régularité</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-lg font-semibold text-purple-600">
            {formatTime(Math.max(...data.map(d => d.readingTime), 0))}
          </div>
          <div className="text-xs text-gray-600">Record journalier</div>
        </div>
      </div>
    </div>
  );
}
