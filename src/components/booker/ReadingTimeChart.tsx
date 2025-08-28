"use client";

import { useMemo } from "react";
import { DailyStat } from "@/hooks/booker/useReadingAnalytics";

interface ReadingTimeChartProps {
  data: DailyStat[];
}

export function ReadingTimeChart({ data }: ReadingTimeChartProps) {
  // Prendre les 30 derniers jours
  const chartData = useMemo(() => {
    return data.slice(-30);
  }, [data]);

  // Trouver la valeur maximale pour la mise à l'échelle
  const maxValue = useMemo(() => {
    return Math.max(...chartData.map(d => d.readingTime), 1);
  }, [chartData]);

  // Fonction pour formater le temps en minutes
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
      day: "2-digit", 
      month: "2-digit" 
    });
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>Aucune donnée de lecture disponible</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      {/* Graphique en barres simple */}
      <div className="h-full flex items-end justify-between gap-1 px-2">
        {chartData.map((day, index) => {
          const height = maxValue > 0 ? (day.readingTime / maxValue) * 100 : 0;
          const hasData = day.readingTime > 0;
          
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center group relative"
            >
              {/* Barre */}
              <div
                className={`w-full rounded-t-sm transition-all duration-200 ${
                  hasData 
                    ? "bg-blue-500 hover:bg-blue-600" 
                    : "bg-gray-200"
                }`}
                style={{ 
                  height: `${Math.max(height, hasData ? 2 : 1)}%`,
                  minHeight: hasData ? '2px' : '1px'
                }}
              />
              
              {/* Tooltip au survol */}
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  <div className="font-semibold">{formatDate(day.date)}</div>
                  <div>{formatTime(day.readingTime)}</div>
                  {day.sessions > 0 && (
                    <div>{day.sessions} session{day.sessions > 1 ? 's' : ''}</div>
                  )}
                  {day.pagesRead > 0 && (
                    <div>{day.pagesRead} page{day.pagesRead > 1 ? 's' : ''}</div>
                  )}
                </div>
                {/* Flèche du tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Axe des X - dates */}
      <div className="flex justify-between mt-2 px-2">
        {chartData.map((day, index) => {
          // Afficher seulement quelques dates pour éviter l'encombrement
          const showDate = index % Math.ceil(chartData.length / 6) === 0 || index === chartData.length - 1;
          
          return (
            <div
              key={`label-${day.date}`}
              className={`text-xs text-gray-600 ${
                showDate ? "opacity-100" : "opacity-0"
              }`}
              style={{ flex: 1, textAlign: "center" }}
            >
              {showDate ? formatDate(day.date) : ""}
            </div>
          );
        })}
      </div>

      {/* Légende */}
      <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Temps de lecture</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <span>Pas de lecture</span>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-blue-600">
            {formatTime(chartData.reduce((acc, day) => acc + day.readingTime, 0))}
          </div>
          <div className="text-xs text-gray-600">Total 30j</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-green-600">
            {chartData.filter(day => day.readingTime > 0).length}
          </div>
          <div className="text-xs text-gray-600">Jours actifs</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-orange-600">
            {chartData.length > 0 
              ? formatTime(Math.floor(chartData.reduce((acc, day) => acc + day.readingTime, 0) / chartData.length))
              : "0m"
            }
          </div>
          <div className="text-xs text-gray-600">Moyenne/jour</div>
        </div>
      </div>
    </div>
  );
}
