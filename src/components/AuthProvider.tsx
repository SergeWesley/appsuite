'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
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
  const { user, loading, signInAnonymously } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  // Fonction pour se connecter automatiquement de manière anonyme
  const signIn = async () => {
    try {
      if (!user) {
        await signInAnonymously();
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
    }
  };

  // Se connecter automatiquement au chargement si pas d'utilisateur
  useEffect(() => {
    if (!loading && !user) {
      signIn();
    }
  }, [loading, user]);

  const value = {
    isAuthenticated,
    loading,
    signIn,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
