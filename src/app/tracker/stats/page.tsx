"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkoutSessions } from "@/hooks/tracker/useWorkoutSessions";
import { useExercises } from "@/hooks/tracker/useExercices";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Activity, Trophy, TrendingUp } from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { useFilterPersistence } from "@/hooks/useFilterPersistence";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { AppHeader } from "@/components/AppHeader";

import { ExerciseProgressionChart, ProgressionDataPoint } from "@/components/tracker/ExerciseProgressionChart";
import { WorkoutStats } from "@/components/tracker/WorkoutStats";

export default function TrackerStatsPage() {
  const router = useRouter();
  const { user, signOut } = useAuthContext();
  const { sessions, loading, getStats } = useWorkoutSessions();
  const stats = getStats();
  const { exercises } = useExercises();

  // Récupérer les filtres persistants pour la page des statistiques de suivi
  const { selectedExerciseId, updateFilter } = useFilterPersistence("tracker-stats-filters", {
    selectedExerciseId: "",
  });

  // Obtenir tous les exercices valides (de force/poids) que l'utilisateur a réellement effectués
  const performedExerciseIds = useMemo(() => {
    const ids = new Set<string>();
    sessions.forEach(session => {
      session.exercises.forEach(ex => {
        if (ex.weight && ex.weight > 0) { // Conserver uniquement ceux avec un poids
          ids.add(ex.exerciseId);
        }
      });
    });
    return Array.from(ids);
  }, [sessions]);

  // Mapper les exercices et les trier par ordre alphabétique
  const availableExercises = useMemo(() => {
    return performedExerciseIds
      .map(id => exercises.find(e => e.id === id))
      .filter(e => e !== undefined)
      .sort((a, b) => a!.name.localeCompare(b!.name));
  }, [performedExerciseIds, exercises]);

  // Sélectionner automatiquement le premier exercice si aucun n'est sélectionné
  useEffect(() => {
    if (!selectedExerciseId && availableExercises.length > 0) {
      updateFilter("selectedExerciseId", availableExercises[0]!.id);
    }
  }, [selectedExerciseId, availableExercises, updateFilter]);

  // Générer les points de données pour l'exercice sélectionné
  const chartData = useMemo(() => {
    if (!selectedExerciseId) return [];

    // Regrouper les séances par ordre chronologique
    const chronologicalSessions = [...sessions].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const dataPoints: ProgressionDataPoint[] = [];

    chronologicalSessions.forEach(session => {
      // Trouver tous les ensembles/exercices correspondant à l'exercice sélectionné dans cette séance
      const matchingEx = session.exercises.filter(ex => ex.exerciseId === selectedExerciseId);
      if (matchingEx.length === 0) return;

      // Trouver le poids maximum levé pendant cette séance pour cet exercice
      let maxWeight = 0;
      let repsAtMaxWeight = 0;
      let hasData = false;

      matchingEx.forEach(ex => {
        if (ex.weight && ex.weight > maxWeight) {
          maxWeight = ex.weight;
          repsAtMaxWeight = ex.reps || 0;
          hasData = true;
        }
      });

      if (hasData) {
        dataPoints.push({
          date: session.date,
          dateStr: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(session.date),
          weight: maxWeight,
          reps: repsAtMaxWeight
        });
      }
    });

    return dataPoints;
  }, [selectedExerciseId, sessions]);

  // Calculer les meilleures performances globales pour l'affichage des meilleures performances
  const topRecords = useMemo(() => {
    const recordsMap = new Map<string, { weight: number, name: string }>();
    sessions.forEach(session => {
      session.exercises.forEach(ex => {
        if (ex.weight && ex.weight > 0) {
          const currentMax = recordsMap.get(ex.exerciseId)?.weight || 0;
          if (ex.weight > currentMax) {
            recordsMap.set(ex.exerciseId, { weight: ex.weight, name: ex.exercise?.name || "Inconnu" });
          }
        }
      });
    });

    // Trier par poids levé le plus lourd au niveau global
    return Array.from(recordsMap.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3); // Meilleures performances
  }, [sessions]);

  if (loading) {
    return <LoadingOverlay isLoading={true} message="Chargement de vos statistiques..." fullPage />;
  }

  const selectedExerciseObj = exercises.find(e => e.id === selectedExerciseId);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Performances"
        icon={TrendingUp}
        iconColor="text-indigo-600"
        currentModule="tracker"
        onBack={() => router.push("/tracker")}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Statistiques Globales */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={24} /> 
            Aperçu global
          </h2>
          <WorkoutStats stats={stats} />
        </div>

        {/* Top PRs Showcase */}
        {topRecords.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="text-amber-500" size={24} /> 
              Temple de la renommée
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topRecords.map((record, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-amber-100 p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{record.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{record.weight} <span className="text-sm text-gray-400 font-normal">kg</span></p>
                  </div>
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${index === 0 ? "bg-amber-100 text-amber-600" : index === 1 ? "bg-gray-100 text-gray-500" : "bg-orange-50 text-orange-700"}`}>
                    <Trophy size={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Chart Section */}
        <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8 flex items-center gap-2">
          <Activity className="text-indigo-600" size={24} />
          Courbe d'évolution
        </h2>

        {availableExercises.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée de poids exploitable</h3>
            <p className="text-gray-500">
              Réalisez des séances avec des exercices à poids (haltérophilie, force) pour générer des courbes d'évolution.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Exercise Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Sélectionner un exercice
                </label>
                <select
                  id="exercise-select"
                  value={selectedExerciseId as string}
                  onChange={(e) => updateFilter("selectedExerciseId", e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-80 p-2.5"
                >
                  {availableExercises.map(ex => (
                    <option key={ex!.id} value={ex!.id}>{ex!.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recharts Chart */}
            {selectedExerciseObj && (
              <ExerciseProgressionChart 
                data={chartData} 
                exerciseName={selectedExerciseObj.name} 
              />
            )}
          </div>
        )}

      </main>


    </div>
  );
}
