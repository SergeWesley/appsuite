import { WorkoutSession } from "@/types/workout-session";

/**
 * Calcule la durée estimée d'une séance d'entraînement.
 * Prend en compte le temps d'exécution des répétitions, les temps de repos entre les séries,
 * et le temps d'installation/changement entre les différents exercices.
 */
export function calculateEstimatedDuration(session: WorkoutSession): number {
  // Si la durée a été forcée manuellement
  if (session.duration && session.duration > 0) {
    return session.duration;
  }

  if (!session.exercises || session.exercises.length === 0) {
    return 0;
  }

  // Constantes de temps (en minutes)
  const TIME_PER_REP = 4 / 60; // 4 secondes par répétition en moyenne
  const REST_BETWEEN_SETS = 1.5; // 1min30 de repos entre chaque série
  const SETUP_TIME_BETWEEN_EXERCISES = 3.0; // 3 minutes pour changer d'atelier/exercice

  let totalDuration = 0;

  session.exercises.forEach((ex) => {
    // Si une durée spécifique est renseignée pour l'exercice (ex: cardio)
    if (ex.duration && ex.duration > 0) {
      totalDuration += ex.duration;
      return;
    }

    // Si un temps estimé est fourni
    if (ex.estimatedTime && ex.estimatedTime > 0) {
      totalDuration += ex.estimatedTime;
      return;
    }

    // Calcul par défaut basé sur les séries et répétitions
    const sets = ex.sets || 1;
    const reps = ex.reps || 10;

    const executionTime = sets * reps * TIME_PER_REP;
    const restTime = Math.max(0, sets - 1) * REST_BETWEEN_SETS;

    totalDuration += executionTime + restTime;
  });

  // Ajouter le temps de setup/déplacement entre les exercices
  if (session.exercises.length > 1) {
    totalDuration += (session.exercises.length - 1) * SETUP_TIME_BETWEEN_EXERCISES;
  }

  return Math.round(totalDuration);
}

/**
 * Formate une durée en minutes vers un format lisible (ex: 63 -> "1h3m")
 */
export function formatDuration(minutes: number): string {
  if (!minutes) return "0m";
  
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h${remainingMinutes}m`;
}
