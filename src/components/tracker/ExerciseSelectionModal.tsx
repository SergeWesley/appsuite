"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MuscleGroup, MUSCLE_GROUP_LABELS } from "@/types/workout-session";
import { useExercises } from "@/hooks/tracker/useExercices";
import { X, Search, Filter } from "lucide-react";

export interface ExerciseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string) => void;
}

export function ExerciseSelectionModal({
  isOpen,
  onClose,
  onSelect,
}: ExerciseSelectionModalProps) {
  const { searchExercises } = useExercises();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] =
    useState<MuscleGroup>("all");

  const filteredExercises = searchExercises(searchQuery, selectedMuscleGroup);

  const muscleGroups: MuscleGroup[] = [
    "all",
    "upper_body",
    "lower_body",
    "cardio",
    "core",
    "full_body",
    "other",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Choisir un exercice
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search and Filter */}
              <div className="space-y-4">
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Rechercher un exercice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Filter size={16} className="text-gray-400" />
                  {muscleGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() => setSelectedMuscleGroup(group)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedMuscleGroup === group
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {MUSCLE_GROUP_LABELS[group]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="grid gap-3">
                {filteredExercises.map((exercise) => (
                  <motion.button
                    key={exercise.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelect(exercise.id);
                      onClose();
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {exercise.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                          {exercise.isCustom && " • Personnalisé"}
                        </p>
                        {exercise.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {exercise.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {filteredExercises.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun exercice trouvé</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
