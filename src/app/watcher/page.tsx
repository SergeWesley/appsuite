"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Film,
  CheckCircle,
  Clock,
  Search,
  LogOut,
  User,
  Heart,
  Play,
  Tv,
  Camera,
  Trash,
} from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { useMediasWithSessions } from "@/hooks/watcher/useMediasWithSessions";
import { useFilterPersistence } from "@/hooks/useFilterPersistence";
import { Media, MediaStatus, MediaFormData, MediaType } from "@/types/media";
import { MediaCard } from "@/components/watcher/MediaCard";
import { MediaForm } from "@/components/watcher/MediaForm";
import { MediaStats } from "@/components/watcher/MediaStats";
import { WatchingTimer } from "@/components/watcher/WatchingTimer";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export default function WatcherPage() {
  const {
    medias,
    loading,
    error,
    addMedia,
    updateMedia,
    deleteMedia,
    getStats,
    refreshMedias,
    formatDuration,
    getMediaStats,
    stopSession,
    isSessionActive,
    getFormattedCurrentTime,
    startSession,
  } = useMediasWithSessions();
  const { user, signOut } = useAuthContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | undefined>(
    undefined,
  );
  const [timerMedia, setTimerMedia] = useState<Media | undefined>(undefined);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  // Gestion de la persistance des filtres
  const { selectedStatus, selectedType, searchQuery, updateFilter } =
    useFilterPersistence("watcher-filters", {
      selectedStatus: "all",
      selectedType: "all",
      searchQuery: "",
    });

  const handleAddMedia = async (data: MediaFormData) => {
    await addMedia(data);
  };

  const handleEditMedia = async (data: MediaFormData) => {
    if (editingMedia) {
      await updateMedia(editingMedia.id, data);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette œuvre ?")) {
      await deleteMedia(id);
    }
  };

  const handleStatusChange = async (id: string, status: MediaStatus) => {
    await updateMedia(id, { status });
  };

  const openForm = (media?: Media) => {
    setEditingMedia(media || undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingMedia(undefined);
  };

  const handleSubmit = (data: MediaFormData) => {
    if (editingMedia) {
      handleEditMedia(data);
    } else {
      handleAddMedia(data);
    }
  };

  const openTimer = (media: Media) => {
    setTimerMedia(media);
    setIsTimerOpen(true);
  };

  const closeTimer = () => {
    setIsTimerOpen(false);
    setTimerMedia(undefined);
  };

  // Filtrer les médias
  const filteredMedias = medias.filter((media) => {
    const matchesStatus = selectedStatus === "all" || media.status === selectedStatus;
    const matchesType = selectedType === "all" || media.type === selectedType;
    const matchesSearch =
      media.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (media.director &&
        media.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (media.creator &&
        media.creator.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (media.studio &&
        media.studio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (media.genre &&
        media.genre.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  const statusFilters = [
    { value: "all", label: "Tous", icon: Film },
    { value: "watching", label: "En cours", icon: Play },
    { value: "completed", label: "Terminés", icon: CheckCircle },
    { value: "towatch", label: "À voir", icon: Clock },
    { value: "wishlist", label: "Souhaits", icon: Heart },
    { value: "dropped", label: "Abandonnés", icon: Trash },
  ];

  const typeFilters = [
    { value: "all", label: "Tous types", icon: Film },
    { value: "movie", label: "Films", icon: Film },
    { value: "series", label: "Séries", icon: Tv },
    { value: "anime", label: "Animés", icon: Play },
    { value: "documentary", label: "Documentaires", icon: Camera },
  ];

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Chargement de votre médiathèque...
          </p>
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
            <div className="flex items-center">
              <button
                onClick={() => setIsNavMenuOpen(true)}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menu de navigation"
              >
                <Film className="h-8 w-8 text-purple-600" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">
                  Watcher
                </h1>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => openForm()}
                className="inline-flex items-center text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Ajouter une œuvre
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
        {/* Statistiques */}
        <MediaStats {...stats} />

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
              placeholder="Rechercher par titre, réalisateur, créateur, studio ou genre..."
              value={searchQuery}
              onChange={(e) => updateFilter("searchQuery", e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filtres par statut */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => updateFilter("selectedStatus", filter.value)}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === filter.value
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <filter.icon size={16} className="mr-2" />
                {filter.label}
              </button>
            ))}
          </div>

          {/* Filtres par type */}
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => updateFilter("selectedType", filter.value)}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === filter.value
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <filter.icon size={16} className="mr-2" />
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des médias */}
        <div className="space-y-6">
          {filteredMedias.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Film className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {medias.length === 0
                  ? "Aucune œuvre dans votre médiathèque"
                  : "Aucune œuvre trouvée"}
              </h3>
              <p className="mt-2 text-gray-600">
                {medias.length === 0
                  ? "Commencez par ajouter votre première œuvre !"
                  : "Essayez de modifier vos filtres de recherche"}
              </p>
              {medias.length === 0 && (
                <button
                  onClick={() => openForm()}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Ajouter une œuvre
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredMedias.map((media, index) => (
                  <motion.div
                    key={media.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <MediaCard
                      media={media}
                      onEdit={openForm}
                      onDelete={handleDeleteMedia}
                      onStatusChange={handleStatusChange}
                      onOpenTimer={openTimer}
                      //   isSessionActive={isSessionActive(media.id)}
                      //   currentSessionTime={getFormattedCurrentTime(media.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Bouton flottant pour mobile */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => openForm()}
        className="floating-action md:hidden inline-flex items-center justify-center w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
      >
        <Plus size={24} />
      </motion.button>

      {/* Formulaire */}
      <MediaForm
        media={editingMedia}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onDelete={handleDeleteMedia}
      />

      {/* Timer de visionnage */}
      {timerMedia && (
        <WatchingTimer
          media={timerMedia}
          isOpen={isTimerOpen}
          onClose={closeTimer}
        />
      )}

      {/* Menu de navigation */}
      <NavigationMenu
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        currentModule="watcher"
      />
    </div>
  );
}
