export type MuscleGroup =
  | "all"
  | "upper_body"
  | "lower_body"
  | "cardio"
  | "core"
  | "full_body"
  | "other";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description?: string;
  isCustom: boolean;
  userId?: string;
  dateCreated: Date;
  source?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise?: Exercise; // Pour les jointures
  sets?: number;
  reps?: number;
  weight?: number; // en kg
  duration?: number; // en minutes pour le cardio
  speed?: number; // en km/h pour le cardio
  slope?: number; // en pourcentage pour le cardio
  notes?: string;
  order: number; // ordre dans la séance
  estimatedTime?: number; // temps estimé pour cet exercice en minutes
}

export interface WorkoutSession {
  id: string;
  date: Date;
  notes?: string;
  exercises: WorkoutExercise[];
  totalExercises: number;
  duration?: number; // durée totale de la séance en minutes
  userId: string;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface WorkoutSessionFormData {
  date: Date;
  notes?: string;
  exercises: Omit<WorkoutExercise, "id" | "exercise">[];
}

export interface ExerciseFormData {
  name: string;
  muscleGroup: MuscleGroup;
  description?: string;
}

// Types pour les filtres
export interface WorkoutFilters {
  muscleGroup: MuscleGroup;
  dateFrom?: Date;
  dateTo?: Date;
}

// Types pour les statistiques
export interface WorkoutStats {
  totalSessions: number;
  totalExercises: number;
  averageExercisesPerSession: number;
  exercisesByMuscleGroup: Record<MuscleGroup, number>;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
}

// Labels pour les groupes musculaires
export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  all: "Tous",
  upper_body: "Haut du corps",
  lower_body: "Bas du corps",
  cardio: "Cardio",
  core: "Core",
  full_body: "Full body",
  other: "Autre",
};
