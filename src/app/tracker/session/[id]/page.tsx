"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWorkoutSessions } from "@/hooks/tracker/useWorkoutSessions";
import { useExercises } from "@/hooks/tracker/useExercices";
import { WorkoutSession, Exercise, MuscleGroup } from "@/types/workout-session";
import { NavigationMenu } from "@/components/NavigationMenu";
import { ExerciseDistributionChart } from "@/components/tracker/ExerciseDistributionChart";
import { ExerciseSelectionModal } from "@/components/tracker/ExerciseSelectionModal";
import { ExerciseDetailsModal } from "@/components/tracker/ExerciseDetailsModal";
import type { ExerciseDetails } from "@/components/tracker/ExerciseDetailsModal";
import { SessionInfoCard } from "@/components/tracker/SessionInfoCard";
import { SessionActions } from "@/components/tracker/SessionActions";
import { ExerciseCard } from "@/components/tracker/ExerciseCard";
import { MuscleGroupFilter } from "@/components/tracker/MuscleGroupFilter";
import { ConfirmationModal } from "@/components/tracker/ConfirmationModal";
import { FloatingAddButton } from "@/components/tracker/FloatingAddButton";
import { Activity, LogOut, User } from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export default function WorkoutSessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const { user, signOut } = useAuthContext();

  const {
    sessions,
    getSessionById,
    deleteSession,
    duplicateSession,
    updateSession,
  } = useWorkoutSessions();
  const { getExerciseById } = useExercises();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] =
    useState<MuscleGroup>("all");
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);
  const [addingExercise, setAddingExercise] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [editingWorkoutExerciseId, setEditingWorkoutExerciseId] = useState<
    string | null
  >(null);
  const [editingInitialDetails, setEditingInitialDetails] = useState<
    ExerciseDetails | undefined
  >(undefined);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  useEffect(() => {
    if (sessions.length > 0) {
      const foundSession = getSessionById(sessionId);
      setSession(foundSession || null);
      setLoading(false);
    }
  }, [sessions, sessionId, getSessionById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-600 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la séance...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Séance non trouvée
          </h2>
          <p className="text-gray-600 mb-6">
            Cette séance n&apos;existe pas ou a été supprimée.
          </p>
          <button
            onClick={() => router.push("/tracker")}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            Retour aux séances
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const filteredExercises =
    selectedMuscleGroup === "all"
      ? session.exercises
      : session.exercises.filter(
          (ex) => ex.exercise?.muscleGroup === selectedMuscleGroup,
        );

  const estimatedDuration =
    session.duration || Math.max(30, session.totalExercises * 5);

  const handleDelete = async () => {
    const success = await deleteSession(session.id);
    if (success) {
      router.push("/tracker");
    }
  };

  const handleDuplicate = async () => {
    const duplicated = await duplicateSession(session.id);
    if (duplicated) {
      router.push(`/tracker/session/${duplicated.id}`);
    }
  };

  // Step 1: User selects an exercise from the list to ADD
  const handleExerciseSelected = (exerciseId: string) => {
    const exerciseInfo = getExerciseById(exerciseId);
    if (!exerciseInfo) return;

    setSelectedExercise(exerciseInfo);
    setIsEditingExisting(false);
    setEditingInitialDetails(undefined);
    setEditingWorkoutExerciseId(null);
    setShowDetailsModal(true);
  };

  // Step 1 bis: User wants to EDIT an existing exercise
  const handleEditExercise = (workoutExerciseId: string) => {
    if (!session) return;
    const workoutEx = session.exercises.find(
      (ex) => ex.id === workoutExerciseId,
    );
    if (!workoutEx) return;

    const exerciseInfo = getExerciseById(workoutEx.exerciseId);
    if (!exerciseInfo) return;

    setSelectedExercise(exerciseInfo);
    setIsEditingExisting(true);
    setEditingWorkoutExerciseId(workoutExerciseId);

    setEditingInitialDetails({
      sets: workoutEx.sets,
      reps: workoutEx.reps,
      weight: workoutEx.weight,
      duration: workoutEx.duration,
      speed: workoutEx.speed,
      slope: workoutEx.slope,
      notes: workoutEx.notes || "",
    });

    setShowDetailsModal(true);
  };

  // Step 2: User confirms the details (sets, reps, weight, etc.)
  const handleDetailsConfirmed = async (details: ExerciseDetails) => {
    if (!session || !selectedExercise || addingExercise) return;

    setAddingExercise(true);
    setShowDetailsModal(false);

    try {
      if (isEditingExisting && editingWorkoutExerciseId) {
        // Mode ÉDITION
        const updatedExercises = session.exercises
          .map((ex) => {
            if (ex.id === editingWorkoutExerciseId) {
              return {
                ...ex,
                sets: details.sets,
                reps: details.reps,
                weight: details.weight,
                duration: details.duration,
                speed: details.speed,
                slope: details.slope,
                notes: details.notes,
              };
            }
            return ex;
          })
          .map(({ id, exercise, ...rest }) => rest);

        await updateSession(session.id, {
          date: session.date,
          notes: session.notes,
          exercises: updatedExercises,
        });
      } else {
        // Mode AJOUT
        const newExercise = {
          exerciseId: selectedExercise.id,
          sets: details.sets,
          reps: details.reps,
          weight: details.weight,
          duration: details.duration,
          speed: details.speed,
          slope: details.slope,
          notes: details.notes,
          order: session.exercises.length + 1,
        };

        const existingExercises = session.exercises.map(
          ({ id, exercise, ...rest }) => rest,
        );

        await updateSession(session.id, {
          date: session.date,
          notes: session.notes,
          exercises: [...existingExercises, newExercise],
        });
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de l'exercice:", err);
    } finally {
      setAddingExercise(false);
      setSelectedExercise(null);
      setIsEditingExisting(false);
      setEditingWorkoutExerciseId(null);
    }
  };

  const handleDetailsCancel = () => {
    setShowDetailsModal(false);
    setSelectedExercise(null);
    setIsEditingExisting(false);
    setEditingWorkoutExerciseId(null);
  };

  // Delete a single exercise from the session
  const handleDeleteExercise = async () => {
    if (!session || !exerciseToDelete) return;

    try {
      const remainingExercises = session.exercises
        .filter((ex) => ex.id !== exerciseToDelete)
        .map(({ id, exercise, ...rest }, idx) => ({
          ...rest,
          order: idx + 1,
        }));

      await updateSession(session.id, {
        date: session.date,
        notes: session.notes,
        exercises: remainingExercises,
      });
    } catch (err) {
      console.error("Erreur lors de la suppression de l'exercice:", err);
    } finally {
      setExerciseToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsNavMenuOpen(true)}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menu de navigation"
              >
                <Activity className="h-8 w-8 text-green-600" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">
                  Tracker
                </h1>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/tracker")}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Retour
              </button>

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
                      <p className="text-sm font-medium text-gray-900">
                        {user?.user_metadata?.name || "Utilisateur"}
                      </p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* En-tête de la séance */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
            {formatDate(session.date)}
          </h1>
          <p className="text-gray-600">
            {session.totalExercises} exercice
            {session.totalExercises > 1 ? "s" : ""}
            {estimatedDuration && ` • ${estimatedDuration} min`}
          </p>
        </div>

        <SessionActions
          onEdit={() => router.push(`/tracker/edit/${session.id}`)}
          onDuplicate={() => setShowDuplicateConfirm(true)}
          onDelete={() => setShowDeleteConfirm(true)}
        />

        <SessionInfoCard
          session={session}
          estimatedDuration={estimatedDuration}
          formatDate={formatDate}
        />

        <ExerciseDistributionChart
          exercises={session.exercises}
          className="mb-8"
        />

        <MuscleGroupFilter
          exercises={session.exercises}
          selectedMuscleGroup={selectedMuscleGroup}
          onSelect={setSelectedMuscleGroup}
        />

        {/* Exercises List */}
        <div className="space-y-4">
          {filteredExercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              onDelete={(id) => setExerciseToDelete(id)}
              onEdit={(id) => handleEditExercise(id)}
            />
          ))}
        </div>
      </main>

      {/* Floating Add Exercise Button */}
      <FloatingAddButton
        onClick={() => setShowAddExerciseModal(true)}
        loading={addingExercise}
      />

      {/* Step 1: Exercise Selection Modal */}
      <ExerciseSelectionModal
        isOpen={showAddExerciseModal}
        onClose={() => setShowAddExerciseModal(false)}
        onSelect={handleExerciseSelected}
      />

      {/* Step 2: Exercise Details Modal */}
      <ExerciseDetailsModal
        isOpen={showDetailsModal}
        exercise={selectedExercise}
        onClose={handleDetailsCancel}
        onConfirm={handleDetailsConfirmed}
        isEditing={isEditingExisting}
        initialDetails={editingInitialDetails}
      />

      {/* Delete Exercise Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!exerciseToDelete}
        onClose={() => setExerciseToDelete(null)}
        onConfirm={handleDeleteExercise}
        title="Supprimer l'exercice"
        message="Voulez-vous retirer cet exercice de la séance ?"
        confirmLabel="Supprimer"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {/* Delete Session Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer la séance"
        message="Êtes-vous sûr de vouloir supprimer cette séance ? Cette action est irréversible."
        confirmLabel="Supprimer"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {/* Duplicate Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDuplicateConfirm}
        onClose={() => setShowDuplicateConfirm(false)}
        onConfirm={handleDuplicate}
        title="Dupliquer la séance"
        message="Voulez vous dupliquer cette séance ?"
        confirmLabel="Dupliquer"
        confirmColor="bg-gray-600 hover:bg-gray-700"
      />

      {/* Menu de navigation */}
      <NavigationMenu
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        currentModule="tracker"
      />
    </div>
  );
}
