"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useExercises } from "@/hooks/tracker/useExercices";
import { ExerciseForm } from "@/components/tracker/ExerciseForm";
import { NavigationMenu } from "@/components/NavigationMenu";
import {
  Exercise,
  ExerciseFormData,
  MuscleGroup,
  MUSCLE_GROUP_LABELS,
} from "@/types/workout-session";
import {
  Activity,
  Plus,
  Search,
  Edit,
  Star,
  Dumbbell,
  LogOut,
  User,
  ArrowLeft,
} from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export default function ExerciseCatalogPage() {
  const router = useRouter();
  const { user, signOut } = useAuthContext();
  const {
    exercises,
    loading,
    error,
    addCustomExercise,
    updateCustomExercise,
    deleteCustomExercise,
    searchExercises,
  } = useExercises();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] =
    useState<MuscleGroup>("all");
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<
    Exercise | undefined
  >();
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  // Filtrer les exercices
  const filteredExercises = searchExercises(searchQuery, selectedMuscleGroup);

  // Grouper par type (prédéfinis vs personnalisés)
  const defaultExercises = filteredExercises.filter((ex) => !ex.isCustom);
  const customExercises = filteredExercises.filter((ex) => ex.isCustom);

  const muscleGroups: MuscleGroup[] = [
    "all",
    "upper_body",
    "lower_body",
    "cardio",
    "core",
    "full_body",
    "other",
  ];

  const handleAddExercise = async (formData: ExerciseFormData) => {
    await addCustomExercise(formData);
  };

  const handleEditExercise = async (formData: ExerciseFormData) => {
    if (editingExercise) {
      await updateCustomExercise(editingExercise.id, formData);
      setEditingExercise(undefined);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    await deleteCustomExercise(id);
    setEditingExercise(undefined);
  };

  const openEditForm = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setShowExerciseForm(true);
  };

  const closeForm = () => {
    setShowExerciseForm(false);
    setEditingExercise(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-600 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des exercices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erreur de connexion
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

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
                <Activity className="h-8 w-8 text-green-600" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">
                  Tracker
                </h1>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowExerciseForm(true)}
                className="hidden sm:inline-flex items-center text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Créer un exercice
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
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Catalogue d'exercices
          </h1>
          <p className="text-gray-600">
            Explorez et gérez vos exercices disponibles
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total exercices</p>
                <p className="text-2xl font-bold text-blue-600">
                  {exercises.length}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Dumbbell size={20} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prédéfinis</p>
                <p className="text-2xl font-bold text-green-600">
                  {defaultExercises.length}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Star size={20} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Personnalisés</p>
                <p className="text-2xl font-bold text-purple-600">
                  {customExercises.length}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Edit size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher un exercice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filtres par groupe musculaire */}
          <div className="flex flex-wrap gap-2">
            {muscleGroups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedMuscleGroup(group)}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedMuscleGroup === group
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {MUSCLE_GROUP_LABELS[group]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {filteredExercises.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Dumbbell size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun exercice trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Aucun exercice ne correspond à vos critères de recherche.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExerciseForm(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              Créer un exercice personnalisé
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Custom Exercises */}
            {customExercises.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Edit size={20} className="text-purple-600" />
                  Exercices personnalisés ({customExercises.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {customExercises.map((exercise, index) => (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {exercise.name}
                          </h3>
                          <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full border border-purple-200">
                            {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                          </span>
                        </div>
                        <button
                          onClick={() => openEditForm(exercise)}
                          className="p-2 text-gray-400 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                      {exercise.description && (
                        <p className="text-sm text-gray-600 mt-3">
                          {exercise.description}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Default Exercises */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star size={20} className="text-green-600" />
                Exercices prédéfinis ({defaultExercises.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {defaultExercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: (customExercises.length + index) * 0.05,
                    }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Texte à gauche */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {exercise.name}
                        </h3>
                        <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">
                          {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                        </span>

                        {exercise.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {exercise.description}
                          </p>
                        )}
                      </div>

                      {/* GIF à droite */}
                      {exercise.source && (
                        <img
                          src={`/${exercise.source}`}
                          alt={exercise.name}
                          className="w-24 h-24 object-contain rounded-lg"
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bouton flottant pour mobile */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowExerciseForm(true)}
        className="floating-action md:hidden inline-flex items-center justify-center w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
      >
        <Plus size={24} />
      </motion.button>

      {/* Exercise Form Modal */}
      <ExerciseForm
        exercise={editingExercise}
        isOpen={showExerciseForm}
        onClose={closeForm}
        onSubmit={editingExercise ? handleEditExercise : handleAddExercise}
        onDelete={editingExercise?.isCustom ? handleDeleteExercise : undefined}
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
