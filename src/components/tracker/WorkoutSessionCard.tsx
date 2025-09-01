"use client";

import { motion } from "framer-motion";
import { WorkoutSession } from "@/types/workout-session";
import { MUSCLE_GROUP_LABELS } from "@/types/workout-session";
import { Calendar, Activity, Clock, FileText } from "lucide-react";

interface WorkoutSessionCardProps {
  session: WorkoutSession;
  onClick: () => void;
}

export function WorkoutSessionCard({
  session,
  onClick,
}: WorkoutSessionCardProps) {
  // Calculer les groupes musculaires travaillés
  const muscleGroups = Array.from(
    new Set(
      session.exercises
        .map((exercise) => exercise.exercise?.muscleGroup)
        .filter(Boolean),
    ),
  );

  // Formater la date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Calculer la durée estimée (par défaut: 45min par séance, ajustable selon le nombre d'exercices)
  const estimatedDuration =
    session.duration || Math.max(30, session.totalExercises * 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
      onClick={onClick}
      className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 cursor-pointer transition-all duration-200 hover:shadow-md"
    >
      {/* En-tête avec date */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Calendar size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 capitalize">
              {formatDate(session.date)}
            </h3>
            <p className="text-sm text-gray-500">
              {session.totalExercises} exercice
              {session.totalExercises > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Clock size={14} />
            <span>{estimatedDuration} min</span>
          </div>
        </div>
      </div>

      {/* Groupes musculaires */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {muscleGroups.map((group) => (
            <span
              key={group}
              className="px-3 py-1 bg-gray-50 text-gray-700 text-sm rounded-full border"
            >
              {MUSCLE_GROUP_LABELS[group as keyof typeof MUSCLE_GROUP_LABELS]}
            </span>
          ))}
        </div>
      </div>

      {/* Aperçu des exercices */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Exercices</span>
        </div>
        <div className="space-y-1">
          {session.exercises.slice(0, 3).map((exercise, index) => (
            <div key={exercise.id} className="text-sm text-gray-600">
              {exercise.exercise?.name}
              {exercise.sets && exercise.reps && (
                <span className="text-gray-400 ml-2">
                  {exercise.sets}×{exercise.reps}
                  {exercise.weight && ` • ${exercise.weight}kg`}
                </span>
              )}
              {exercise.duration && (
                <span className="text-gray-400 ml-2">
                  {exercise.duration} min
                </span>
              )}
            </div>
          ))}
          {session.exercises.length > 3 && (
            <div className="text-sm text-gray-400">
              +{session.exercises.length - 3} autres exercices
            </div>
          )}
        </div>
      </div>

      {/* Notes (aperçu) */}
      {session.notes && (
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={14} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Notes</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{session.notes}</p>
        </div>
      )}
    </motion.div>
  );
}
