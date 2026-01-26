"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkoutExercise } from "@/types/workout-session";
import { Activity } from "lucide-react";

interface ExerciseDistributionChartProps {
  exercises: WorkoutExercise[];
  className?: string;
}

interface ProcessedSet {
  id: string; 
  reps: number;
}

interface WeightGroup {
  weight: number;
  sets: ProcessedSet[];
}

interface ProcessedExerciseGroup {
  name: string;
  weightGroups: WeightGroup[];
  maxWeight: number;
  minWeight: number;
  maxReps: number;
}

export function ExerciseDistributionChart({ exercises, className = "" }: ExerciseDistributionChartProps) {
  const [hoveredSet, setHoveredSet] = useState<{ name: string; weight: number; reps: number; x: number; y: number } | null>(null);

  const groups = useMemo(() => {
    const validExercises = exercises.filter(
      (ex) => ex.exercise?.name && typeof ex.weight === "number" && ex.weight > 0
    );

    const groupedMap = new Map<string, Map<number, ProcessedSet[]>>();

    validExercises.forEach((ex) => {
      const name = ex.exercise!.name;
      const weight = ex.weight!;
      const setsCount = ex.sets || 1;
      const reps = ex.reps || 0;
      
      if (!groupedMap.has(name)) {
        groupedMap.set(name, new Map());
      }
      
      const exerciseWeights = groupedMap.get(name)!;
      if (!exerciseWeights.has(weight)) {
        exerciseWeights.set(weight, []);
      }

      // Add each set as an individual item
      for (let i = 0; i < setsCount; i++) {
        exerciseWeights.get(weight)!.push({
          id: `${ex.id}-set-${i}`,
          reps
        });
      }
    });

    return Array.from(groupedMap.entries()).map(([name, weightMap]) => {
      const weightGroups = Array.from(weightMap.entries())
        .map(([weight, sets]) => ({ weight, sets }))
        .sort((a, b) => a.weight - b.weight);

      const allSets = weightGroups.flatMap(g => g.sets);
      const allWeights = weightGroups.map(g => g.weight);

      return {
        name,
        weightGroups,
        maxWeight: Math.max(...allWeights),
        minWeight: Math.min(...allWeights),
        maxReps: Math.max(...allSets.map(s => s.reps), 10) // Ensure at least scale to 10
      };
    });
  }, [exercises]);

  if (groups.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Distribution des charges</h3>
        </div>
        <p className="text-gray-500 text-center py-8">Aucune donnée de poids disponible.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Distribution des charges</h3>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {groups.map((group, groupIndex) => (
          <div key={group.name} className="relative">
             <div className="flex items-baseline justify-between mb-2 pb-2 border-b border-gray-100">
                <h4 className="text-base font-semibold text-gray-900 truncate" title={group.name}>
                  {group.name}
                </h4>
             </div>
             
             {/* Charts Area */}
             <div className="flex items-end gap-1 overflow-x-auto pb-4 pt-4" style={{ minHeight: "140px" }}>
                {group.weightGroups.map((wg) => (
                    <div key={wg.weight} className="flex flex-col items-center flex-shrink-0 group/weight" style={{ minWidth: "60px" }}>
                        {/* Bars Container - Reversed so first set is bottom */}
                        <div className="flex flex-col-reverse gap-1 items-center w-full">
                           {wg.sets.map((set, setIndex) => (
                               <motion.div
                                 key={set.id}
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: Math.max(set.reps * 4, 8) + "px", opacity: 1 }} // Scale height by reps
                                 className={`w-8 rounded-md cursor-pointer transition-all flex items-center justify-center ${
                                     getColorClass(groupIndex)
                                 }`}
                                 style={{ width: "24px", minHeight: "20px" }}
                                 title={`${set.reps} réps`}
                                 onMouseEnter={(e) => {
                                     const rect = e.currentTarget.getBoundingClientRect();
                                     setHoveredSet({
                                         name: group.name,
                                         weight: wg.weight,
                                         reps: set.reps,
                                         x: rect.left + rect.width / 2,
                                         y: rect.top
                                     })
                                 }}
                                 onMouseLeave={() => setHoveredSet(null)}
                                 whileHover={{ scale: 1.1, filter: "brightness(1.1)" }}
                               >
                                  <span className="text-[10px] font-bold text-white">{set.reps}</span>
                               </motion.div>
                           ))}
                        </div>
                        
                        {/* Weight Label */}
                        <div className="mt-3 text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                            {wg.weight} <span className="text-[10px] font-normal text-gray-400">kg</span>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        ))}
      </div>

      {/* Reps Legend/Scale Hint could go here */}

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredSet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs font-medium pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: hoveredSet.x,
              top: hoveredSet.y - 8,
            }}
          >
             <div className="flex flex-col items-center">
                <span className="font-bold text-lg leading-none">{hoveredSet.reps}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Reps</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getColorClass(index: number) {
    // Tailwind classes for background colors
    const colors = [
        "bg-green-500 hover:bg-green-400", 
        "bg-blue-500 hover:bg-blue-400", 
        "bg-purple-500 hover:bg-purple-400", 
        "bg-red-500 hover:bg-red-400", 
        "bg-orange-500 hover:bg-orange-400", 
        "bg-teal-500 hover:bg-teal-400", 
    ];
    return colors[index % colors.length];
}
