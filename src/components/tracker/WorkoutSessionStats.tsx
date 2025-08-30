"use client";

import { motion } from "framer-motion";
import { WorkoutSession, WorkoutExercise, MUSCLE_GROUP_LABELS } from "@/types/workout-session";
import { BarChart3, Activity, Clock, Weight, Target, TrendingUp } from "lucide-react";

interface WorkoutSessionStatsProps {
  session: WorkoutSession;
}

interface GroupedExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  instances: WorkoutExercise[];
  totalSets: number;
  totalReps: number;
  totalWeight: number;
  totalDuration: number;
  averageWeight: number;
  maxWeight: number;
  isCardio: boolean;
}

interface MuscleGroupStats {
  muscleGroup: string;
  exerciseCount: number;
  totalSets: number;
  totalReps: number;
  totalWeight: number;
  totalDuration: number;
}

export function WorkoutSessionStats({ session }: WorkoutSessionStatsProps) {
  // Fonction pour regrouper les exercices identiques
  const groupExercises = (): GroupedExercise[] => {
    const exerciseMap = new Map<string, GroupedExercise>();

    session.exercises.forEach((exercise) => {
      if (!exercise.exercise) return;

      const key = exercise.exerciseId;
      const isCardio = exercise.exercise.muscleGroup === 'cardio';

      if (!exerciseMap.has(key)) {
        exerciseMap.set(key, {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exercise.name,
          muscleGroup: exercise.exercise.muscleGroup,
          instances: [],
          totalSets: 0,
          totalReps: 0,
          totalWeight: 0,
          totalDuration: 0,
          averageWeight: 0,
          maxWeight: 0,
          isCardio,
        });
      }

      const grouped = exerciseMap.get(key)!;
      grouped.instances.push(exercise);
      
      if (exercise.sets) grouped.totalSets += exercise.sets;
      if (exercise.reps) grouped.totalReps += exercise.reps;
      if (exercise.weight) {
        grouped.totalWeight += exercise.weight * (exercise.sets || 1) * (exercise.reps || 1);
        grouped.maxWeight = Math.max(grouped.maxWeight, exercise.weight);
      }
      if (exercise.duration) grouped.totalDuration += exercise.duration;
    });

    // Calculer la moyenne du poids
    exerciseMap.forEach((grouped) => {
      const weightInstances = grouped.instances.filter(ex => ex.weight);
      if (weightInstances.length > 0) {
        grouped.averageWeight = weightInstances.reduce((sum, ex) => sum + (ex.weight || 0), 0) / weightInstances.length;
      }
    });

    return Array.from(exerciseMap.values());
  };

  // Fonction pour calculer les stats par groupe musculaire
  const getMuscleGroupStats = (): MuscleGroupStats[] => {
    const groupStats = new Map<string, MuscleGroupStats>();

    session.exercises.forEach((exercise) => {
      if (!exercise.exercise) return;

      const muscleGroup = exercise.exercise.muscleGroup;
      
      if (!groupStats.has(muscleGroup)) {
        groupStats.set(muscleGroup, {
          muscleGroup,
          exerciseCount: 0,
          totalSets: 0,
          totalReps: 0,
          totalWeight: 0,
          totalDuration: 0,
        });
      }

      const stats = groupStats.get(muscleGroup)!;
      stats.exerciseCount += 1;
      if (exercise.sets) stats.totalSets += exercise.sets;
      if (exercise.reps) stats.totalReps += exercise.reps;
      if (exercise.weight) stats.totalWeight += exercise.weight * (exercise.sets || 1) * (exercise.reps || 1);
      if (exercise.duration) stats.totalDuration += exercise.duration;
    });

    return Array.from(groupStats.values());
  };

  const groupedExercises = groupExercises();
  const muscleGroupStats = getMuscleGroupStats();
  const strengthExercises = groupedExercises.filter(ex => !ex.isCardio);
  const cardioExercises = groupedExercises.filter(ex => ex.isCardio);

  // Calculer les totaux de la séance
  const sessionTotals = {
    totalVolume: groupedExercises.reduce((sum, ex) => sum + ex.totalWeight, 0),
    totalSets: groupedExercises.reduce((sum, ex) => sum + ex.totalSets, 0),
    totalReps: groupedExercises.reduce((sum, ex) => sum + ex.totalReps, 0),
    totalCardioTime: cardioExercises.reduce((sum, ex) => sum + ex.totalDuration, 0),
  };

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble de la séance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Aperçu de la séance</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Weight className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{Math.round(sessionTotals.totalVolume)}</p>
            <p className="text-sm text-gray-600">kg total</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{sessionTotals.totalSets}</p>
            <p className="text-sm text-gray-600">séries</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{sessionTotals.totalReps}</p>
            <p className="text-sm text-gray-600">répétitions</p>
          </div>
          
          {sessionTotals.totalCardioTime > 0 && (
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{sessionTotals.totalCardioTime}</p>
              <p className="text-sm text-gray-600">min cardio</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Graphique des exercices de musculation */}
      {strengthExercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 rounded-lg">
              <Weight className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Exercices de musculation</h3>
          </div>

          <div className="space-y-4">
            {strengthExercises.map((exercise, index) => {
              const maxVolume = Math.max(...strengthExercises.map(ex => ex.totalWeight));
              const volumePercentage = maxVolume > 0 ? (exercise.totalWeight / maxVolume) * 100 : 0;

              return (
                <motion.div
                  key={exercise.exerciseId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{exercise.exerciseName}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {MUSCLE_GROUP_LABELS[exercise.muscleGroup as keyof typeof MUSCLE_GROUP_LABELS]}
                      </p>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className="text-base sm:text-lg font-bold text-gray-900">{Math.round(exercise.totalWeight)} kg</p>
                      <p className="text-xs sm:text-sm text-gray-600">volume total</p>
                    </div>
                  </div>

                  {/* Barre de progression du volume */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${volumePercentage}%` }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                      className="bg-green-500 h-3 rounded-full"
                    />
                  </div>

                  {/* Détails des performances */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Séries</p>
                      <p className="font-semibold text-gray-900">{exercise.totalSets}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reps</p>
                      <p className="font-semibold text-gray-900">{exercise.totalReps}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Poids max</p>
                      <p className="font-semibold text-gray-900">{exercise.maxWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Poids moy.</p>
                      <p className="font-semibold text-gray-900">{Math.round(exercise.averageWeight * 10) / 10} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Séries</p>
                      <p className="font-semibold text-gray-900">{exercise.instances.length}</p>
                    </div>
                  </div>

                  {/* Détail de chaque série */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Détail des séries:</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {exercise.instances.map((instance, idx) => (
                        <span
                          key={instance.id}
                          className="inline-flex items-center px-2 py-1 bg-white rounded text-xs border"
                        >
                          {instance.sets && instance.reps && (
                            <>
                              {instance.sets}×{instance.reps}
                              {instance.weight && <span className="ml-1 text-gray-500">@{instance.weight}kg</span>}
                            </>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Graphique du cardio */}
      {cardioExercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Exercices cardio</h3>
          </div>

          <div className="space-y-4">
            {cardioExercises.map((exercise, index) => {
              const maxDuration = Math.max(...cardioExercises.map(ex => ex.totalDuration));
              const durationPercentage = maxDuration > 0 ? (exercise.totalDuration / maxDuration) * 100 : 0;

              return (
                <motion.div
                  key={exercise.exerciseId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{exercise.exerciseName}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Cardio</p>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className="text-base sm:text-lg font-bold text-gray-900">{exercise.totalDuration} min</p>
                      <p className="text-xs sm:text-sm text-gray-600">durée totale</p>
                    </div>
                  </div>

                  {/* Barre de progression de la durée */}
                  <div className="w-full bg-orange-200 rounded-full h-3 mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${durationPercentage}%` }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                      className="bg-orange-500 h-3 rounded-full"
                    />
                  </div>

                  {/* Détail de chaque session cardio */}
                  <div className="mt-3 pt-3 border-t border-orange-200">
                    <p className="text-xs text-gray-500 mb-2">Détail des sessions:</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {exercise.instances.map((instance, idx) => (
                        <span
                          key={instance.id}
                          className="inline-flex items-center px-2 py-1 bg-white rounded text-xs border"
                        >
                          {instance.duration} min
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Répartition par groupe musculaire */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Activity className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Répartition par groupe musculaire</h3>
        </div>

        <div className="space-y-4">
          {muscleGroupStats.map((stats, index) => {
            const maxExercises = Math.max(...muscleGroupStats.map(s => s.exerciseCount));
            const exercisePercentage = maxExercises > 0 ? (stats.exerciseCount / maxExercises) * 100 : 0;

            return (
              <motion.div
                key={stats.muscleGroup}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-purple-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base flex-1 min-w-0 truncate">
                    {MUSCLE_GROUP_LABELS[stats.muscleGroup as keyof typeof MUSCLE_GROUP_LABELS]}
                  </h4>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="text-base sm:text-lg font-bold text-gray-900">{stats.exerciseCount}</p>
                    <p className="text-xs sm:text-sm text-gray-600">exercices</p>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="w-full bg-purple-200 rounded-full h-3 mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${exercisePercentage}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                    className="bg-purple-500 h-3 rounded-full"
                  />
                </div>

                {/* Stats détaillées */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  {stats.totalSets > 0 && (
                    <div>
                      <p className="text-gray-500">Séries</p>
                      <p className="font-semibold text-gray-900">{stats.totalSets}</p>
                    </div>
                  )}
                  {stats.totalReps > 0 && (
                    <div>
                      <p className="text-gray-500">Reps</p>
                      <p className="font-semibold text-gray-900">{stats.totalReps}</p>
                    </div>
                  )}
                  {stats.totalWeight > 0 && (
                    <div>
                      <p className="text-gray-500">Volume</p>
                      <p className="font-semibold text-gray-900">{Math.round(stats.totalWeight)} kg</p>
                    </div>
                  )}
                  {stats.totalDuration > 0 && (
                    <div>
                      <p className="text-gray-500">Durée</p>
                      <p className="font-semibold text-gray-900">{stats.totalDuration} min</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
