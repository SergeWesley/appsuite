'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useWorkoutSessions } from '@/hooks/tracker/useWorkoutSessions';
import { WorkoutSessionCard } from '@/components/tracker/WorkoutSessionCard';
import { WorkoutStats } from '@/components/tracker/WorkoutStats';
import { NavigationMenu } from '@/components/NavigationMenu';
import { Plus, Search, Activity, LogOut, User, Dumbbell, Calendar, Target, List } from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';
import { WorkoutCalendar } from '@/components/tracker/WorkoutCalendar';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

export default function TrackerPage() {
  const router = useRouter();
  const { user, signOut } = useAuthContext();
  const { sessions, loading, error, getStats } = useWorkoutSessions();
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  // Gestion de la persistance des filtres
  const {
    selectedPeriod,
    selectedViewMode,
    searchQuery,
    updateFilter
  } = useFilterPersistence('tracker-filters', {
      selectedPeriod: 'all',
      searchQuery: ''
  });

  // Filtrer les séances selon les critères
  const filteredSessions = sessions.filter(session => {
    // Filtre par période
    if (selectedPeriod === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      if (session.date < oneWeekAgo) return false;
    } else if (selectedPeriod === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      if (session.date < oneMonthAgo) return false;
    }

    // Filtre par recherche (notes ou nom d'exercices)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesNotes = session.notes?.toLowerCase().includes(query);
      const matchesExercises = session.exercises.some(
        exercise => exercise.exercise?.name.toLowerCase().includes(query)
      );
      return matchesNotes || matchesExercises;
    }

    return true;
  });

  const stats = getStats();

  // Filtres de période
  const periodFilters = [
    { value: 'all', label: 'Toutes les séances', icon: Activity },
    { value: 'week', label: 'Cette semaine', icon: Calendar },
    { value: 'month', label: 'Ce mois', icon: Target },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de vos séances...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de connexion</h2>
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
                <Activity className="h-8 w-8 text-green-600" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">Tracker</h1>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/tracker/exercises')}
                className="flex items-center text-sm px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Dumbbell size={20} className="mr-2" />
                Exercices
              </button>

              <button
                onClick={() => router.push('/tracker/new')}
                className="hidden sm:inline-flex items-center text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Nouvelle séance
              </button>

              {/* Menu utilisateur */}
              <Menu as="div" className="relative inline-block text-left">
                <MenuButton className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <User size={20} />
                    <span className="hidden sm:block">
                        {user?.user_metadata?.name || user?.email || 'Utilisateur'}
                    </span>
                </MenuButton>

                <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 focus:outline-none">
                    <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                            {user?.user_metadata?.name || 'Utilisateur'}
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
        <WorkoutStats stats={stats} />

        {/* Filtres et recherche */}
        <div className="mb-8 space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher dans les notes ou exercices..."
              value={searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filtres par période */}
          <div className="flex flex-wrap gap-2">
            {periodFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => updateFilter('selectedPeriod', filter.value as 'all' | 'week' | 'month')}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === filter.value
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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
              onClick={() => updateFilter('selectedViewMode', 'list')}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedViewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={16} className="mr-2" />
              Liste
            </button>
            <button
              onClick={() => updateFilter('selectedViewMode', 'calendar')}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedViewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar size={16} className="mr-2" />
              Calendrier
            </button>
          </div>

          {/* Affichage du nombre de séances */}
          <div className="text-sm text-gray-600">
            {filteredSessions.length} séance{filteredSessions.length > 1 ? 's' : ''}
            {searchQuery || selectedPeriod !== 'all' ? ' trouvée' + (filteredSessions.length > 1 ? 's' : '') : ''}
          </div>
        </div>

        {/* Contenu selon le mode de vue */}
        <div className="space-y-6">
          {selectedViewMode === 'calendar' ? (
            /* Vue Calendrier */
            <motion.div
              key="calendar-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WorkoutCalendar
                sessions={filteredSessions}
                onSessionClick={(session) => router.push(`/tracker/session/${session.id}`)}
              />
            </motion.div>
          ) : (
            /* Vue Liste */
            <motion.div
              key="list-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {filteredSessions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {searchQuery || selectedPeriod !== 'all'
                      ? 'Aucune séance trouvée'
                      : sessions.length === 0
                      ? 'Aucune séance enregistrée'
                      : 'Aucune séance trouvée'
                    }
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {searchQuery || selectedPeriod !== 'all'
                      ? 'Essayez de modifier vos critères de recherche.'
                      : sessions.length === 0
                      ? 'Commencez par créer votre première séance d\'entraînement.'
                      : 'Aucune séance ne correspond aux critères.'
                    }
                  </p>
                  {sessions.length === 0 && !searchQuery && selectedPeriod === 'all' && (
                    <button
                      onClick={() => router.push('/tracker/new')}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus size={20} className="mr-2" />
                      Créer ma première séance
                    </button>
                  )}
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredSessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="h-full"
                      >
                        <WorkoutSessionCard
                          session={session}
                          onClick={() => router.push(`/tracker/session/${session.id}`)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Liste des séances */}
        {/* <div className="space-y-6">
          {filteredSessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchQuery || selectedPeriod !== 'all' 
                  ? 'Aucune séance trouvée' 
                  : sessions.length === 0 
                  ? 'Aucune séance enregistrée'
                  : 'Aucune séance trouvée'
                }
              </h3>
              <p className="mt-2 text-gray-600">
                {searchQuery || selectedPeriod !== 'all'
                  ? 'Essayez de modifier vos critères de recherche.'
                  : sessions.length === 0
                  ? 'Commencez par créer votre première séance d\'entraînement.'
                  : 'Aucune séance ne correspond aux critères.'
                }
              </p>
              {sessions.length === 0 && !searchQuery && selectedPeriod === 'all' && (
                <button
                  onClick={() => router.push('/tracker/new')}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Créer ma première séance
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <WorkoutSessionCard
                      session={session}
                      onClick={() => router.push(`/tracker/session/${session.id}`)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div> */}
      </main>

      {/* Bouton flottant pour mobile */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push('/tracker/new')}
        className="floating-action md:hidden inline-flex items-center justify-center w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
      >
        <Plus size={24} />
      </motion.button>

      {/* Menu de navigation */}
      <NavigationMenu
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        currentModule="tracker"
      />
    </div>
  );
}
