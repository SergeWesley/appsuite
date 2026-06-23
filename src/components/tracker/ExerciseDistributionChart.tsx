"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkoutExercise } from "@/types/workout-session";
import { Activity, FileText, X, Check, Pencil } from "lucide-react";

interface ExerciseDistributionChartProps {
  exercises: WorkoutExercise[];
  className?: string;
  onEditExercise?: (workoutExerciseId: string) => void;
}

interface ProcessedSet {
  id: string;
  reps: number;
  workoutExerciseId: string;
}

interface WeightGroup {
  weight: number;
  sets: ProcessedSet[];
  notes?: string;
}

interface ProcessedExerciseGroup {
  name: string;
  weightGroups: WeightGroup[];
  maxWeight: number;
  minWeight: number;
  maxReps: number;
}

export function ExerciseDistributionChart({
  exercises,
  className = "",
  onEditExercise,
}: ExerciseDistributionChartProps) {
  const [activeNote, setActiveNote] = useState<{
    title: string;
    text: string;
  } | null>(null);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    const validExercises = exercises.filter(
      (ex) =>
        ex.exercise?.name && typeof ex.weight === "number" && ex.weight > 0,
    );

    const groupedMap = new Map<
      string,
      Map<number, { sets: ProcessedSet[]; notes?: string }>
    >();

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
        exerciseWeights.set(weight, { sets: [], notes: ex.notes });
      } else if (ex.notes && !exerciseWeights.get(weight)!.notes) {
        // Keep the first encountered note for this weight
        exerciseWeights.get(weight)!.notes = ex.notes;
      }

      // Add each set as an individual item
      for (let i = 0; i < setsCount; i++) {
        exerciseWeights.get(weight)!.sets.push({
          id: `${ex.id}-set-${i}`,
          reps,
          workoutExerciseId: ex.id,
        });
      }
    });

    return Array.from(groupedMap.entries()).map(([name, weightMap]) => {
      const weightGroups = Array.from(weightMap.entries())
        .map(([weight, data]) => ({
          weight,
          sets: data.sets,
          notes: data.notes,
        }))
        .sort((a, b) => a.weight - b.weight);

      const allSets = weightGroups.flatMap((g) => g.sets);
      const allWeights = weightGroups.map((g) => g.weight);

      return {
        name,
        weightGroups,
        maxWeight: Math.max(...allWeights),
        minWeight: Math.min(...allWeights),
        maxReps: Math.max(...allSets.map((s) => s.reps), 10), // Ensure at least scale to 10
      };
    });
  }, [exercises]);

  if (groups.length === 0) {
    return (
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Distribution des charges
          </h3>
        </div>
        <p className="text-gray-500 text-center py-8">
          Aucune donnée de poids disponible.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Distribution des charges
          </h3>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {groups.map((group, groupIndex) => (
          <div key={group.name} className="relative">
            <div className="flex items-baseline justify-between mb-2 pb-2 border-b border-gray-100">
              <h4
                className="text-base font-semibold text-gray-900 truncate"
                title={group.name}
              >
                {group.name}
              </h4>
            </div>

            {/* Charts Area */}
            <div
              className="flex items-end gap-1 overflow-x-auto pb-4 pt-4"
              style={{ minHeight: "140px" }}
            >
              {group.weightGroups.map((wg) => (
                <div
                  key={wg.weight}
                  className="flex flex-col items-center flex-shrink-0 group/weight"
                  style={{ minWidth: "60px" }}
                >
                  {/* Bars Container - Reversed so first set is bottom */}
                  <div className="flex flex-col-reverse gap-1 items-center w-full">
                    {wg.sets.map((set, setIndex) => {
                      const isCompleted = completedSets.has(set.id);
                      return (
                      <motion.div
                        key={set.id}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: Math.max(set.reps * 4, 8) + "px",
                          opacity: 1,
                        }} // Scale height by reps
                        className={`w-8 rounded-md cursor-pointer transition-all flex items-center justify-center relative ${getColorClass(
                          groupIndex,
                        )}`}
                        style={{ width: "24px", minHeight: "20px" }}
                        title={`${set.reps} réps`}
                        onClick={() => {
                          setCompletedSets((prev) => {
                            const next = new Set(prev);
                            if (next.has(set.id)) next.delete(set.id);
                            else next.add(set.id);
                            return next;
                          });
                        }}
                        whileHover={{ scale: 1.1, filter: "brightness(1.1)" }}
                      >
                        {isCompleted && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                        <span className={`text-[10px] font-bold text-white z-10 ${isCompleted ? "opacity-0" : ""}`}>
                          {set.reps}
                        </span>
                      </motion.div>
                    )})}
                  </div>

                  {/* Weight Label & Notes Badge */}
                  <div className="mt-3 flex items-center gap-1">
                    <button
                      onClick={() => onEditExercise?.(wg.sets[0].workoutExerciseId)}
                      className="group flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                      title="Modifier cet exercice"
                    >
                      <span>
                        {wg.weight}{" "}
                        <span className="text-[10px] font-normal text-gray-400 group-hover:text-gray-500 transition-colors">
                          kg
                        </span>
                      </span>
                      <Pencil size={12} className="hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
                    </button>
                    {wg.notes && (
                      <button
                        onClick={() =>
                          setActiveNote({
                            title: `${group.name} (${wg.weight} kg)`,
                            text: wg.notes!,
                          })
                        }
                        className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-200 transition-colors flex-shrink-0 shadow-sm"
                        title="Voir les notes"
                      >
                        <FileText size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Reps Legend/Scale Hint could go here */}


      {/* Notes Modal Overlay */}
      <AnimatePresence>
        {activeNote && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden relative"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <FileText size={20} className="text-amber-600" />
                  </div>
                  <h3
                    className="font-semibold text-gray-900 truncate pr-2 max-w-[220px]"
                    title={activeNote.title}
                  >
                    {activeNote.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveNote(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {activeNote.text}
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setActiveNote(null)}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
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
