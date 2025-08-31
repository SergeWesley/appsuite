"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkoutExercise } from "@/types/workout-session";
import { BarChart3 } from "lucide-react";

interface ProcessedExercise {
  id: string;
  name: string;
  weight: number;
  reps: number;
  sets: number;
  color: string;
  count: number; // Nombre d'occurrences fusionnées
}

interface ExerciseBubblePlotProps {
  exercises: WorkoutExercise[];
  className?: string;
}

// Fonction pour générer des couleurs distinctes
function generateColors(count: number): string[] {
  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
    "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
    "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
    "#ec4899", "#f43f5e", "#be123c", "#dc2626", "#ea580c"
  ];
  
  if (count <= colors.length) {
    return colors.slice(0, count);
  }
  
  // Si on a besoin de plus de couleurs, on génère des variations
  const baseColors = colors;
  const extraColors = [];
  for (let i = 0; i < count - baseColors.length; i++) {
    const baseColor = baseColors[i % baseColors.length];
    // Créer des variations en ajustant la luminosité
    const hue = Math.random() * 360;
    extraColors.push(`hsl(${hue}, 65%, 55%)`);
  }
  
  return [...baseColors, ...extraColors];
}

export function ExerciseBubblePlot({ exercises, className = "" }: ExerciseBubblePlotProps) {
  const [hoveredBubble, setHoveredBubble] = useState<ProcessedExercise | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);

  // Hook pour détecter la taille de l'écran
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Traitement des données selon les règles
  const processedData = useMemo(() => {
    // Filtrer les exercices qui ont les données nécessaires
    const validExercises = exercises.filter(
      (ex) =>
        ex.exercise?.name &&
        typeof ex.weight === "number" &&
        typeof ex.reps === "number" &&
        typeof ex.sets === "number" &&
        ex.weight > 0 &&
        ex.reps > 0 &&
        ex.sets > 0
    );

    if (validExercises.length === 0) return [];

    // Créer une map pour regrouper les exercices identiques
    const exerciseGroups = new Map<string, {
      name: string;
      weight: number;
      reps: number;
      sets: number;
      count: number;
      uniqueKey: string;
    }>();

    validExercises.forEach((ex) => {
      const key = `${ex.exercise!.name}-${ex.weight}-${ex.reps}-${ex.sets}`;

      if (exerciseGroups.has(key)) {
        exerciseGroups.get(key)!.count += 1;
      } else {
        exerciseGroups.set(key, {
          name: ex.exercise!.name,
          weight: ex.weight!,
          reps: ex.reps!,
          sets: ex.sets!,
          count: 1,
          uniqueKey: key,
        });
      }
    });

    // Convertir en tableau et assigner des couleurs uniques à chaque combinaison
    const groupedExercises = Array.from(exerciseGroups.values());

    // Générer des couleurs pour chaque combinaison unique (pas seulement par nom d'exercice)
    const colors = generateColors(groupedExercises.length);

    return groupedExercises.map((ex, index) => ({
      id: `bubble-${index}`,
      name: ex.name,
      weight: ex.weight,
      reps: ex.reps,
      sets: ex.sets,
      color: colors[index],
      count: ex.count,
    }));
  }, [exercises]);

  // Configuration du graphique responsive
  const margins = { top: 20, right: 20, bottom: 60, left: 60 };
  const baseWidth = 400;
  const baseHeight = 300;

  // Adapter la taille selon l'écran
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const plotWidth = isMobile ? Math.min(baseWidth, window.innerWidth - 100) : baseWidth;
  const plotHeight = isMobile ? Math.min(baseHeight, 250) : baseHeight;
  const totalWidth = plotWidth + margins.left + margins.right;
  const totalHeight = plotHeight + margins.top + margins.bottom;

  // Calcul des échelles
  const scales = useMemo(() => {
    if (processedData.length === 0) return null;

    const weights = processedData.map(d => d.weight);
    const reps = processedData.map(d => d.reps);
    const sets = processedData.map(d => d.sets);

    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const minReps = Math.min(...reps);
    const maxReps = Math.max(...reps);
    const minSets = Math.min(...sets);
    const maxSets = Math.max(...sets);

    // Ajouter un padding aux échelles
    const weightPadding = (maxWeight - minWeight) * 0.1 || 5;
    const repsPadding = (maxReps - minReps) * 0.1 || 1;

    return {
      xScale: {
        domain: [Math.max(0, minWeight - weightPadding), maxWeight + weightPadding],
        range: [0, plotWidth],
      },
      yScale: {
        domain: [Math.max(0, minReps - repsPadding), maxReps + repsPadding],
        range: [plotHeight, 0], // Inverser pour SVG
      },
      sizeScale: {
        domain: [minSets, maxSets],
        range: [8, 40], // Taille min/max des bulles
      },
    };
  }, [processedData, plotWidth, plotHeight]);

  // Fonctions d'échelle
  const scaleX = (value: number) => {
    if (!scales) return 0;
    const { domain, range } = scales.xScale;
    return ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]) + range[0];
  };

  const scaleY = (value: number) => {
    if (!scales) return 0;
    const { domain, range } = scales.yScale;
    return ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]) + range[0];
  };

  const scaleSize = (value: number) => {
    if (!scales) return 8;
    const { domain, range } = scales.sizeScale;
    const ratio = (value - domain[0]) / (domain[1] - domain[0]);
    return range[0] + ratio * (range[1] - range[0]);
  };

  // Gestion du survol
  const handleMouseEnter = (bubble: ProcessedExercise, event: React.MouseEvent) => {
    setHoveredBubble(bubble);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredBubble(null);
  };


  if (processedData.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Visualisation des exercices
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">
            Aucune donnée d'exercice à visualiser. Assurez-vous que vos exercices ont des valeurs pour le poids, les répétitions et les séries.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={20} className="text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Visualisation des exercices
        </h3>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Graphique */}
        <div className="flex-1 overflow-x-auto">
          <div className="relative min-w-0">
            <svg
              width={totalWidth}
              height={totalHeight}
              viewBox={`0 0 ${totalWidth} ${totalHeight}`}
              className="border border-gray-200 rounded-lg bg-gray-50 w-full h-auto"
              style={{ minWidth: `${totalWidth}px`, maxWidth: "100%" }}
            >
              {/* Grille de fond */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width={plotWidth} height={plotHeight} x={margins.left} y={margins.top} fill="url(#grid)" />

              {/* Axes */}
              <g transform={`translate(${margins.left}, ${margins.top})`}>
                {/* Axe X */}
                <line
                  x1={0}
                  y1={plotHeight}
                  x2={plotWidth}
                  y2={plotHeight}
                  stroke="#374151"
                  strokeWidth={2}
                />
                
                {/* Axe Y */}
                <line
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={plotHeight}
                  stroke="#374151"
                  strokeWidth={2}
                />

                {/* Labels des axes */}
                {scales && (
                  <>
                    {/* Ticks X */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                      const x = ratio * plotWidth;
                      const value = scales.xScale.domain[0] + ratio * (scales.xScale.domain[1] - scales.xScale.domain[0]);
                      return (
                        <g key={`x-tick-${ratio}`}>
                          <line
                            x1={x}
                            y1={plotHeight}
                            x2={x}
                            y2={plotHeight + 5}
                            stroke="#374151"
                            strokeWidth={1}
                          />
                          <text
                            x={x}
                            y={plotHeight + 20}
                            textAnchor="middle"
                            className="text-xs fill-gray-600"
                          >
                            {Math.round(value)}
                          </text>
                        </g>
                      );
                    })}

                    {/* Ticks Y */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                      const y = (1 - ratio) * plotHeight;
                      const value = scales.yScale.domain[0] + ratio * (scales.yScale.domain[1] - scales.yScale.domain[0]);
                      return (
                        <g key={`y-tick-${ratio}`}>
                          <line
                            x1={-5}
                            y1={y}
                            x2={0}
                            y2={y}
                            stroke="#374151"
                            strokeWidth={1}
                          />
                          <text
                            x={-10}
                            y={y + 4}
                            textAnchor="end"
                            className="text-xs fill-gray-600"
                          >
                            {Math.round(value)}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}

                {/* Bulles */}
                {processedData.map((bubble) => {
                  const cx = scaleX(bubble.weight);
                  const cy = scaleY(bubble.reps);
                  const r = scaleSize(bubble.sets);

                  return (
                    <motion.circle
                      key={bubble.id}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={bubble.color}
                      fillOpacity={0.7}
                      stroke={bubble.color}
                      strokeWidth={2}
                      className="cursor-pointer"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.1, fillOpacity: 0.9 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      onMouseEnter={(e) => handleMouseEnter(bubble, e)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })}
              </g>

              {/* Labels des axes */}
              <text
                x={margins.left + plotWidth / 2}
                y={totalHeight - 10}
                textAnchor="middle"
                className="text-sm font-medium fill-gray-700"
              >
                Poids (kg)
              </text>
              <text
                x={15}
                y={margins.top + plotHeight / 2}
                textAnchor="middle"
                transform={`rotate(-90, 15, ${margins.top + plotHeight / 2})`}
                className="text-sm font-medium fill-gray-700"
              >
                Répétitions
              </text>
            </svg>
          </div>
        </div>

        {/* Légende */}
        <div className="lg:w-64 mt-4 lg:mt-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Exercices</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {processedData.map((exercise, index) => (
              <div key={`${exercise.name}-${exercise.weight}-${exercise.reps}-${exercise.sets}`} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: exercise.color }}
                />
                <span className="text-sm text-gray-700 truncate">
                  {exercise.name} ({exercise.weight}kg × {exercise.reps} × {exercise.sets})
                  {exercise.count > 1 && (
                    <span className="text-gray-500 ml-1">×{exercise.count}</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h5 className="text-xs font-semibold text-gray-600 mb-2">LÉGENDE</h5>
            <div className="space-y-1 text-xs text-gray-500">
              <div>• Axe X = Poids (kg)</div>
              <div>• Axe Y = Répétitions</div>
              <div>• Taille = Nombre de séries</div>
              <div>• Couleur = Combinaison unique</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg pointer-events-none"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
              transform: "translateY(-100%)",
            }}
          >
            <div className="font-semibold">{hoveredBubble.name}</div>
            <div className="text-sm space-y-1">
              <div>Poids: {hoveredBubble.weight} kg</div>
              <div>Répétitions: {hoveredBubble.reps}</div>
              <div>Séries: {hoveredBubble.sets}</div>
              {hoveredBubble.count > 1 && (
                <div className="text-gray-300">
                  Occurrence{hoveredBubble.count > 1 ? "s" : ""}: {hoveredBubble.count}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
