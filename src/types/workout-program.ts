export type RecurrencePattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = dimanche

// Template d'exercice dans un template de séance
export interface WorkoutTemplateExercise {
  id: string;
  templateId: string;
  exerciseId: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  notes?: string;
  order: number;
}

// Template de séance réutilisable
export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutTemplateExercise[];
  estimatedDuration?: number; // en minutes
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  isPublic: boolean;
  userId: string;
  dateCreated: Date;
  dateUpdated: Date;
}

// Données pour créer un template
export interface WorkoutTemplateFormData {
  name: string;
  description?: string;
  exercises: Omit<WorkoutTemplateExercise, 'id' | 'templateId'>[];
  estimatedDuration?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  isPublic?: boolean;
}

// Programme d'entraînement (cycle de templates)
export interface WorkoutProgram {
  id: string;
  name: string;
  description?: string;
  duration: number; // durée en semaines
  level: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  templates: WorkoutProgramTemplate[];
  isPublic: boolean;
  userId: string;
  dateCreated: Date;
  dateUpdated: Date;
}

// Liaison entre programme et templates
export interface WorkoutProgramTemplate {
  id: string;
  programId: string;
  templateId: string;
  template?: WorkoutTemplate;
  week: number; // semaine dans le programme (1-N)
  dayOfWeek: WeekDay;
  order?: number; // ordre si plusieurs séances le même jour
}

// Données pour créer un programme
export interface WorkoutProgramFormData {
  name: string;
  description?: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  templates: Omit<WorkoutProgramTemplate, 'id' | 'programId' | 'template'>[];
  isPublic?: boolean;
}

// Séance programmée avec récurrence
export interface ScheduledWorkout {
  id: string;
  name: string;
  templateId?: string;
  programId?: string;
  template?: WorkoutTemplate;
  program?: WorkoutProgram;
  
  // Planification
  startDate: Date;
  endDate?: Date;
  
  // Récurrence
  recurrencePattern: RecurrencePattern;
  recurrenceInterval: number; // ex: tous les 2 jours, toutes les 3 semaines
  weekDays?: WeekDay[]; // jours de la semaine pour récurrence weekly
  
  // Horaire
  scheduledTime?: string; // format HH:MM
  reminderMinutes?: number; // rappel X minutes avant
  
  // Status
  isActive: boolean;
  autoGenerate: boolean; // génère automatiquement les séances
  
  userId: string;
  dateCreated: Date;
  dateUpdated: Date;
}

// Données pour créer une séance programmée
export interface ScheduledWorkoutFormData {
  name: string;
  templateId?: string;
  programId?: string;
  startDate: Date;
  endDate?: Date;
  recurrencePattern: RecurrencePattern;
  recurrenceInterval: number;
  weekDays?: WeekDay[];
  scheduledTime?: string;
  reminderMinutes?: number;
  autoGenerate?: boolean;
}

// Instance générée d'une séance programmée
export interface GeneratedWorkout {
  id: string;
  scheduledWorkoutId: string;
  scheduledWorkout?: ScheduledWorkout;
  workoutSessionId?: string; // une fois la séance complétée
  
  // Planification
  scheduledDate: Date;
  scheduledTime?: string;
  
  // Status
  status: 'scheduled' | 'completed' | 'skipped' | 'rescheduled';
  completed?: boolean;
  skippedReason?: string;
  
  // Métadonnées
  generatedAt: Date;
  completedAt?: Date;
  
  userId: string;
}

// Labels pour l'interface
export const RECURRENCE_LABELS: Record<RecurrencePattern, string> = {
  daily: 'Quotidien',
  weekly: 'Hebdomadaire', 
  biweekly: 'Toutes les 2 semaines',
  monthly: 'Mensuel',
  custom: 'Personnalisé',
};

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  0: 'Dimanche',
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
};

export const DIFFICULTY_LABELS = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

// Statistiques des programmes
export interface ProgramStats {
  totalPrograms: number;
  activeSchedules: number;
  completedWorkouts: number;
  upcomingWorkouts: number;
  streakDays: number;
}
