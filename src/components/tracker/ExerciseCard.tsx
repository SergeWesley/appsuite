"use client";

import { motion } from "framer-motion";
import {
  WorkoutExercise,
  MuscleGroup,
  MUSCLE_GROUP_LABELS,
} from "@/types/workout-session";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  index: number;
}

export function ExerciseCard({ exercise, index }: ExerciseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {exercise.exercise?.name || "Exercice inconnu"}
          </h3>
          <span className="inline-block px-3 py-1 bg-gray-50 text-gray-700 text-sm rounded-full border">
            {MUSCLE_GROUP_LABELS[
              exercise.exercise?.muscleGroup as MuscleGroup
            ] || "Autre"}
          </span>
        </div>
        <div className="text-right text-sm text-gray-500">
          #{exercise.order}
        </div>
      </div>

      {/* Exercise Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {exercise.sets && (
          <div>
            <p className="text-sm text-gray-500">Séries</p>
            <p className="font-semibold text-gray-900">{exercise.sets}</p>
          </div>
        )}
        {exercise.reps && (
          <div>
            <p className="text-sm text-gray-500">Répétitions</p>
            <p className="font-semibold text-gray-900">{exercise.reps}</p>
          </div>
        )}
        {exercise.weight && (
          <div>
            <p className="text-sm text-gray-500">Poids</p>
            <p className="font-semibold text-gray-900">{exercise.weight} kg</p>
          </div>
        )}
        {exercise.duration && (
          <div>
            <p className="text-sm text-gray-500">Durée</p>
            <p className="font-semibold text-gray-900">
              {exercise.duration} min
            </p>
          </div>
        )}
        {exercise.speed && (
          <div>
            <p className="text-sm text-gray-500">Vitesse</p>
            <p className="font-semibold text-gray-900">
              {exercise.speed} km/h
            </p>
          </div>
        )}
        {exercise.slope && (
          <div>
            <p className="text-sm text-gray-500">Pente</p>
            <p className="font-semibold text-gray-900">{exercise.slope} %</p>
          </div>
        )}
      </div>

      {/* Exercise Notes */}
      {exercise.notes && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Notes:</span> {exercise.notes}
          </p>
        </div>
      )}
    </motion.div>
  );
}
