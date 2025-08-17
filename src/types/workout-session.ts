export type MuscleGroup = 'all' | 'upper_body' | 'lower_body' | 'cardio' | 'core' | 'full_body' | 'other';

// Types pour la récurrence
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface RecurrenceConfig {
  type: RecurrenceType;
  interval?: number; // Ex: tous les 2 jours, toutes les 3 semaines
  daysOfWeek?: DayOfWeek[]; // Pour la récurrence hebdomadaire
  endDate?: Date; // Date de fin de récurrence (optionnel)
  maxOccurrences?: number; // Nombre maximum d'occurrences (optionnel)
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  recurrence: RecurrenceConfig;
  userId: string;
  dateCreated: Date;
  dateUpdated: Date;
  isActive: boolean;
}

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

export interface WorkoutSession {
  id: string;
  date: Date;
  notes?: string;
  exercises: WorkoutExercise[];
  totalExercises: number;
  duration?: number; // durée totale de la séance en minutes
  userId: string;
  templateId?: string; // ID du template si c'est une séance récurrente
  isFromTemplate?: boolean; // Indique si la séance vient d'un template
  dateCreated: Date;
  dateUpdated: Date;
}

export interface WorkoutSessionFormData {
  date: Date;
  notes?: string;
  exercises: Omit<WorkoutExercise, 'id' | 'exercise'>[];
  recurrence?: RecurrenceConfig;
  templateName?: string; // Nom du template si on veut créer une séance récurrente
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
  totalTemplates: number;
  activeTemplates: number;
}

// Interface pour les occurrences générées
export interface WorkoutOccurrence {
  date: Date;
  templateId: string;
  template: WorkoutTemplate;
  sessionId?: string; // ID de la séance si elle a été créée
  session?: WorkoutSession; // La séance si elle a été créée
}

// Types pour les form data des templates
export interface WorkoutTemplateFormData {
  name: string;
  description?: string;
  exercises: Omit<WorkoutExercise, 'id' | 'exercise'>[];
  recurrence: RecurrenceConfig;
  startDate: Date;
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

// Labels pour les types de récurrence
export const RECURRENCE_TYPE_LABELS: Record<RecurrenceType, string> = {
  none: 'Pas de récurrence',
  daily: 'Quotidienne',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuelle',
};

// Labels pour les jours de la semaine
export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

// Fonction utilitaire pour générer les occurrences d'une récurrence
export function generateRecurrenceOccurrences(
  startDate: Date,
  recurrence: RecurrenceConfig,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  const occurrences: Date[] = [];

  if (recurrence.type === 'none') {
    // Une seule occurrence à la date de début si elle est dans la plage
    if (startDate >= rangeStart && startDate <= rangeEnd) {
      occurrences.push(new Date(startDate));
    }
    return occurrences;
  }

  const interval = recurrence.interval || 1;
  let currentDate = new Date(startDate);
  let occurrenceCount = 0;

  while (currentDate <= rangeEnd) {
    // Vérifier si on a atteint la date de fin de récurrence
    if (recurrence.endDate && currentDate > recurrence.endDate) {
      break;
    }

    // Vérifier si on a atteint le nombre maximum d'occurrences
    if (recurrence.maxOccurrences && occurrenceCount >= recurrence.maxOccurrences) {
      break;
    }

    // Ajouter l'occurrence si elle est dans la plage
    if (currentDate >= rangeStart && currentDate <= rangeEnd) {
      occurrences.push(new Date(currentDate));
    }

    occurrenceCount++;

    // Calculer la prochaine occurrence
    switch (recurrence.type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval);
        break;

      case 'weekly':
        if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
          // Pour les récurrences hebdomadaires avec jours spécifiques
          // Implementation simplifiée : avancer d'une semaine * interval
          currentDate.setDate(currentDate.getDate() + (7 * interval));
        } else {
          currentDate.setDate(currentDate.getDate() + (7 * interval));
        }
        break;

      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + interval);
        break;

      default:
        // Ne devrait pas arriver
        break;
    }
  }

  return occurrences;
}
