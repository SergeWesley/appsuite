"use client";

import { useState, useRef, useEffect } from "react";
import { WorkoutExercise } from "@/types/workout-session";
import { motion } from "framer-motion";

interface SeriesData {
  exerciseName: string;
  weight: number;
  reps: number;
  volume: number;
  setNumber: number;
}

interface WorkoutScatterChartProps {
  exercises: WorkoutExercise[];
  className?: string;
}

export function WorkoutScatterChart({ exercises, className = "" }: WorkoutScatterChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<SeriesData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Transformer les données d'exercices en données de séries
  const seriesData: SeriesData[] = exercises.flatMap((exercise) => {
    if (!exercise.exercise?.name || !exercise.weight || !exercise.reps) {
      return [];
    }

    // Simuler plusieurs séries basées sur le nombre de sets
    const numSets = exercise.sets || 1;
    const baseWeight = exercise.weight;
    const baseReps = exercise.reps;
    
    return Array.from({ length: numSets }, (_, index) => {
      // Variation légère du poids et reps pour simuler des séries réelles
      const weightVariation = Math.random() * 5 - 2.5; // ±2.5kg
      const repsVariation = Math.floor(Math.random() * 3 - 1); // ±1 rep
      
      const weight = Math.max(baseWeight + weightVariation, 0);
      const reps = Math.max(baseReps + repsVariation, 1);
      
      return {
        exerciseName: exercise.exercise!.name,
        weight: Math.round(weight * 10) / 10,
        reps,
        volume: Math.round(weight * reps * 10) / 10,
        setNumber: index + 1,
      };
    });
  });

  if (seriesData.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Graphique des séries
        </h3>
        <div className="text-center py-8 text-gray-500">
          Aucune donnée de poids et répétitions disponible pour cette séance.
        </div>
      </div>
    );
  }

  // Obtenir les exercices uniques et leurs positions X
  const uniqueExercises = Array.from(new Set(seriesData.map(s => s.exerciseName)));
  const exercisePositions = uniqueExercises.reduce((acc, exercise, index) => {
    acc[exercise] = index;
    return acc;
  }, {} as Record<string, number>);

  // Dimensions du graphique
  const chartWidth = isMobile ? 300 : 400;
  const chartHeight = 250;
  const margin = { top: 20, right: 20, bottom: 60, left: 60 };
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;

  // Échelles
  const maxWeight = Math.max(...seriesData.map(s => s.weight));
  const minWeight = Math.min(...seriesData.map(s => s.weight));
  const weightRange = maxWeight - minWeight || 1;
  const maxReps = Math.max(...seriesData.map(s => s.reps));
  const maxVolume = Math.max(...seriesData.map(s => s.volume));

  // Fonctions d'échelle
  const getX = (exerciseName: string) => {
    const position = exercisePositions[exerciseName];
    return margin.left + (position / Math.max(uniqueExercises.length - 1, 1)) * plotWidth;
  };

  const getY = (weight: number) => {
    return margin.top + plotHeight - ((weight - minWeight) / weightRange) * plotHeight;
  };

  const getRadius = (reps: number) => {
    return isMobile ? 3 + (reps / maxReps) * 6 : 4 + (reps / maxReps) * 8;
  };

  const getColor = (volume: number) => {
    const intensity = volume / maxVolume;
    const hue = Math.floor((1 - intensity) * 120); // De vert (120) à rouge (0)
    return `hsl(${hue}, 70%, 50%)`;
  };

  const handlePointInteraction = (series: SeriesData, event: React.MouseEvent) => {
    if (isMobile) {
      // Sur mobile, toggle la sélection
      setSelectedPoint(selectedPoint?.exerciseName === series.exerciseName && 
                     selectedPoint?.setNumber === series.setNumber ? null : series);
    } else {
      // Sur desktop, hover
      setSelectedPoint(series);
      const rect = chartRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltipPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    }
  };

  const handleChartLeave = () => {
    if (!isMobile) {
      setSelectedPoint(null);
    }
  };

  const handleMobileBackground = () => {
    if (isMobile) {
      setSelectedPoint(null);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 md:mb-0">
          Graphique des séries
        </h3>
        {isMobile && (
          <p className="text-xs text-gray-500">
            Touchez un point pour voir les détails
          </p>
        )}
      </div>

      <div className="relative overflow-x-auto">
        <svg
          ref={chartRef}
          width={chartWidth}
          height={chartHeight}
          className="min-w-full"
          onMouseLeave={handleChartLeave}
          onClick={handleMobileBackground}
        >
          {/* Grille horizontale */}
          {Array.from({ length: 5 }, (_, i) => {
            const weight = minWeight + (weightRange * i) / 4;
            const y = getY(weight);
            return (
              <g key={i}>
                <line
                  x1={margin.left}
                  x2={margin.left + plotWidth}
                  y1={y}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 8}
                  y={y + 4}
                  fontSize="10"
                  fill="#6b7280"
                  textAnchor="end"
                >
                  {Math.round(weight)}kg
                </text>
              </g>
            );
          })}

          {/* Lignes verticales pour les exercices */}
          {uniqueExercises.map((exercise, index) => {
            const x = getX(exercise);
            return (
              <line
                key={exercise}
                x1={x}
                x2={x}
                y1={margin.top}
                y2={margin.top + plotHeight}
                stroke="#f3f4f6"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            );
          })}

          {/* Points des séries */}
          {seriesData.map((series, index) => {
            const x = getX(series.exerciseName);
            const y = getY(series.weight);
            const radius = getRadius(series.reps);
            const color = getColor(series.volume);
            const isSelected = selectedPoint?.exerciseName === series.exerciseName && 
                             selectedPoint?.setNumber === series.setNumber;

            return (
              <motion.circle
                key={`${series.exerciseName}-${series.setNumber}`}
                cx={x}
                cy={y}
                r={radius}
                fill={color}
                stroke={isSelected ? "#374151" : "white"}
                strokeWidth={isSelected ? 2 : 1}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={(e) => !isMobile && handlePointInteraction(series, e)}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePointInteraction(series, e);
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={!isMobile ? { scale: 1.2 } : {}}
                style={{
                  filter: isSelected ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' : undefined
                }}
              />
            );
          })}

          {/* Axes */}
          <line
            x1={margin.left}
            x2={margin.left + plotWidth}
            y1={margin.top + plotHeight}
            y2={margin.top + plotHeight}
            stroke="#374151"
            strokeWidth="2"
          />
          <line
            x1={margin.left}
            x2={margin.left}
            y1={margin.top}
            y2={margin.top + plotHeight}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* Labels des exercices */}
          {uniqueExercises.map((exercise) => {
            const x = getX(exercise);
            const truncatedName = isMobile && exercise.length > 10 
              ? exercise.substring(0, 8) + '...' 
              : exercise;
            
            return (
              <text
                key={exercise}
                x={x}
                y={margin.top + plotHeight + 15}
                fontSize={isMobile ? "9" : "10"}
                fill="#374151"
                textAnchor="middle"
                className="font-medium"
              >
                {truncatedName}
              </text>
            );
          })}

          {/* Label axe Y */}
          <text
            x={15}
            y={margin.top + plotHeight / 2}
            fontSize="11"
            fill="#6b7280"
            textAnchor="middle"
            transform={`rotate(-90, 15, ${margin.top + plotHeight / 2})`}
            className="font-medium"
          >
            Poids (kg)
          </text>
        </svg>

        {/* Tooltip pour desktop */}
        {selectedPoint && !isMobile && (
          <div
            className="absolute bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-10 shadow-lg"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 10,
              transform: 'translateY(-100%)',
            }}
          >
            <div className="font-semibold">{selectedPoint.exerciseName}</div>
            <div>Série {selectedPoint.setNumber}</div>
            <div>{selectedPoint.weight}kg × {selectedPoint.reps} reps</div>
            <div className="text-gray-300">Volume: {selectedPoint.volume}kg</div>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Taille = Répétitions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-red-500"></div>
            <span>Couleur = Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Position Y = Poids</span>
          </div>
        </div>
      </div>

      {/* Informations sélectionnées sur mobile */}
      {selectedPoint && isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-gray-50 rounded-lg border"
        >
          <div className="font-semibold text-gray-900">{selectedPoint.exerciseName}</div>
          <div className="text-sm text-gray-600 mt-1">
            Série {selectedPoint.setNumber}: {selectedPoint.weight}kg × {selectedPoint.reps} reps
          </div>
          <div className="text-sm text-gray-500">
            Volume: {selectedPoint.volume}kg
          </div>
        </motion.div>
      )}
    </div>
  );
}
