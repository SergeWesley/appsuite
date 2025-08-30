"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { WorkoutSession, WorkoutExercise } from "@/types/workout-session";
import { motion, AnimatePresence } from "framer-motion";

interface WorkoutStackedBarChartProps {
  session: WorkoutSession;
  className?: string;
}

interface SeriesData {
  id: string;
  weight: number;
  reps: number;
  sets: number;
  volume: number;
  exerciseName: string;
  seriesIndex: number;
}

interface ExerciseBarData {
  exerciseName: string;
  series: SeriesData[];
  totalVolume: number;
  maxWeight: number;
}

interface TooltipData {
  series: SeriesData;
  x: number;
  y: number;
  rect: DOMRect;
}

type ChartMode = 'weight' | 'volume';

export function WorkoutStackedBarChart({ session, className = "" }: WorkoutStackedBarChartProps) {
  const [hoveredSeries, setHoveredSeries] = useState<TooltipData | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<ChartMode>('volume');
  const [isMobile, setIsMobile] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Préparer les données pour le graphique en barres empilées
  const chartData = useMemo(() => {
    const validExercises = session.exercises.filter(
      (ex) => ex.weight && ex.reps && ex.exercise?.name
    );

    if (validExercises.length === 0) return { bars: [], maxValue: 0, maxReps: 0 };

    // Grouper par exercice et créer des séries multiples
    const exerciseGroups = validExercises.reduce((acc, exercise) => {
      const name = exercise.exercise!.name;
      if (!acc[name]) acc[name] = [];
      acc[name].push(exercise);
      return acc;
    }, {} as Record<string, WorkoutExercise[]>);

    const bars: ExerciseBarData[] = [];
    let maxValue = 0;
    let maxReps = 0;

    Object.entries(exerciseGroups).forEach(([exerciseName, exercises]) => {
      const series: SeriesData[] = [];
      let totalVolume = 0;
      let maxWeight = 0;

      // Pour chaque exercice, créer autant de séries qu'il y a de "sets" déclarés
      exercises.forEach((exercise, exerciseIndex) => {
        const weight = exercise.weight!;
        const reps = exercise.reps!;
        const sets = exercise.sets || 1;

        maxReps = Math.max(maxReps, reps);
        maxWeight = Math.max(maxWeight, weight);

        // Créer une série pour chaque set
        for (let setIndex = 0; setIndex < sets; setIndex++) {
          const volume = weight * reps;
          totalVolume += volume;

          series.push({
            id: `${exercise.id}-${setIndex}`,
            weight,
            reps,
            sets: 1, // Chaque série représente un set
            volume,
            exerciseName,
            seriesIndex: series.length,
          });
        }
      });

      bars.push({
        exerciseName,
        series,
        totalVolume,
        maxWeight,
      });

      const barValue = chartMode === 'volume' ? totalVolume : maxWeight;
      maxValue = Math.max(maxValue, barValue);
    });

    return { bars, maxValue, maxReps };
  }, [session.exercises, chartMode]);

  const { bars, maxValue, maxReps } = chartData;

  if (bars.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Visualisation des exercices
        </h3>
        <div className="text-center py-12">
          <p className="text-gray-500">
            Aucune donnée de poids et répétitions disponible pour cette séance.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Ajoutez des données de poids et répétitions pour voir le graphique.
          </p>
        </div>
      </div>
    );
  }

  // Dimensions du graphique adaptatives
  const chartWidth = isMobile ? 350 : 800;
  const chartHeight = isMobile ? 300 : 400;
  const padding = { 
    top: 40, 
    right: isMobile ? 20 : 40, 
    bottom: isMobile ? 100 : 80, 
    left: isMobile ? 50 : 60 
  };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Filtrer les barres selon la sélection
  const filteredBars = selectedExercise 
    ? bars.filter(bar => bar.exerciseName === selectedExercise)
    : bars;

  // Calcul des positions et tailles des barres
  const barWidth = plotWidth / filteredBars.length * 0.8;
  const barSpacing = plotWidth / filteredBars.length * 0.2;

  // Calculer la couleur des segments (basée sur les répétitions)
  const getSegmentColor = (reps: number) => {
    const intensity = reps / maxReps;
    const hue = 220 - (intensity * 60); // Du bleu (220) au orange (160)
    return `hsl(${hue}, 70%, ${50 + intensity * 20}%)`;
  };

  // Gestion des événements de survol
  const handleSegmentHover = (event: React.MouseEvent, series: SeriesData) => {
    if (isMobile) return; // Pas de hover sur mobile

    const target = event.currentTarget as SVGElement;
    const rect = target.getBoundingClientRect();
    const chartRect = chartRef.current?.getBoundingClientRect();
    
    if (chartRect) {
      setHoveredSeries({
        series,
        x: event.clientX - chartRect.left,
        y: event.clientY - chartRect.top,
        rect: chartRect,
      });
    }
  };

  const handleSegmentClick = (series: SeriesData) => {
    if (!isMobile) return; // Click seulement sur mobile
    
    // Sur mobile, on affiche le tooltip de manière persistante
    const chartRect = chartRef.current?.getBoundingClientRect();
    if (chartRect) {
      setHoveredSeries({
        series,
        x: chartRect.width / 2,
        y: chartRect.height / 3,
        rect: chartRect,
      });
    }
  };

  const handleSegmentLeave = () => {
    if (!isMobile) {
      setHoveredSeries(null);
    }
  };

  const handleChartClick = (event: React.MouseEvent) => {
    if (isMobile && event.target === event.currentTarget) {
      setHoveredSeries(null); // Fermer tooltip sur mobile en cliquant ailleurs
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Visualisation des exercices
        </h3>
        
        {/* Mode de visualisation */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Mode:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartMode('volume')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartMode === 'volume'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setChartMode('weight')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartMode === 'weight'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Poids max
            </button>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-orange-500 rounded"></div>
            <span>Couleur = Répétitions {isMobile ? '(cliquez)' : '(survol)'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 bg-blue-400 rounded"></div>
            <span>Chaque segment = 1 série</span>
          </div>
        </div>
        {isMobile && (
          <p className="text-xs text-gray-500 mt-2">
            💡 Cliquez sur un segment pour voir les détails
          </p>
        )}
      </div>

      {/* Filtres d'exercices */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          <button
            onClick={() => setSelectedExercise(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedExercise === null
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
            }`}
          >
            Tous
          </button>
          {bars.map((bar) => (
            <button
              key={bar.exerciseName}
              onClick={() => setSelectedExercise(
                selectedExercise === bar.exerciseName ? null : bar.exerciseName
              )}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedExercise === bar.exerciseName
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              {bar.exerciseName}
            </button>
          ))}
        </div>
      </div>

      {/* Graphique */}
      <div className="relative" ref={chartRef}>
        <div className="overflow-x-auto">
          <svg
            width={chartWidth}
            height={chartHeight}
            className="min-w-full md:min-w-0"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="xMidYMid meet"
            onClick={handleChartClick}
          >
            {/* Grille horizontale */}
            {Array.from({ length: 6 }, (_, i) => {
              const y = padding.top + (plotHeight / 5) * i;
              const value = maxValue - (maxValue / 5) * i;
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + plotWidth}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                  >
                    {chartMode === 'volume' 
                      ? `${Math.round(value)}kg` 
                      : `${Math.round(value)}kg`
                    }
                  </text>
                </g>
              );
            })}

            {/* Barres empilées */}
            {filteredBars.map((bar, barIndex) => {
              const barX = padding.left + barIndex * (barWidth + barSpacing) + barSpacing / 2;
              let currentY = padding.top + plotHeight;
              
              const barValue = chartMode === 'volume' ? bar.totalVolume : bar.maxWeight;
              const barHeight = (barValue / maxValue) * plotHeight;

              return (
                <g key={bar.exerciseName}>
                  {/* Segments de la barre empilée */}
                  {bar.series.map((series, segmentIndex) => {
                    const segmentValue = chartMode === 'volume' ? series.volume : series.weight;
                    const segmentHeight = chartMode === 'volume' 
                      ? (segmentValue / bar.totalVolume) * barHeight
                      : (segmentValue / bar.maxWeight) * barHeight;
                    
                    const segmentY = currentY - segmentHeight;
                    currentY = segmentY;

                    return (
                      <motion.rect
                        key={series.id}
                        x={barX}
                        y={segmentY}
                        width={barWidth}
                        height={segmentHeight}
                        fill={getSegmentColor(series.reps)}
                        stroke="white"
                        strokeWidth="1"
                        className={`cursor-pointer ${isMobile ? 'active:opacity-80' : 'hover:opacity-80'} transition-opacity`}
                        initial={{ height: 0, y: padding.top + plotHeight }}
                        animate={{ height: segmentHeight, y: segmentY }}
                        transition={{ duration: 0.5, delay: barIndex * 0.1 + segmentIndex * 0.05 }}
                        onMouseEnter={(e) => handleSegmentHover(e, series)}
                        onMouseLeave={handleSegmentLeave}
                        onClick={() => handleSegmentClick(series)}
                      />
                    );
                  })}

                  {/* Label de l'exercice */}
                  <text
                    x={barX + barWidth / 2}
                    y={padding.top + plotHeight + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-700 font-medium"
                  >
                    {isMobile && bar.exerciseName.length > 8 
                      ? `${bar.exerciseName.substring(0, 8)}...` 
                      : bar.exerciseName.length > 12 
                      ? `${bar.exerciseName.substring(0, 12)}...` 
                      : bar.exerciseName
                    }
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line
              x1={padding.left}
              y1={padding.top + plotHeight}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight}
              stroke="#374151"
              strokeWidth="2"
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + plotHeight}
              stroke="#374151"
              strokeWidth="2"
            />

            {/* Titre de l'axe Y */}
            <text
              x={20}
              y={padding.top + plotHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90, 20, ${padding.top + plotHeight / 2})`}
              className="text-sm fill-gray-700 font-medium"
            >
              {chartMode === 'volume' ? 'Volume (kg)' : 'Poids (kg)'}
            </text>

            {/* Titre de l'axe X */}
            <text
              x={padding.left + plotWidth / 2}
              y={chartHeight - 20}
              textAnchor="middle"
              className="text-sm fill-gray-700 font-medium"
            >
              Exercices
            </text>
          </svg>
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredSeries && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute z-10 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none ${
                isMobile ? 'left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2' : ''
              }`}
              style={!isMobile ? {
                left: Math.min(hoveredSeries.x + 10, hoveredSeries.rect.width - 150),
                top: Math.max(hoveredSeries.y - 80, 10),
              } : {}}
            >
              <div className="font-semibold">{hoveredSeries.series.exerciseName}</div>
              <div>{hoveredSeries.series.weight}kg × {hoveredSeries.series.reps} reps</div>
              <div className="text-xs text-gray-300">
                Volume: {hoveredSeries.series.volume}kg
              </div>
              <div className="text-xs text-gray-300">
                Série {hoveredSeries.series.seriesIndex + 1}
              </div>
              {isMobile && (
                <div className="text-xs text-gray-400 mt-1 border-t border-gray-600 pt-1">
                  Cliquez ailleurs pour fermer
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Statistiques rapides */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {bars.reduce((sum, bar) => sum + bar.series.length, 0)}
          </div>
          <div className="text-sm text-gray-500">Séries total</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(Math.max(...bars.map(bar => bar.maxWeight)))}kg
          </div>
          <div className="text-sm text-gray-500">Poids max</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {maxReps}
          </div>
          <div className="text-sm text-gray-500">Reps max</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(bars.reduce((sum, bar) => sum + bar.totalVolume, 0))}kg
          </div>
          <div className="text-sm text-gray-500">Volume total</div>
        </div>
      </div>
    </div>
  );
}
