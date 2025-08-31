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
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
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

// Composant pour les cartes draggables
function DraggableMediaCard({ media, onEdit, onDelete, onStatusChange, onOpenTimer }: {
  media: Media;
  onEdit: (media: Media) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: MediaStatus) => void;
  onOpenTimer: (media: Media) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: media.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${isDragging ? 'opacity-50' : ''} transition-all duration-200`}
    >
      <MediaCard
        media={media}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onOpenTimer={onOpenTimer}
      />
    </div>
  );
}

// Composant pour les zones de dépôt
function DroppableStatusSection({ status, children, title, icon: Icon, color }: {
  status: MediaStatus;
  children: React.ReactNode;
  title: string;
  icon: any;
  color: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-48 p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
        isOver 
          ? 'border-purple-400 bg-purple-50 scale-102' 
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={20} className={color} />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showKanban, setShowKanban] = useState(false);

  // Configuration des capteurs pour le drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Gestion de la persistance des filtres
  const { selectedStatus, selectedType, searchQuery, updateFilter, toggleArrayFilter, isFilterSelected } =
    useFilterPersistence("watcher-filters", {
      selectedStatus: [],
      selectedType: [],
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

  // Gestion du drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      const mediaId = active.id as string;
      const newStatus = over.id as MediaStatus;
      
      // Trouver le média à mettre à jour
      const media = medias.find(m => m.id === mediaId);
      
      if (media && media.status !== newStatus) {
        handleStatusChange(mediaId, newStatus);
      }
    }
    
    setActiveId(null);
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
    // Si aucun filtre de statut n'est sélectionné, on affiche tout
    const statusArray = Array.isArray(selectedStatus) ? selectedStatus : [];
    const matchesStatus = statusArray.length === 0 || statusArray.includes(media.status);

    // Si aucun filtre de type n'est sélectionné, on affiche tout
    const typeArray = Array.isArray(selectedType) ? selectedType : [];
    const matchesType = typeArray.length === 0 || typeArray.includes(media.type);

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

  // Grouper les médias par statut pour la vue kanban
  const mediasByStatus = {
    towatch: filteredMedias.filter(m => m.status === 'towatch'),
    watching: filteredMedias.filter(m => m.status === 'watching'),
    completed: filteredMedias.filter(m => m.status === 'completed'),
    wishlist: filteredMedias.filter(m => m.status === 'wishlist'),
    dropped: filteredMedias.filter(m => m.status === 'dropped'),
  };

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

  const statusSections = [
    { status: 'towatch' as MediaStatus, title: 'À voir', icon: Clock, color: 'text-blue-600' },
    { status: 'watching' as MediaStatus, title: 'En cours', icon: Play, color: 'text-green-600' },
    { status: 'completed' as MediaStatus, title: 'Terminés', icon: CheckCircle, color: 'text-purple-600' },
    { status: 'wishlist' as MediaStatus, title: 'Souhaits', icon: Heart, color: 'text-pink-600' },
    { status: 'dropped' as MediaStatus, title: 'Abandonnés', icon: Trash, color: 'text-red-600' },
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
                  onClick={() => setShowKanban(!showKanban)}
                  className={`inline-flex items-center text-sm px-4 py-2 rounded-lg transition-colors ${
                    showKanban 
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Vue Kanban
                </button>
                
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
          {!showKanban && (
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
                {statusFilters.map((filter) => {
                  const isSelected = filter.value === "all"
                    ? (Array.isArray(selectedStatus) ? selectedStatus.length === 0 : selectedStatus === "all")
                    : isFilterSelected("selectedStatus", filter.value);

                  return (
                    <button
                      key={filter.value}
                      onClick={() => {
                        if (filter.value === "all") {
                          // Réinitialiser tous les filtres de statut
                          updateFilter("selectedStatus", []);
                        } else {
                          toggleArrayFilter("selectedStatus", filter.value);
                        }
                      }}
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <filter.icon size={16} className="mr-2" />
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              {/* Filtres par type */}
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((filter) => {
                  const isSelected = filter.value === "all"
                    ? (Array.isArray(selectedType) ? selectedType.length === 0 : selectedType === "all")
                    : isFilterSelected("selectedType", filter.value);

                  return (
                    <button
                      key={filter.value}
                      onClick={() => {
                        if (filter.value === "all") {
                          // Réinitialiser tous les filtres de type
                          updateFilter("selectedType", []);
                        } else {
                          toggleArrayFilter("selectedType", filter.value);
                        }
                      }}
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <filter.icon size={16} className="mr-2" />
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vue Kanban */}
          {showKanban ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Vue Kanban - Glissez-déposez pour changer de statut</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {statusSections.map((section) => (
                  <DroppableStatusSection
                    key={section.status}
                    status={section.status}
                    title={section.title}
                    icon={section.icon}
                    color={section.color}
                  >
                    <div className="space-y-4">
                      <AnimatePresence>
                        {mediasByStatus[section.status].map((media) => (
                          <motion.div
                            key={media.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full"
                          >
                            <DraggableMediaCard
                              media={media}
                              onEdit={openForm}
                              onDelete={handleDeleteMedia}
                              onStatusChange={handleStatusChange}
                              onOpenTimer={openTimer}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {mediasByStatus[section.status].length === 0 && (
                        <p className="text-gray-400 text-sm text-center py-4">
                          Aucune œuvre
                        </p>
                      )}
                    </div>
                  </DroppableStatusSection>
                ))}
              </div>
            </div>
          ) : (
            /* Vue grille normale */
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
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
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

      {/* DragOverlay pour l'animation pendant le drag */}
      <DragOverlay>
        {activeId ? (
          <div className="opacity-80 transform rotate-6 scale-105">
            <MediaCard
              media={medias.find(m => m.id === activeId)!}
              onEdit={() => {}}
              onDelete={() => {}}
              onStatusChange={() => {}}
              onOpenTimer={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
