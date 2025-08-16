'use client';

import { useRouter } from 'next/navigation';
import { useWorkoutSessions } from '@/hooks/tracker/useWorkoutSessions';
import { WorkoutSessionForm } from '@/components/tracker/WorkoutSessionForm';
import { WorkoutSessionFormData } from '@/types/workout-session';
import { NavigationMenu } from '@/components/NavigationMenu';
import { Activity, LogOut, User } from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';
import { useState } from 'react';

export default function NewWorkoutSessionPage() {
  const router = useRouter();
  const { user, signOut } = useAuthContext();
  const { addSession } = useWorkoutSessions();
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  const handleSubmit = async (formData: WorkoutSessionFormData) => {
    const newSession = await addSession(formData);
    if (newSession) {
      router.push(`/tracker/session/${newSession.id}`);
    }
  };

  const handleCancel = () => {
    router.push('/tracker');
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
                <h1 className="ml-3 text-xl font-semibold text-gray-900">Tracker</h1>
              </button>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">Nouvelle séance</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/tracker')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Retour
              </button>

              {/* Menu utilisateur */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <User size={20} />
                  <span className="hidden sm:block">
                    {user?.user_metadata?.name || user?.email || 'Utilisateur'}
                  </span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.user_metadata?.name || 'Utilisateur'}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nouvelle séance d'entraînement
          </h1>
          <p className="text-gray-600">
            Créez une nouvelle séance en ajoutant vos exercices
          </p>
        </div>

        <WorkoutSessionForm
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
