"use client";

// Framer motion retiré pour la stabilité mobile
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkoutSessions } from "@/hooks/tracker/useWorkoutSessions";
import { WorkoutSessionCard } from "@/components/tracker/WorkoutSessionCard";
import {
  Plus,
  Search,
  Activity,
  Dumbbell,
  Calendar,
  Target,
  List,
  TrendingUp,
  X,
  MoreVertical,
} from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useFilterPersistence } from "@/hooks/useFilterPersistence";
import { WorkoutCalendar } from "@/components/tracker/WorkoutCalendar";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { AppHeader } from "@/components/AppHeader";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { SessionMetadataModal } from "@/components/tracker/SessionMetadataModal";

export default function TrackerPage() {
  const router = useRouter();
  const { sessions, loading, error, deleteSession, addSession } = useWorkoutSessions();
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateSession = async (metadata: { date: Date; notes: string }) => {
    const newSession = await addSession({
      date: metadata.date,
      notes: metadata.notes,
      exercises: [],
    });
    if (newSession) {
      router.push(`/tracker/session/${newSession.id}`);
    }
  };

  const handleDeleteSession = async () => {
    if (sessionToDelete) {
      await deleteSession(sessionToDelete);
      setSessionToDelete(null);
    }
  };

  // Gestion de la persistance des filtres
  const { selectedPeriod, selectedViewMode, searchQuery, updateFilter } =
    useFilterPersistence("tracker-filters", {
      selectedPeriod: "all",
      searchQuery: "",
    });

  // Filtrer les séances selon les critères
  const filteredSessions = sessions.filter((session) => {
    // Filtre par période
    if (selectedPeriod === "week") {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const startOfWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - diffToMonday,
      );
      startOfWeek.setHours(0, 0, 0, 0);
      if (session.date < startOfWeek) return false;
    } else if (selectedPeriod === "month") {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      if (session.date < startOfMonth) return false;
    }

    // Filtre par recherche (notes ou nom d'exercices)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesNotes = session.notes?.toLowerCase().includes(query);
      const matchesExercises = session.exercises.some((exercise) =>
        exercise.exercise?.name.toLowerCase().includes(query),
      );
      return matchesNotes || matchesExercises;
    }

    return true;
  });

  // Filtres de période
  const periodFilters = [
    { value: "all", label: "Toutes les séances", icon: Activity },
    { value: "week", label: "Cette semaine", icon: Calendar },
    { value: "month", label: "Ce mois", icon: Target },
  ];

  if (loading) {
    return (
      <LoadingOverlay
        isLoading={true}
        message="Chargement de vos séances..."
        fullPage
      />
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
      <AppHeader
        title="Tracker"
        icon={Activity}
        iconColor="text-green-600"
        currentModule="tracker"
        actions={
          <>
            <button
              onClick={() => setShowCreateModal(true)}
              className="hidden sm:inline-flex items-center text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Nouvelle séance
            </button>

            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50">
                <MoreVertical size={20} />
              </MenuButton>

              <MenuItems className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 focus:outline-none">
                <div className="py-1">
                  <MenuItem
                    as="button"
                    onClick={() => router.push("/tracker/stats")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-100"
                  >
                    <TrendingUp size={16} className="text-indigo-600" />
                    Performances
                  </MenuItem>
                  <MenuItem
                    as="button"
                    onClick={() => router.push("/tracker/exercises")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-3 hover:bg-gray-100"
                  >
                    <Dumbbell size={16} className="text-gray-600" />
                    Exercices
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </>
        }
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres et recherche */}
        <div className="mb-8 space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher dans les notes ou exercices..."
              value={searchQuery}
              onChange={(e) => updateFilter("searchQuery", e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => updateFilter("searchQuery", "")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Effacer la recherche"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filtres par période */}
          <div className="flex flex-wrap gap-2">
            {periodFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() =>
                  updateFilter(
                    "selectedPeriod",
                    filter.value as "all" | "week" | "month",
                  )
                }
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === filter.value
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <filter.icon size={16} className="mr-2" />
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Vue Liste/Calendrier */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => updateFilter("selectedViewMode", "list")}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedViewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List size={16} className="mr-2" />
              Liste
            </button>
            <button
              onClick={() => updateFilter("selectedViewMode", "calendar")}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedViewMode === "calendar"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Calendar size={16} className="mr-2" />
              Calendrier
            </button>
          </div>

          {/* Affichage du nombre de séances */}
          <div className="text-sm text-gray-600">
            {filteredSessions.length} séance
            {filteredSessions.length > 1 ? "s" : ""}
            {searchQuery || selectedPeriod !== "all"
              ? " trouvée" + (filteredSessions.length > 1 ? "s" : "")
              : ""}
          </div>
        </div>

        {/* Contenu selon le mode de vue */}
        <div className="space-y-6">
          {selectedViewMode === "calendar" ? (
            /* Vue Calendrier */
            <div key="calendar-view">
              <WorkoutCalendar
                sessions={filteredSessions}
                onSessionClick={(session) =>
                  router.push(`/tracker/session/${session.id}`)
                }
              />
            </div>
          ) : (
            /* Vue Liste */
            <div key="list-view">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {searchQuery || selectedPeriod !== "all"
                      ? "Aucune séance trouvée"
                      : sessions.length === 0
                        ? "Aucune séance enregistrée"
                        : "Aucune séance trouvée"}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {searchQuery || selectedPeriod !== "all"
                      ? "Essayez de modifier vos critères de recherche."
                      : sessions.length === 0
                        ? "Commencez par créer votre première séance d'entraînement."
                        : "Aucune séance ne correspond aux critères."}
                  </p>
                    {sessions.length === 0 &&
                    !searchQuery &&
                    selectedPeriod === "all" && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus size={20} className="mr-2" />
                        Créer ma première séance
                      </button>
                    )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSessions.map((session, index) => (
                    <div
                      key={session.id}
                      className="h-full"
                    >
                      <WorkoutSessionCard
                        session={session}
                        index={index}
                        href={`/tracker/session/${session.id}`}
                        onDelete={(id) => setSessionToDelete(id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </main>

      {/* Bouton flottant pour mobile */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="floating-action md:hidden inline-flex items-center justify-center w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors active:scale-95"
      >
        <Plus size={24} />
      </button>

      {/* Modal de création */}
      <SessionMetadataModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateSession}
        title="Nouvelle séance"
        confirmLabel="Créer"
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleDeleteSession}
        title="Supprimer la séance"
        message="Êtes-vous sûr de vouloir supprimer cette séance ? Cette action est irréversible."
        confirmLabel="Supprimer"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
