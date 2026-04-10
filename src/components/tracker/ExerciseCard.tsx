"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import {
  WorkoutExercise,
  MuscleGroup,
  MUSCLE_GROUP_LABELS,
} from "@/types/workout-session";
import { Trash2, Edit2 } from "lucide-react";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  index: number;
  onDelete?: (exerciseId: string) => void;
  onEdit?: (exerciseId: string) => void;
}

const SWIPE_THRESHOLD = -80;

export function ExerciseCard({ exercise, index, onDelete, onEdit }: ExerciseCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.6, 0]);
  const deleteScale = useTransform(x, [-100, -50, 0], [1, 0.8, 0.5]);

  const handleDragEnd = (_: never, info: PanInfo) => {
    if (info.offset.x < SWIPE_THRESHOLD) {
      // Swiped far enough → reveal delete
      setIsRevealed(true);
    } else {
      // Not far enough → snap back
      setIsRevealed(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(exercise.id);
    }
  };

  const handleSnapBack = () => {
    setIsRevealed(false);
  };

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative overflow-hidden rounded-xl"
    >
      {/* Delete background (revealed on swipe) */}
      <motion.div
        style={{ opacity: isRevealed ? 1 : deleteOpacity, scale: isRevealed ? 1 : deleteScale }}
        className="absolute inset-0 bg-red-500 rounded-xl flex items-center justify-end pr-6"
      >
        <button
          onClick={handleDelete}
          className="flex flex-col items-center gap-1 text-white"
          aria-label="Supprimer l'exercice"
        >
          <Trash2 size={24} />
          <span className="text-xs font-medium">Supprimer</span>
        </button>
      </motion.div>

      {/* Card content (draggable) */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: isRevealed ? -120 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        style={{ x: isRevealed ? undefined : x }}
        className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-grab active:cursor-grabbing touch-pan-y"
        onClick={isRevealed ? handleSnapBack : undefined}
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
                  handleDelete();
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
      </motion.div>
    </motion.div>
  );
}
