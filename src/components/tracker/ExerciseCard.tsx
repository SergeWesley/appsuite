"use client";

import { useRef } from "react";
import {
  WorkoutExercise,
  MuscleGroup,
  MUSCLE_GROUP_LABELS,
} from "@/types/workout-session";
import { Trash2, Edit2 } from "lucide-react";
import { SwipeableCard } from "@/components/SwipeableCard";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  index: number;
  onDelete?: (exerciseId: string) => void;
  onEdit?: (exerciseId: string) => void;
}

export function ExerciseCard({ exercise, index, onDelete, onEdit }: ExerciseCardProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = () => {
    timerRef.current = setTimeout(() => {
      if (onEdit) {
        onEdit(exercise.id);
      }
    }, 600); // 600ms pour un appui long
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <SwipeableCard
      index={index}
      onDelete={onDelete ? () => onDelete(exercise.id) : undefined}
      className="p-6 cursor-grab active:cursor-grabbing"
      onContextMenu={(e) => {
        e.preventDefault();
        if (onEdit) {
          onEdit(exercise.id);
        }
      }}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
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
        <div className="flex items-center gap-3">
          {/* Edit button on hover (desktop only) */}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(exercise.id);
              }}
              className="hidden sm:flex p-2 text-gray-300 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-50"
              aria-label="Modifier l'exercice"
            >
              <Edit2 size={18} />
            </button>
          )}
          {/* Delete button on hover (desktop only) */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(exercise.id);
              }}
              className="hidden sm:flex p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              aria-label="Supprimer l'exercice"
            >
              <Trash2 size={18} />
            </button>
          )}
          <div className="text-right text-sm text-gray-500">
            #{exercise.order}
          </div>
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
    </SwipeableCard>
  );
}
