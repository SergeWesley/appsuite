'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWorkoutSessions } from '@/hooks/tracker/useWorkoutSessions';
import { WorkoutSessionForm } from '@/components/tracker/WorkoutSessionForm';
import { WorkoutSession, WorkoutSessionFormData } from '@/types/workout-session';
import { NavigationMenu } from '@/components/NavigationMenu';
import { Activity, LogOut, User } from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

export default function EditWorkoutSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const { user, signOut } = useAuthContext();
  
  const { sessions, getSessionById, updateSession } = useWorkoutSessions();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  useEffect(() => {
    if (sessions.length > 0) {
      const foundSession = getSessionById(sessionId);
      setSession(foundSession || null);
      setLoading(false);
    }
  }, [sessions, sessionId, getSessionById]);

  const handleSubmit = async (formData: WorkoutSessionFormData) => {
    if (!session) return;
    
    const success = await updateSession(session.id, formData);
    if (success) {
      router.push(`/tracker/session/${session.id}`);
    }
  };

  const handleCancel = () => {
    if (session) {
      router.push(`/tracker/session/${session.id}`);
    } else {
      router.push('/tracker');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Séance non trouvée</h2>
          <p className="text-gray-600 mb-6">Cette séance n'existe pas ou a été supprimée.</p>
          <button
            onClick={() => router.push('/tracker')}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            Retour aux séances
          </button>
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsNavMenuOpen(true)}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menu de navigation"
              >
                <Activity className="h-8 w-8 text-green-600" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">Tracker</h1>
              </button>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">Modifier séance</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/tracker/session/${session.id}`)}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Retour
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Modifier la séance
          </h1>
          <p className="text-gray-600 capitalize">
            {formatDate(session.date)}
          </p>
        </div>

        <WorkoutSessionForm
          session={session}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </main>

      {/* Menu de navigation */}
      <NavigationMenu
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        currentModule="tracker"
      />
    </div>
  );
}
