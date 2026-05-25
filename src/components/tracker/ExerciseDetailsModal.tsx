"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/types/workout-session";
import { X, Dumbbell, Timer, History } from "lucide-react";

interface ExerciseDetails {
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  speed?: number;
  slope?: number;
  notes: string;
}

interface ExerciseDetailsModalProps {
  isOpen: boolean;
  exercise: Exercise | null;
  onClose: () => void;
  onConfirm: (details: ExerciseDetails) => void;
  initialDetails?: ExerciseDetails;
  isEditing?: boolean;
  lastPerformances?: ExerciseDetails[];
}

const DEFAULT_STRENGTH: ExerciseDetails = {
  sets: 3,
  reps: 12,
  weight: undefined,
  notes: "",
};

const DEFAULT_CARDIO: ExerciseDetails = {
  duration: 30,
  speed: 5,
  slope: 0,
  notes: "",
};

export function ExerciseDetailsModal({
  isOpen,
  exercise,
  onClose,
  onConfirm,
  initialDetails,
  isEditing = false,
  lastPerformances = [],
}: ExerciseDetailsModalProps) {
  const isCardio = exercise?.muscleGroup === "cardio";
  const [details, setDetails] = useState<ExerciseDetails>(
    initialDetails || (isCardio ? DEFAULT_CARDIO : DEFAULT_STRENGTH),
  );

  // Reset defaults when exercise changes or when opened
  const [prevExerciseId, setPrevExerciseId] = useState<string | null>(null);
  if (exercise && exercise.id !== prevExerciseId) {
    setPrevExerciseId(exercise.id);
    setDetails(initialDetails || (isCardio ? DEFAULT_CARDIO : DEFAULT_STRENGTH));
  }

  // Also update when initialDetails change (e.g., clicking edit on another exercise of the same type)
  const [prevInitial, setPrevInitial] = useState<ExerciseDetails | undefined>(undefined);
  if (initialDetails !== prevInitial) {
    setPrevInitial(initialDetails);
    setDetails(initialDetails || (isCardio ? DEFAULT_CARDIO : DEFAULT_STRENGTH));
  }

  const handleConfirm = () => {
    onConfirm(details);
  };

  const updateField = (field: keyof ExerciseDetails, value: string) => {
    if (field === "notes") {
      setDetails((prev) => ({ ...prev, notes: value }));
    } else {
      setDetails((prev) => ({
        ...prev,
        [field]: value ? parseFloat(value) : undefined,
      }));
    }
  };

  const handleUseLastPerformance = (perf: ExerciseDetails) => {
    setDetails((prev) => ({
      ...prev,
      ...perf,
      notes: prev.notes, // On garde les notes actuelles ou vides, souvent spécifiques à la séance
    }));
  };

  if (!exercise) return null;

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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${isCardio ? "bg-orange-50" : "bg-blue-50"}`}
                  >
                    {isCardio ? (
                      <Timer size={20} className="text-orange-600" />
                    ) : (
                      <Dumbbell size={20} className="text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {exercise.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {isCardio
                        ? "Configurez votre cardio"
                        : "Configurez vos séries"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Last Performances */}
            {lastPerformances.length > 0 && (
              <div className="px-6 pt-5 pb-1">
                <div className="flex items-center gap-2 text-indigo-700 mb-2">
                  <History size={16} />
                  <span className="text-sm font-medium">Dernière séance</span>
                </div>
                <div className="flex flex-col gap-2">
                  {lastPerformances.map((perf, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleUseLastPerformance(perf)}
                      className="w-full flex items-center justify-start gap-3 p-3 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl transition-colors text-left group"
                      title="Utiliser ces données"
                    >
                      <div className="text-sm text-indigo-600 font-semibold bg-white/60 px-2 py-1 rounded-lg">
                        {!isCardio 
                          ? `${perf.sets}×${perf.reps}${perf.weight ? ` • ${perf.weight}kg` : ''}`
                          : `${perf.duration}min${perf.speed ? ` • ${perf.speed}km/h` : ''}`
                        }
                      </div>
                      {perf.notes && (
                        <div className="text-xs text-indigo-400 truncate max-w-[150px]" title={perf.notes}>
                          {perf.notes}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <div className={`p-6 space-y-5 ${lastPerformances.length > 0 ? 'pt-4' : ''}`}>
              {!isCardio ? (
                <>
                  {/* Strength fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Séries
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={details.sets ?? ""}
                        onChange={(e) => updateField("sets", e.target.value)}
                        placeholder="3"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Répétitions
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={details.reps ?? ""}
                        onChange={(e) => updateField("reps", e.target.value)}
                        placeholder="12"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={details.weight ?? ""}
                      onChange={(e) => updateField("weight", e.target.value)}
                      placeholder="Optionnel"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-semibold"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Cardio fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Durée (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={details.duration ?? ""}
                      onChange={(e) => updateField("duration", e.target.value)}
                      placeholder="30"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Vitesse (km/h)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={details.speed ?? ""}
                        onChange={(e) => updateField("speed", e.target.value)}
                        placeholder="5"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Pente (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={details.slope ?? ""}
                        onChange={(e) => updateField("slope", e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-semibold"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Notes - always visible */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes (optionnel)
                </label>
                <input
                  type="text"
                  value={details.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Ex: Augmenter le poids la prochaine fois..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                {isEditing ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type { ExerciseDetails };
