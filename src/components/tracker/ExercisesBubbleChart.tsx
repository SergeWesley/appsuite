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
  shortName: string;
  x: number;
  y: number;
  size: number;
  sets: number;
  reps: number;
  weight: number;
  color: string;
  colorIntensity: number;
}

// Fonction pour générer une couleur basée sur l'intensité des répétitions
const getColorFromReps = (reps: number, maxReps: number) => {
  const intensity = maxReps > 0 ? reps / maxReps : 0;

  // Gradient de bleu (faible) à rouge (élevé)
  if (intensity < 0.33) {
    // Bleu à cyan
    const localIntensity = intensity / 0.33;
    return `hsl(${240 - localIntensity * 60}, 80%, ${60 + localIntensity * 10}%)`;
  } else if (intensity < 0.66) {
    // Cyan à jaune
    const localIntensity = (intensity - 0.33) / 0.33;
    return `hsl(${180 - localIntensity * 120}, 80%, ${70 + localIntensity * 10}%)`;
  } else {
    // Jaune à rouge
    const localIntensity = (intensity - 0.66) / 0.34;
    return `hsl(${60 - localIntensity * 60}, 80%, ${80 - localIntensity * 20}%)`;
  }
};

// Fonction pour raccourcir les noms d'exercices
const shortenExerciseName = (name: string, maxLength = 12) => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + "...";
};

export function ExercisesBubbleChart({ exercises, className = "" }: ExercisesBubbleChartProps) {
  const bubbleData = useMemo(() => {
    // Filtrer les exercices qui ont au moins poids, séries et répétitions
    const validExercises = exercises.filter(
      (exercise) => exercise.weight && exercise.sets && exercise.reps
    );

    if (validExercises.length === 0) {
      return [];
    }

    // Calculer les valeurs max pour les échelles
    const maxReps = Math.max(...validExercises.map(ex => ex.reps || 0));

    // Calculer les données pour chaque bulle
    const bubbles: BubbleData[] = validExercises.map((exercise, index) => {
      const sets = exercise.sets || 0;
      const reps = exercise.reps || 0;
      const weight = exercise.weight || 0;
      const name = exercise.exercise?.name || `Exercice ${index + 1}`;

      return {
        id: exercise.id,
        name,
        shortName: shortenExerciseName(name),
        x: index,
        y: weight,
        size: sets, // Taille = nombre de séries
        sets,
        reps,
        weight,
        color: getColorFromReps(reps, maxReps),
        colorIntensity: maxReps > 0 ? reps / maxReps : 0,
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
  const minWeight = Math.min(...bubbleData.map(d => d.y));
  const maxSets = Math.max(...bubbleData.map(d => d.size));
  const minSets = Math.min(...bubbleData.map(d => d.size));

  // Dimensions du graphique
  const width = 100; // pourcentage pour le viewBox
  const height = 80; // pourcentage pour le viewBox
  const paddingLeft = 8;
  const paddingRight = 4;
  const paddingTop = 8;
  const paddingBottom = 20; // Plus d'espace pour les noms d'exercices

  // Fonction pour calculer la position Y (poids)
  const getY = (weight: number) => {
    if (maxWeight === minWeight) return height / 2;
    const normalizedY = (weight - minWeight) / (maxWeight - minWeight);
    return paddingTop + (1 - normalizedY) * (height - paddingTop - paddingBottom);
  };

  // Fonction pour calculer la position X (exercices)
  const getX = (index: number) => {
    if (bubbleData.length === 1) return width / 2;
    const spacing = (width - paddingLeft - paddingRight) / (bubbleData.length - 1);
    return paddingLeft + index * spacing;
  };

  // Fonction pour calculer la taille de la bulle (basée sur les séries)
  const getBubbleSize = (sets: number) => {
    if (maxSets === minSets) return 2;
    const normalized = (sets - minSets) / (maxSets - minSets);
    return 1.5 + normalized * 3; // Entre 1.5 et 4.5 unités de rayon
  };

  // Générer les valeurs pour l'axe Y (poids)
  const getYAxisValues = () => {
    const range = maxWeight - minWeight;
    const step = range / 4;
    return [0, 1, 2, 3, 4].map(i => Math.round((minWeight + i * step) * 10) / 10);
  };

  const yAxisValues = getYAxisValues();

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
