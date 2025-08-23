"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Exercise,
  ExerciseFormData,
  MuscleGroup,
  MUSCLE_GROUP_LABELS,
} from "@/types/workout-session";
import { X, Dumbbell } from "lucide-react";

interface ExerciseFormProps {
  exercise?: Exercise;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExerciseFormData) => void;
  onDelete?: (id: string) => void;
}

export function ExerciseForm({
  exercise,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
}: ExerciseFormProps) {
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: "",
    muscleGroup: "other",
    description: "",
  });

  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        description: exercise.description || "",
      });
    } else {
      setFormData({
        name: "",
        muscleGroup: "other",
        description: "",
      });
    }
  }, [exercise]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      muscleGroup: "other",
      description: "",
    });
  };

  const handleDelete = () => {
    if (exercise && onDelete) {
      onDelete(exercise.id);
      onClose();
    }
  };

  const muscleGroups: MuscleGroup[] = [
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {exercise
                    ? "Modifier l'exercice"
                    : "Nouvel exercice personnalisé"}
                </h2>
                <button
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'exercice *
                  </label>
                  <div className="relative">
                    <Dumbbell
                      size={16}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom de l'exercice"
                    />
                  </div>
                </div>

                {/* Muscle Group */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Groupe musculaire *
                  </label>
                  <select
                    value={formData.muscleGroup}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        muscleGroup: e.target.value as MuscleGroup,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {muscleGroups.map((group) => (
                      <option key={group} value={group}>
                        {MUSCLE_GROUP_LABELS[group]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Description de l'exercice (technique, matériel requis, etc.)"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {exercise && exercise.isCustom && onDelete && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                    >
                      Supprimer
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      onClose();
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {exercise ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
