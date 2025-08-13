'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Si Supabase n'est pas configuré, créer un utilisateur fictif pour le mode localStorage
      setUser({
        id: 'local-user',
        email: 'local@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
      } as User);
      setLoading(false);
      return;
    }

    // Obtenir la session initiale
    supabase!.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Connexion anonyme pour commencer (peut être remplacé par un vrai système d'auth)
  const signInAnonymously = async () => {
    if (!isSupabaseConfigured) {
      // En mode localStorage, on simule une connexion réussie
      return { user: user, session: null };
    }

    try {
      const { data, error } = await supabase!.auth.signInAnonymously();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion anonyme:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      // En mode localStorage, on ne fait rien
      return;
    }

    try {
      const { error } = await supabase!.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInAnonymously,
    signOut,
  };
}
