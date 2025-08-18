export type MuscleGroup = 'all' | 'upper_body' | 'lower_body' | 'cardio' | 'core' | 'full_body' | 'other';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description?: string;
  isCustom: boolean;
  userId?: string;
  dateCreated: Date;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise?: Exercise; // Pour les jointures
  sets?: number;
  reps?: number;
  weight?: number; // en kg
  duration?: number; // en minutes pour le cardio
  notes?: string;
  order: number; // ordre dans la séance
}

export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly';
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = dimanche

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

  // Récurrence - nouvelles propriétés
  isRecurring?: boolean; // si cette séance se répète
  recurrencePattern?: RecurrencePattern; // type de récurrence
  recurrenceInterval?: number; // ex: tous les 2 jours, toutes les 3 semaines
  recurrenceDays?: WeekDay[]; // jours de la semaine pour récurrence weekly
  recurrenceEndDate?: Date; // date de fin de la récurrence
  parentSessionId?: string; // ID de la séance parente (pour les instances générées)
  isGenerated?: boolean; // true si cette séance a été générée automatiquement
}

export interface WorkoutSessionFormData {
  date: Date;
  notes?: string;
  exercises: Omit<WorkoutExercise, 'id' | 'exercise'>[];
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

// Catalogue d'exercices prédéfinis
export const DEFAULT_EXERCISES: Omit<Exercise, 'id' | 'isCustom' | 'userId' | 'dateCreated'>[] = [
  // Haut du corps
  { name: 'Pompes', muscleGroup: 'upper_body', description: 'Exercice de base pour le torse' },
  { name: 'Tractions', muscleGroup: 'upper_body', description: 'Exercice pour le dos et les biceps' },
  { name: 'Développé couché', muscleGroup: 'upper_body', description: 'Exercice avec haltères ou barre' },
  { name: 'Dips', muscleGroup: 'upper_body', description: 'Exercice pour les triceps et pectoraux' },
  { name: 'Curl biceps', muscleGroup: 'upper_body', description: 'Exercice pour les biceps' },
  { name: 'Extensions triceps', muscleGroup: 'upper_body', description: 'Exercice pour les triceps' },
  
  // Bas du corps
  { name: 'Squats', muscleGroup: 'lower_body', description: 'Exercice de base pour les jambes' },
  { name: 'Fentes', muscleGroup: 'lower_body', description: 'Exercice pour les cuisses et fessiers' },
  { name: 'Soulevé de terre', muscleGroup: 'lower_body', description: 'Exercice pour les jambes et le dos' },
  { name: 'Extensions mollets', muscleGroup: 'lower_body', description: 'Exercice pour les mollets' },
  { name: 'Leg press', muscleGroup: 'lower_body', description: 'Exercice à la machine pour les jambes' },
  
  // Cardio
  { name: 'Course à pied', muscleGroup: 'cardio', description: 'Activité cardiovasculaire' },
  { name: 'Vélo', muscleGroup: 'cardio', description: 'Activité cardiovasculaire' },
  { name: 'Rameur', muscleGroup: 'cardio', description: 'Exercice cardiovasculaire complet' },
  { name: 'Elliptique', muscleGroup: 'cardio', description: 'Machine cardiovasculaire' },
  
  // Core
  { name: 'Planche', muscleGroup: 'core', description: 'Exercice de gainage' },
  { name: 'Crunchs', muscleGroup: 'core', description: 'Exercice pour les abdominaux' },
  { name: 'Russian twists', muscleGroup: 'core', description: 'Exercice pour les obliques' },
  { name: 'Mountain climbers', muscleGroup: 'core', description: 'Exercice dynamique pour le core' },
  
  // Full body
  { name: 'Burpees', muscleGroup: 'full_body', description: 'Exercice complet du corps' },
  { name: 'Thrusters', muscleGroup: 'full_body', description: 'Squat + développé militaire' },
  { name: 'Man makers', muscleGroup: 'full_body', description: 'Exercice complexe full body' },
];

// Labels pour les groupes musculaires
export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  all: 'Tous',
  upper_body: 'Haut du corps',
  lower_body: 'Bas du corps',
  cardio: 'Cardio',
  core: 'Core',
  full_body: 'Full body',
  other: 'Autre',
};
