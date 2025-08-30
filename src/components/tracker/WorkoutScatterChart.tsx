"use client";

import { useState, useMemo } from "react";
import { WorkoutSession, WorkoutExercise } from "@/types/workout-session";
import { motion } from "framer-motion";

interface WorkoutScatterChartProps {
  session: WorkoutSession;
  className?: string;
}

interface ChartPoint {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  sets: number;
  volume: number;
  x: number;
  y: number;
}

interface TooltipData {
  point: ChartPoint;
  x: number;
  y: number;
}

export function WorkoutScatterChart({ session, className = "" }: WorkoutScatterChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<TooltipData | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    const validExercises = session.exercises.filter(
      (ex) => ex.weight && ex.reps && ex.exercise?.name
    );

    if (validExercises.length === 0) return { points: [], xLabels: [], maxWeight: 0, maxReps: 0 };

    // Créer des points à partir des exercices
    // Pour simuler des séries multiples, on peut créer plusieurs points par exercice
    const points: ChartPoint[] = [];
    const exerciseGroups = validExercises.reduce((acc, exercise) => {
      const name = exercise.exercise!.name;
      if (!acc[name]) acc[name] = [];
      acc[name].push(exercise);
      return acc;
    }, {} as Record<string, WorkoutExercise[]>);

    const xLabels = Object.keys(exerciseGroups);
    let maxWeight = 0;
    let maxReps = 0;

    xLabels.forEach((exerciseName, xIndex) => {
      const exercises = exerciseGroups[exerciseName];
      
      exercises.forEach((exercise, seriesIndex) => {
        if (exercise.weight && exercise.reps) {
          const weight = exercise.weight;
          const reps = exercise.reps;
          const sets = exercise.sets || 1;
          const volume = weight * reps * sets;

          // Ajouter un petit décalage horizontal pour éviter les superpositions
          const xOffset = exercises.length > 1 ? (seriesIndex - (exercises.length - 1) / 2) * 0.1 : 0;

          points.push({
            id: exercise.id,
            exerciseName,
            weight,
            reps,
            sets,
            volume,
            x: xIndex + xOffset,
            y: weight,
          });

          maxWeight = Math.max(maxWeight, weight);
          maxReps = Math.max(maxReps, reps);
        }
      });
    });

    return { points, xLabels, maxWeight, maxReps };
  }, [session.exercises]);

  const { points, xLabels, maxWeight, maxReps } = chartData;

  if (points.length === 0) {
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

  // Dimensions du graphique
  const chartWidth = 800;
  const chartHeight = 400;
  const padding = { top: 40, right: 40, bottom: 80, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Échelles
  const xScale = (x: number) => padding.left + (x / Math.max(xLabels.length - 1, 1)) * plotWidth;
  const yScale = (y: number) => padding.top + plotHeight - (y / maxWeight) * plotHeight;

  // Calculer la taille des points (basée sur les répétitions)
  const getPointSize = (reps: number) => {
    const minSize = 6;
    const maxSize = 20;
    return minSize + (reps / maxReps) * (maxSize - minSize);
  };

  // Calculer la couleur des points (basée sur le volume)
  const maxVolume = Math.max(...points.map(p => p.volume));
  const getPointColor = (volume: number) => {
    const intensity = volume / maxVolume;
    const hue = 120 - (intensity * 60); // Du vert (120) au rouge (60)
    return `hsl(${hue}, 70%, 50%)`;
  };

  const handlePointHover = (event: React.MouseEvent, point: ChartPoint) => {
    const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
    setHoveredPoint({
      point,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handlePointLeave = () => {
    setHoveredPoint(null);
  };

  const toggleExerciseSelection = (exerciseName: string) => {
    setSelectedExercise(
      selectedExercise === exerciseName ? null : exerciseName
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 md:mb-0">
          Visualisation des exercices
        </h3>
        <div className="text-sm text-gray-500">
          {points.length} série{points.length > 1 ? 's' : ''} • {xLabels.length} exercice{xLabels.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Légende */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Taille du point = Répétitions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-red-500 rounded-full"></div>
            <span>Couleur = Volume (Poids × Reps)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>Axe Y = Poids (kg)</span>
          </div>
        </div>
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
          {xLabels.map((exerciseName) => (
            <button
              key={exerciseName}
              onClick={() => toggleExerciseSelection(exerciseName)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedExercise === exerciseName
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              {exerciseName}
            </button>
          ))}
        </div>
      </div>

      {/* Graphique */}
      <div className="relative overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="min-w-full md:min-w-0"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grille horizontale */}
          {Array.from({ length: 6 }, (_, i) => {
            const y = padding.top + (plotHeight / 5) * i;
            const weight = maxWeight - (maxWeight / 5) * i;
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
                  {Math.round(weight)}kg
                </text>
              </g>
            );
          })}

          {/* Lignes verticales pour les exercices */}
          {xLabels.map((label, i) => {
            const x = xScale(i);
            return (
              <line
                key={i}
                x1={x}
                y1={padding.top}
                x2={x}
                y2={padding.top + plotHeight}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            );
          })}

          {/* Points de données */}
          {points
            .filter(point => !selectedExercise || point.exerciseName === selectedExercise)
            .map((point) => (
              <motion.circle
                key={point.id}
                cx={xScale(point.x)}
                cy={yScale(point.y)}
                r={getPointSize(point.reps)}
                fill={getPointColor(point.volume)}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer drop-shadow-sm"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                whileHover={{ scale: 1.1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={(e) => handlePointHover(e, point)}
                onMouseLeave={handlePointLeave}
              />
            ))}

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

          {/* Labels des exercices */}
          {xLabels.map((label, i) => (
            <text
              key={i}
              x={xScale(i)}
              y={padding.top + plotHeight + 20}
              textAnchor="middle"
              className="text-xs fill-gray-700 font-medium"
            >
              {label.length > 12 ? `${label.substring(0, 12)}...` : label}
            </text>
          ))}

          {/* Titre de l'axe Y */}
          <text
            x={20}
            y={padding.top + plotHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 20, ${padding.top + plotHeight / 2})`}
            className="text-sm fill-gray-700 font-medium"
          >
            Poids (kg)
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

        {/* Tooltip */}
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-10 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
            style={{
              left: hoveredPoint.x + 10,
              top: hoveredPoint.y - 60,
            }}
          >
            <div className="font-semibold">{hoveredPoint.point.exerciseName}</div>
            <div>{hoveredPoint.point.weight}kg × {hoveredPoint.point.reps} reps</div>
            <div className="text-xs text-gray-300">
              Volume: {hoveredPoint.point.volume}kg
            </div>
            {hoveredPoint.point.sets > 1 && (
              <div className="text-xs text-gray-300">
                {hoveredPoint.point.sets} séries
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(maxWeight)}kg
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
            {Math.round(Math.max(...points.map(p => p.volume)))}kg
          </div>
          <div className="text-sm text-gray-500">Volume max</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(points.reduce((sum, p) => sum + p.volume, 0))}kg
          </div>
          <div className="text-sm text-gray-500">Volume total</div>
        </div>
      </div>
    </div>
  );
}
