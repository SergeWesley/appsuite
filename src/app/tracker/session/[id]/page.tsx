"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useWorkoutSessions } from "@/hooks/tracker/useWorkoutSessions";
import {
  WorkoutSession,
  MuscleGroup,
  MUSCLE_GROUP_LABELS,
} from "@/types/workout-session";
import { NavigationMenu } from "@/components/NavigationMenu";
import { ExerciseBubblePlot } from "@/components/tracker/ExerciseBubblePlot";
import {
  Calendar,
  Activity,
  Clock,
  FileText,
  Edit,
  Trash2,
  Copy,
  LogOut,
  User,
} from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export default function WorkoutSessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const { user, signOut } = useAuthContext();

  const { sessions, getSessionById, deleteSession, duplicateSession } =
    useWorkoutSessions();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] =
    useState<MuscleGroup>("all");
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
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
            Cette séance n'existe pas ou a été supprimée.
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

  // Filtrer les exercices par groupe musculaire
  const filteredExercises =
    selectedMuscleGroup === "all"
      ? session.exercises
      : session.exercises.filter(
          (ex) => ex.exercise?.muscleGroup === selectedMuscleGroup,
        );

  // Obtenir la liste des groupes musculaires présents dans la séance
  const availableMuscleGroups = Array.from(
    new Set(
      session.exercises.map((ex) => ex.exercise?.muscleGroup).filter(Boolean),
    ),
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const handleDelete = async () => {
    const success = await deleteSession(session.id);
    if (success) {
      router.push("/tracker");
    }
  };

  const handleDuplicate: any = async () => {
    const duplicated = await duplicateSession(session.id);
    if (duplicated) {
      router.push(`/tracker/session/${duplicated.id}`);
    }
  };

  const estimatedDuration =
    session.duration || Math.max(30, session.totalExercises * 5);

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

              {/* Menu utilisateur */}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/tracker/edit/${session.id}`)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Edit size={16} className="mr-2" />
            <div className="hidden sm:block">Modifier</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDuplicateConfirm(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            <Copy size={16} className="mr-2" />
            <div className="hidden sm:block">Dupliquer</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <Trash2 size={16} className="mr-2" />
            <div className="hidden sm:block">Supprimer</div>
          </motion.button>
        </div>

        {/* Session Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <Calendar size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {formatDate(session.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Activity size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Exercices</p>
                <p className="font-semibold text-gray-900">
                  {session.totalExercises}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Clock size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Durée estimée</p>
                <p className="font-semibold text-gray-900">
                  {estimatedDuration} min
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {session.notes && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={20} className="text-gray-400" />
                <h3 className="font-semibold text-gray-900">Notes</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{session.notes}</p>
            </div>
          )}
        </div>

        {/* Exercise Bubble Plot */}
        <ExerciseBubblePlot exercises={session.exercises} className="mb-8" />

        {/* Exercise Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedMuscleGroup("all")}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMuscleGroup === "all"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Tous ({session.exercises.length})
            </button>
            {availableMuscleGroups.map((group) => {
              const count = session.exercises.filter(
                (ex) => ex.exercise?.muscleGroup === group,
              ).length;
              return (
                <button
                  key={group}
                  onClick={() => setSelectedMuscleGroup(group as MuscleGroup)}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMuscleGroup === group
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {MUSCLE_GROUP_LABELS[group as MuscleGroup]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          {filteredExercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {exercise.exercise?.name || "Exercice inconnu"}
                  </h3>
                  <span className="inline-block px-3 py-1 bg-gray-50 text-gray-700 text-sm rounded-full border">
                    {MUSCLE_GROUP_LABELS[
                      exercise.exercise?.muscleGroup as MuscleGroup
                    ] || "Autre"}
                  </span>
                </div>
                <div className="text-right text-sm text-gray-500">
                  #{exercise.order}
                </div>
              </div>

              {/* Exercise Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {exercise.sets && (
                  <div>
                    <p className="text-sm text-gray-500">Séries</p>
                    <p className="font-semibold text-gray-900">
                      {exercise.sets}
                    </p>
                  </div>
                )}
                {exercise.reps && (
                  <div>
                    <p className="text-sm text-gray-500">Répétitions</p>
                    <p className="font-semibold text-gray-900">
                      {exercise.reps}
                    </p>
                  </div>
                )}
                {exercise.weight && (
                  <div>
                    <p className="text-sm text-gray-500">Poids</p>
                    <p className="font-semibold text-gray-900">
                      {exercise.weight} kg
                    </p>
                  </div>
                )}
                {exercise.duration && (
                  <div>
                    <p className="text-sm text-gray-500">Durée</p>
                    <p className="font-semibold text-gray-900">
                      {exercise.duration} min
                    </p>
                  </div>
                )}
                {exercise.speed && (
                  <div>
                    <p className="text-sm text-gray-500">Vitesse</p>
                    <p className="font-semibold text-gray-900">
                      {exercise.speed} km/h
                    </p>
                  </div>
                )}
                {exercise.slope && (
                  <div>
                    <p className="text-sm text-gray-500">Pente</p>
                    <p className="font-semibold text-gray-900">
                      {exercise.slope} %
                    </p>
                  </div>
                )}
              </div>

              {/* Exercise Notes */}
              {exercise.notes && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {exercise.notes}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Supprimer la séance
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer cette séance ? Cette action
                est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duplicate Confirmation Modal */}
      <AnimatePresence>
        {showDuplicateConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDuplicateConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Dupliquer la séance
              </h3>
              <p className="text-gray-600 mb-6">
                Voulez vous dupliquer cette séance ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDuplicateConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDuplicate}
                  className="flex-1 px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Dupliquer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu de navigation */}
      <NavigationMenu
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        currentModule="tracker"
      />
    </div>
  );
}
