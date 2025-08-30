"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { WorkoutExercise } from "@/types/workout-session";

interface ExercisesBubbleChartProps {
  exercises: WorkoutExercise[];
  className?: string;
}

interface BubbleData {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  sets: number;
  reps: number;
  weight: number;
  color: string;
  volume: number;
}

// Couleurs pour les différents exercices
const COLORS = [
  "#10b981", // green-500
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
];

export function ExercisesBubbleChart({ exercises, className = "" }: ExercisesBubbleChartProps) {
  const bubbleData = useMemo(() => {
    // Filtrer les exercices qui ont au moins poids, séries et répétitions
    const validExercises = exercises.filter(
      (exercise) => exercise.weight && exercise.sets && exercise.reps
    );

    if (validExercises.length === 0) {
      return [];
    }

    // Calculer les données pour chaque bulle
    const bubbles: BubbleData[] = validExercises.map((exercise, index) => {
      const volume = (exercise.sets || 0) * (exercise.reps || 0);
      const weight = exercise.weight || 0;
      
      return {
        id: exercise.id,
        name: exercise.exercise?.name || `Exercice ${index + 1}`,
        x: index,
        y: weight,
        size: volume,
        sets: exercise.sets || 0,
        reps: exercise.reps || 0,
        weight,
        volume,
        color: COLORS[index % COLORS.length],
      };
    });

    return bubbles;
  }, [exercises]);

  if (bubbleData.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Visualisation des exercices
        </h3>
        <div className="flex items-center justify-center h-40 text-gray-500">
          <div className="text-center">
            <p className="text-sm">Aucune donnée disponible</p>
            <p className="text-xs mt-1">
              Les exercices doivent avoir des séries, répétitions et poids
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculer les échelles
  const maxWeight = Math.max(...bubbleData.map(d => d.y));
  const maxVolume = Math.max(...bubbleData.map(d => d.size));
  const minVolume = Math.min(...bubbleData.map(d => d.size));

  // Dimensions du graphique
  const width = 100; // pourcentage
  const height = 300; // pixels
  const padding = 40;

  // Fonction pour calculer la position Y (poids)
  const getY = (weight: number) => {
    const normalizedY = maxWeight > 0 ? 1 - (weight / maxWeight) : 0.5;
    return padding + normalizedY * (height - 2 * padding);
  };

  // Fonction pour calculer la position X (répartie uniformément)
  const getX = (index: number) => {
    const normalizedX = bubbleData.length > 1 ? index / (bubbleData.length - 1) : 0.5;
    return padding + normalizedX * (width - 2 * padding);
  };

  // Fonction pour calculer la taille de la bulle
  const getBubbleSize = (volume: number) => {
    if (maxVolume === minVolume) return 15;
    const normalized = (volume - minVolume) / (maxVolume - minVolume);
    return 8 + normalized * 20; // Entre 8 et 28 pixels de rayon
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Visualisation des exercices
        </h3>
        <p className="text-sm text-gray-600">
          Poids (vertical) • Volume = Séries × Répétitions (taille des bulles)
        </p>
      </div>

      {/* Graphique SVG */}
      <div className="relative overflow-hidden rounded-lg bg-gray-50 border border-gray-200">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-80 sm:h-96"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grille horizontale */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <g key={ratio}>
              <line
                x1={padding}
                y1={padding + ratio * (height - 2 * padding)}
                x2={width - padding}
                y2={padding + ratio * (height - 2 * padding)}
                stroke="#e5e7eb"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              <text
                x={padding - 5}
                y={padding + ratio * (height - 2 * padding)}
                fontSize="3"
                fill="#6b7280"
                textAnchor="end"
                dominantBaseline="central"
              >
                {Math.round((1 - ratio) * maxWeight)}kg
              </text>
            </g>
          ))}

          {/* Axes */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#374151"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#374151"
            strokeWidth="1"
          />

          {/* Bulles */}
          {bubbleData.map((bubble, index) => (
            <motion.g
              key={bubble.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <circle
                cx={getX(index)}
                cy={getY(bubble.y)}
                r={getBubbleSize(bubble.size)}
                fill={bubble.color}
                opacity="0.7"
                stroke="white"
                strokeWidth="1"
                className="hover:opacity-90 transition-opacity cursor-pointer"
              />
              <text
                x={getX(index)}
                y={getY(bubble.y)}
                fontSize="2.5"
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontWeight="600"
                className="pointer-events-none"
              >
                {bubble.sets}×{bubble.reps}
              </text>
            </motion.g>
          ))}
        </svg>

        {/* Tooltip personnalisé au survol - pour mobile on affichera les infos en bas */}
      </div>

      {/* Légende et informations */}
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {bubbleData.map((bubble) => (
            <motion.div
              key={bubble.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: bubble.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {bubble.name}
                </p>
                <p className="text-gray-600 text-xs">
                  {bubble.weight}kg • {bubble.sets}×{bubble.reps} • Vol: {bubble.volume}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Explication */}
        <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
          <p>
            <strong>Axe vertical :</strong> Poids (kg) • 
            <strong className="ml-2">Taille des bulles :</strong> Volume (séries × répétitions) • 
            <strong className="ml-2">Étiquettes :</strong> Séries × Répétitions
          </p>
        </div>
      </div>
    </div>
  );
}
