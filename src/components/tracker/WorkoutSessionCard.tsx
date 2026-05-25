"use client";

import { useRouter } from "next/navigation";
import { WorkoutSession } from "@/types/workout-session";
import { MUSCLE_GROUP_LABELS } from "@/types/workout-session";
import { Calendar, Activity, Clock, FileText, Trash2 } from "lucide-react";
import { SwipeableCard } from "@/components/SwipeableCard";

interface WorkoutSessionCardProps {
  session: WorkoutSession;
  index?: number;
  href?: string;
  onClick?: () => void;
  onDelete?: (sessionId: string) => void;
}

export function WorkoutSessionCard({
  session,
  index = 0,
  href,
  onClick,
  onDelete,
}: WorkoutSessionCardProps) {
  const router = useRouter();

  const handleCardClick = (e?: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

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

  // Calculer la durée estimée
  const estimatedDuration =
    session.duration || Math.max(30, session.totalExercises * 5);

  return (
    <SwipeableCard
      index={index}
      onDelete={onDelete ? () => onDelete(session.id) : undefined}
      onClick={handleCardClick}
      containerClassName="h-full"
      className="h-full p-6 cursor-pointer transition-all duration-200 lg:hover:shadow-md"
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
        <div className="text-right flex items-center gap-2">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Clock size={14} />
            <span>{estimatedDuration} min</span>
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
              }}
              className="hidden sm:flex p-2 -mr-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              aria-label="Supprimer la séance"
            >
              <Trash2 size={18} />
            </button>
          )}
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
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {session.exercises.slice(0, 6).map((exercise) => (
            <div key={exercise.id} className="text-sm text-gray-600 truncate" title={exercise.exercise?.name}>
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
        </div>
        {session.exercises.length > 6 && (
          <div className="text-sm text-gray-400 mt-1">
            +{session.exercises.length - 6} autres exercices
          </div>
        )}
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
    </SwipeableCard>
  );
}
