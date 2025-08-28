"use client";

import { useMemo } from "react";
import { MonthlyStat } from "@/hooks/booker/useReadingAnalytics";

interface ReadingProgressChartProps {
  data: MonthlyStat[];
}

export function ReadingProgressChart({ data }: ReadingProgressChartProps) {
  // Prendre les 12 derniers mois
  const chartData = useMemo(() => {
    return data.slice(-12);
  }, [data]);

  // Calculer les valeurs cumulatives pour la courbe de progression
  const progressData = useMemo(() => {
    let cumulativeTime = 0;
    let cumulativeSessions = 0;
    let cumulativePages = 0;
    let cumulativeBooks = 0;

    return chartData.map((month) => {
      cumulativeTime += month.readingTime;
      cumulativeSessions += month.sessions;
      cumulativePages += month.pagesRead;
      cumulativeBooks += month.booksCompleted;

      return {
        ...month,
        cumulativeTime,
        cumulativeSessions,
        cumulativePages,
        cumulativeBooks,
      };
    });
  }, [chartData]);

  // Trouver les valeurs max pour la mise à l'échelle
  const maxValues = useMemo(() => {
    if (progressData.length === 0) return { time: 1, sessions: 1, pages: 1, books: 1 };

    return {
      time: Math.max(...progressData.map(d => d.cumulativeTime), 1),
      sessions: Math.max(...progressData.map(d => d.cumulativeSessions), 1),
      pages: Math.max(...progressData.map(d => d.cumulativePages), 1),
      books: Math.max(...progressData.map(d => d.cumulativeBooks), 1),
    };
  }, [progressData]);

  // Fonction pour formater le temps en heures
  const formatTimeHours = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}` : `${minutes}m`;
  };

  // Fonction pour formater le mois
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("fr-FR", { 
      month: "short",
      year: year !== new Date().getFullYear().toString() ? "2-digit" : undefined
    });
  };

  // Créer les points de la courbe SVG
  const createPath = (values: number[], maxValue: number) => {
    if (values.length === 0) return "";

    const width = 100; // Pourcentage
    const height = 100; // Pourcentage
    const stepX = width / (values.length - 1 || 1);

    const points = values.map((value, index) => {
      const x = index * stepX;
      const y = height - (value / maxValue) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  };

  if (progressData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>Aucune donnée de progression disponible</p>
      </div>
    );
  }

  return (
    // <div className="h-64 w-full">
    <div className="w-full">
      {/* Graphique SVG */}
      <div className="relative h-48 bg-gray-50 rounded-lg p-4">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grille de fond */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Courbe du temps de lecture cumulé */}
          <path
            d={createPath(
              progressData.map(d => d.cumulativeTime),
              maxValues.time
            )}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            className="drop-shadow-sm"
          />

          {/* Points sur la courbe */}
          {progressData.map((month, index) => {
            const x = (index / (progressData.length - 1 || 1)) * 100;
            const y = 100 - (month.cumulativeTime / maxValues.time) * 100;
            
            return (
              <g key={month.month}>
                <circle
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#3b82f6"
                  className="drop-shadow-sm"
                />
                {/* Zone de hover invisible */}
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="transparent"
                  className="hover:fill-blue-100 cursor-pointer transition-colors"
                  data-tooltip={`${formatMonth(month.month)}: ${formatTimeHours(month.cumulativeTime)} total`}
                />
              </g>
            );
          })}
        </svg>

        {/* Labels des axes */}
        <div className="absolute inset-x-4 -bottom-1 flex justify-between">
          {progressData.map((month, index) => {
            // Afficher seulement quelques labels pour éviter l'encombrement
            const showLabel = index % Math.ceil(progressData.length / 4) === 0 || index === progressData.length - 1;
            
            return (
              <div
                key={`x-label-${month.month}`}
                className={`text-xs text-gray-600 ${
                  showLabel ? "opacity-100" : "opacity-0"
                }`}
              >
                {showLabel ? formatMonth(month.month) : ""}
              </div>
            );
          })}
        </div>

        {/* Label de l'axe Y */}
        <div className="absolute -left-2 top-0 text-xs text-gray-600 transform -rotate-90 origin-left">
          {formatTimeHours(maxValues.time)}
        </div>
        <div className="absolute -left-2 bottom-4 text-xs text-gray-600 transform -rotate-90 origin-left">
          0h
        </div>
      </div>

      {/* Statistiques du mois en cours */}
      {progressData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {formatTimeHours(progressData[progressData.length - 1].cumulativeTime)}
            </div>
            <div className="text-xs text-gray-600">Temps total</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {progressData[progressData.length - 1].cumulativeSessions}
            </div>
            <div className="text-xs text-gray-600">Sessions total</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600">
              {progressData[progressData.length - 1].cumulativePages}
            </div>
            <div className="text-xs text-gray-600">Pages lues</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-orange-600">
              {progressData[progressData.length - 1].cumulativeBooks}
            </div>
            <div className="text-xs text-gray-600">Livres finis</div>
          </div>
        </div>
      )}

      {/* Tendance du mois */}
      {progressData.length > 1 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-700">
            <strong>Tendance :</strong> Ce mois-ci vous avez lu{" "}
            {formatTimeHours(progressData[progressData.length - 1].readingTime)}{" "}
            {progressData.length > 1 && (
              <>
                {progressData[progressData.length - 1].readingTime > 
                 progressData[progressData.length - 2].readingTime ? (
                  <span className="text-green-600 font-medium">
                    (+{formatTimeHours(
                      progressData[progressData.length - 1].readingTime - 
                      progressData[progressData.length - 2].readingTime
                    )} vs mois dernier)
                  </span>
                ) : progressData[progressData.length - 1].readingTime < 
                         progressData[progressData.length - 2].readingTime ? (
                  <span className="text-red-600 font-medium">
                    ({formatTimeHours(
                      progressData[progressData.length - 1].readingTime - 
                      progressData[progressData.length - 2].readingTime
                    )} vs mois dernier)
                  </span>
                ) : (
                  <span className="text-gray-600 font-medium">
                    (même niveau que le mois dernier)
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
