"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkoutSessions } from "@/hooks/tracker/useWorkoutSessions";
import { useExercises } from "@/hooks/tracker/useExercices";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Activity, LogOut, User, Trophy, ArrowLeft, TrendingUp } from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { useFilterPersistence } from "@/hooks/useFilterPersistence";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ExerciseProgressionChart, ProgressionDataPoint } from "@/components/tracker/ExerciseProgressionChart";
import { WorkoutStats } from "@/components/tracker/WorkoutStats";

export default function TrackerStatsPage() {
  const router = useRouter();
  const { user, signOut } = useAuthContext();
  const { sessions, loading, getStats } = useWorkoutSessions();
  const stats = getStats();
  const { exercises } = useExercises();
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  
  const { selectedExerciseId, updateFilter } = useFilterPersistence("tracker-stats-filters", {
    selectedExerciseId: "",
  });

  // Get all valid exercises (strength/weight based) that the user ACTUALLY performed
  const performedExerciseIds = useMemo(() => {
    const ids = new Set<string>();
    sessions.forEach(session => {
      session.exercises.forEach(ex => {
        if (ex.weight && ex.weight > 0) { // Keep only those with weight
          ids.add(ex.exerciseId);
        }
      });
    });
    return Array.from(ids);
  }, [sessions]);

  // Map to exercise objects and sort alphabetically
  const availableExercises = useMemo(() => {
    return performedExerciseIds
      .map(id => exercises.find(e => e.id === id))
      .filter(e => e !== undefined)
      .sort((a, b) => a!.name.localeCompare(b!.name));
  }, [performedExerciseIds, exercises]);

  // Select the first exercise automatically if none selected
  useEffect(() => {
    if (!selectedExerciseId && availableExercises.length > 0) {
      updateFilter("selectedExerciseId", availableExercises[0]!.id);
    }
  }, [selectedExerciseId, availableExercises, updateFilter]);

  // Generate data points for the selected exercise
  const chartData = useMemo(() => {
    if (!selectedExerciseId) return [];

    // Group sessions chronologically
    const chronologicalSessions = [...sessions].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const dataPoints: ProgressionDataPoint[] = [];

    chronologicalSessions.forEach(session => {
      // Find all sets/exercises matching the selected exercise inside this session
      const matchingEx = session.exercises.filter(ex => ex.exerciseId === selectedExerciseId);
      if (matchingEx.length === 0) return;

      // Find the absolute max weight lifted during this session for this exercise
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

  // Compute Overall bests for Top PRs Showcase
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

    // Sort by heaviest weight lifted globally
    return Array.from(recordsMap.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3); // Top 3
  }, [sessions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const selectedExerciseObj = exercises.find(e => e.id === selectedExerciseId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/tracker")}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Retour"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>

              <button
                onClick={() => setIsNavMenuOpen(true)}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menu de navigation"
              >
                <TrendingUp className="h-8 w-8 text-indigo-600" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">Performances</h1>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <Menu as="div" className="relative inline-block text-left">
                <MenuButton className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <User size={20} />
                  <span className="hidden sm:block">
                    {user?.user_metadata?.name || user?.email || "Utilisateur"}
                  </span>
                </MenuButton>

                <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 focus:outline-none">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.user_metadata?.name || "Utilisateur"}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <MenuItem
                      as="button"
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100"
                    >
                      <LogOut size={16} />
                      Se déconnecter
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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

      <NavigationMenu
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        currentModule="tracker"
      />
    </div>
  );
}
