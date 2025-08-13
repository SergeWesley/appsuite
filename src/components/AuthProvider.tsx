'use client';

import { createContext, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { TimerProvider } from './TimerProvider';
import { BookOpen } from 'lucide-react';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  useEffect(() => {

    // Si on est sur la page d'auth et qu'on est connecté, rediriger vers l'accueil
    if (isAuthenticated && pathname === '/auth') {
      router.push('/');
      return;
    }

    // Si on n'est pas connecté et qu'on n'est pas sur la page d'auth, rediriger vers auth
    if (!loading && !isAuthenticated && pathname !== '/auth') {
      router.push('/auth');
      return;
    }
  }, [isAuthenticated, loading, pathname, router]);

  const value = {
    isAuthenticated,
    loading,
    user,
    signOut,
  };

  // Écran de chargement pendant la vérification de l'authentification
  if (loading ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      <TimerProvider>
        {children}
      </TimerProvider>
    </AuthContext.Provider>
  );
}
