"use client";

import { useMemo, useState } from "react";
import { DailyStat } from "@/hooks/booker/useReadingAnalytics";

interface ReadingHeatmapProps {
  data: DailyStat[];
}

export function ReadingHeatmap({ data }: ReadingHeatmapProps) {
  const [selectedDay, setSelectedDay] = useState<DailyStat | null>(null);

  // Préparer les données pour la heatmap (30 derniers jours)
  const heatmapData = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29); // 30 jours au total

    // Créer un map des données par date
    const dataMap = new Map<string, DailyStat>();
    data.forEach((day) => {
      dataMap.set(day.date, day);
    });

    // Créer la grille des 30 derniers jours organisée par semaines
    const weeks: (DailyStat | null)[][] = [];
    const currentDate = new Date(startDate);

    // Aller au lundi précédent pour commencer la grille
    while (currentDate.getDay() !== 1) {
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

    return weeks.filter(week => week.some(day => day !== null));
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

  // Fonction pour formater la date courte
  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", { 
      day: "numeric",
      month: "short"
    });
  };

  // Noms des jours en français
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  // Gérer le clic/touch sur un jour
  const handleDayClick = (day: DailyStat | null) => {
    if (day) {
      setSelectedDay(selectedDay?.date === day.date ? null : day);
    }
  };

  return (
    <div className="w-full">
      {/* En-têtes des jours de la semaine */}
      <div className="flex mb-3">
        <div className="w-12 text-xs text-gray-600">Jour</div>
        <div className="flex-1 grid grid-cols-7 gap-1 text-center">
          {dayNames.map((dayName) => (
            <div key={dayName} className="text-xs text-gray-600 py-1">
              {dayName}
            </div>
          ))}
        </div>
      </div>

      {/* Grille principale */}
      <div className="space-y-1">
        {heatmapData.map((week, weekIndex) => (
          <div key={weekIndex} className="flex">
            <div className="w-12 text-xs text-gray-600 flex items-center">
              {/* Afficher la date de début de semaine */}
              {week.find(day => day !== null) && (
                <span>
                  {formatShortDate(week.find(day => day !== null)!.date)}
                </span>
              )}
            </div>
            <div className="flex-1 grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => (
                <button
                  key={`${weekIndex}-${dayIndex}`}
                  className={`
                    h-8 sm:h-10 rounded-lg transition-all duration-200 relative group
                    ${day ? getIntensityColor(day.readingTime) : "bg-transparent"}
                    ${day && day.readingTime > 0 ? "hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50" : ""}
                    ${selectedDay?.date === day?.date ? "ring-2 ring-blue-500 ring-opacity-70 scale-105" : ""}
                    ${day ? "cursor-pointer active:scale-95" : "cursor-default"}
                  `}
                  onClick={() => handleDayClick(day)}
                  disabled={!day}
                >
                  {/* Numéro du jour sur mobile */}
                  {day && (
                    <span className="text-xs font-medium text-gray-700 sm:hidden">
                      {new Date(day.date).getDate()}
                    </span>
                  )}

                  {/* Tooltip pour desktop */}
                  {day && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 hidden sm:block">
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
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Détails du jour sélectionné (mobile) */}
      {selectedDay && (
        <div className="mt-4 sm:hidden bg-gray-900 text-white rounded-lg p-4">
          <div className="font-semibold text-blue-200 mb-2">
            {formatDate(selectedDay.date)}
          </div>
          <div className="space-y-1">
            <div className="text-blue-200">
              {selectedDay.readingTime > 0 ? formatTime(selectedDay.readingTime) : "Pas de lecture"}
            </div>
            {selectedDay.sessions > 0 && (
              <div className="text-green-200">
                {selectedDay.sessions} session{selectedDay.sessions > 1 ? 's' : ''}
              </div>
            )}
            {selectedDay.pagesRead > 0 && (
              <div className="text-purple-200">
                {selectedDay.pagesRead} page{selectedDay.pagesRead > 1 ? 's' : ''}
              </div>
            )}
          </div>
          <button
            onClick={() => setSelectedDay(null)}
            className="mt-3 text-xs text-gray-400 hover:text-white"
          >
            Fermer
          </button>
        </div>
      )}

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

      {/* Statistiques rapides des 30 derniers jours */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-lg font-semibold text-blue-600">
            {data.filter(day => day.readingTime > 0).length}
          </div>
          <div className="text-xs text-gray-600">Jours de lecture</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-lg font-semibold text-green-600">
            {data.length > 0 ? Math.round((data.filter(day => day.readingTime > 0).length / data.length) * 100) : 0}%
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
