"use client";

import {
  WorkoutExercise,
  MuscleGroup,
  MUSCLE_GROUP_LABELS,
} from "@/types/workout-session";

interface MuscleGroupFilterProps {
  exercises: WorkoutExercise[];
  selectedMuscleGroup: MuscleGroup;
  onSelect: (group: MuscleGroup) => void;
}

export function MuscleGroupFilter({
  exercises,
  selectedMuscleGroup,
  onSelect,
}: MuscleGroupFilterProps) {
  const availableMuscleGroups = Array.from(
    new Set(
      exercises.map((ex) => ex.exercise?.muscleGroup).filter(Boolean),
    ),
  );

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelect("all")}
          className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedMuscleGroup === "all"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Tous ({exercises.length})
        </button>
        {availableMuscleGroups.map((group) => {
          const count = exercises.filter(
            (ex) => ex.exercise?.muscleGroup === group,
          ).length;
          return (
            <button
              key={group}
              onClick={() => onSelect(group as MuscleGroup)}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMuscleGroup === group
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {MUSCLE_GROUP_LABELS[group as MuscleGroup]} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
}
