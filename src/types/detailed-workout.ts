import { WorkoutExercise, WorkoutSession } from "./workout-session";

// Type pour une série individuelle
export interface WorkoutSet {
  id: string;
  setNumber: number; // Numéro de la série (1, 2, 3, etc.)
  reps: number;
  weight: number; // en kg
  restTime?: number; // temps de repos après cette série en secondes
  notes?: string;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  completed: boolean;
}

// Extension de WorkoutExercise pour supporter des séries détaillées
export interface DetailedWorkoutExercise extends Omit<WorkoutExercise, 'sets' | 'reps' | 'weight'> {
  sets: WorkoutSet[]; // Remplacement des champs simples par un tableau de séries
  targetSets?: number; // Nombre de séries prévues
  targetReps?: number; // Répétitions cibles
  targetWeight?: number; // Poids cible
}

// Extension de WorkoutSession pour supporter les séries détaillées
export interface DetailedWorkoutSession extends Omit<WorkoutSession, 'exercises'> {
  exercises: DetailedWorkoutExercise[];
}

// Fonction utilitaire pour convertir une WorkoutSession normale en DetailedWorkoutSession
export function convertToDetailedSession(session: WorkoutSession): DetailedWorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map(convertToDetailedExercise),
  };
}

// Fonction utilitaire pour convertir un WorkoutExercise normal en DetailedWorkoutExercise
export function convertToDetailedExercise(exercise: WorkoutExercise): DetailedWorkoutExercise {
  const { sets: numSets, reps, weight, ...rest } = exercise;
  
  // Si nous avons des données de base, créer des séries simulées
  const detailedSets: WorkoutSet[] = [];
  
  if (numSets && reps && weight) {
    // Créer des séries avec des variations légères pour simuler une vraie séance
    for (let i = 0; i < numSets; i++) {
      // Simulation de variation de répétitions (-2 à +2 autour de la cible)
      const variationReps = Math.max(1, reps + Math.floor(Math.random() * 5) - 2);
      
      // Simulation de variation de poids (-5% à +5% autour du poids de base)
      const variationWeight = Math.max(0.5, weight + (weight * (Math.random() * 0.1 - 0.05)));
      
      detailedSets.push({
        id: `${exercise.id}-set-${i + 1}`,
        setNumber: i + 1,
        reps: variationReps,
        weight: Math.round(variationWeight * 2) / 2, // Arrondir à 0.5 kg près
        completed: true,
      });
    }
  }
  
  return {
    ...rest,
    sets: detailedSets,
    targetSets: numSets || undefined,
    targetReps: reps || undefined,
    targetWeight: weight || undefined,
  };
}

// Fonction pour calculer les statistiques d'un exercice détaillé
export function calculateExerciseStats(exercise: DetailedWorkoutExercise) {
  if (exercise.sets.length === 0) {
    return {
      totalSets: 0,
      totalReps: 0,
      totalVolume: 0,
      averageWeight: 0,
      maxWeight: 0,
      minWeight: 0,
    };
  }

  const completedSets = exercise.sets.filter(set => set.completed);
  const totalReps = completedSets.reduce((sum, set) => sum + set.reps, 0);
  const totalVolume = completedSets.reduce((sum, set) => sum + (set.reps * set.weight), 0);
  const weights = completedSets.map(set => set.weight);

  return {
    totalSets: completedSets.length,
    totalReps,
    totalVolume,
    averageWeight: weights.length > 0 ? weights.reduce((sum, w) => sum + w, 0) / weights.length : 0,
    maxWeight: weights.length > 0 ? Math.max(...weights) : 0,
    minWeight: weights.length > 0 ? Math.min(...weights) : 0,
  };
}
