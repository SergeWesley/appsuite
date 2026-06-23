"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWorkoutSessions } from "@/hooks/tracker/useWorkoutSessions";
import { useExercises } from "@/hooks/tracker/useExercices";
import { WorkoutSession, Exercise, MuscleGroup } from "@/types/workout-session";
import { ExerciseDistributionChart } from "@/components/tracker/ExerciseDistributionChart";
import { ExerciseSelectionModal } from "@/components/tracker/ExerciseSelectionModal";
import { ExerciseDetailsModal } from "@/components/tracker/ExerciseDetailsModal";
import type { ExerciseDetails } from "@/components/tracker/ExerciseDetailsModal";
import { SessionInfoCard } from "@/components/tracker/SessionInfoCard";
import { SessionActions } from "@/components/tracker/SessionActions";
import { SessionMetadataModal } from "@/components/tracker/SessionMetadataModal";
import { ExerciseCard } from "@/components/tracker/ExerciseCard";
import { MuscleGroupFilter } from "@/components/tracker/MuscleGroupFilter";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { FloatingAddButton } from "@/components/tracker/FloatingAddButton";
import { Activity, Dumbbell, TrendingUp } from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { AppHeader } from "@/components/AppHeader";
import {
  calculateEstimatedDuration,
  formatDuration,
} from "@/lib/workout-utils";

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
  const [showMetadataModal, setShowMetadataModal] = useState(false);
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

  // Trouver les dernières performances de l'exercice sélectionné
  const lastPerformances = useMemo(() => {
    if (!selectedExercise || isEditingExisting || !session) return [];

    // Parcourir toutes les séances (elles sont déjà triées par date décroissante dans le hook)
    for (const s of sessions) {
      if (s.id === session.id) continue; // Ignorer la séance courante

      const prevExercises = s.exercises.filter(
        (e) => e.exerciseId === selectedExercise.id,
      );
      if (prevExercises.length > 0) {
        return prevExercises.map(
          (prevEx) =>
            ({
              sets: prevEx.sets,
              reps: prevEx.reps,
              weight: prevEx.weight,
              duration: prevEx.duration,
              speed: prevEx.speed,
              slope: prevEx.slope,
              notes: prevEx.notes,
            }) as ExerciseDetails,
        );
      }
    }
    return [];
  }, [selectedExercise, sessions, session, isEditingExisting]);

  useEffect(() => {
    if (sessions.length > 0) {
      const foundSession = getSessionById(sessionId);
      setSession(foundSession || null);
      setLoading(false);
    }
  }, [sessions, sessionId, getSessionById]);

  if (loading) {
    return (
      <LoadingOverlay
        isLoading={true}
        message="Chargement de la séance..."
        fullPage
      />
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

  const estimatedDuration = calculateEstimatedDuration(session);

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

  const handleMetadataConfirm = async (metadata: {
    date: Date;
    notes: string;
  }) => {
    if (!session) return;

    await updateSession(session.id, {
      date: metadata.date,
      notes: metadata.notes,
      exercises: session.exercises.map(({ id, exercise, ...rest }) => rest), // Keep exercises unchanged
    });

    setShowMetadataModal(false);
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
      <AppHeader
        title="Tracker"
        icon={Activity}
        iconColor="text-green-600"
        currentModule="tracker"
        onBack={() => router.push("/tracker")}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* En-tête de la séance */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
            {formatDate(session.date)}
          </h1>
          <p className="text-gray-600">
            {session.totalExercises} exercice
            {session.totalExercises > 1 ? "s" : ""}
            {estimatedDuration > 0 && ` • ${formatDuration(estimatedDuration)}`}
          </p>
        </div>

        <SessionActions
          onEdit={() => setShowMetadataModal(true)}
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
          onEditExercise={handleEditExercise}
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
        lastPerformances={lastPerformances}
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

      {/* Edit Metadata Modal */}
      <SessionMetadataModal
        isOpen={showMetadataModal}
        onClose={() => setShowMetadataModal(false)}
        onConfirm={handleMetadataConfirm}
        initialData={
          session
            ? { date: session.date, notes: session.notes || "" }
            : undefined
        }
        title="Modifier la séance"
        confirmLabel="Enregistrer"
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
    </div>
  );
}
