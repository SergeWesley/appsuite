"use client";

import { useState, useEffect } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useKafka } from "./useKafka";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sendConnectionEvent, sendDisconnectionEvent } = useKafka();

  useEffect(() => {
    // Obtenir la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;

      setUser(newUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Connexion avec email/password
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(getErrorMessage(error));
        throw error;
      }

      if (data.user) {
        // Envoi Kafka uniquement après une vraie connexion
        await sendConnectionEvent({
          userId: data.user.id,
          email: data.user.email || 'unknown@example.com',
        });
      }

      return data;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Inscription avec email/password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        setError(getErrorMessage(error));
        throw error;
      }

      if (data.user) {
        await sendConnectionEvent({
          userId: data.user.id,
          email: data.user.email || 'unknown@example.com',
        });
      }

      return data;
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      setError(null);

      // Envoyer l'événement de déconnexion avant de se déconnecter
      if (user) {
        await sendDisconnectionEvent({
          userId: user.id,
          email: user.email || 'unknown@example.com',
        });
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setError("Erreur lors de la déconnexion");
      throw error;
    }
  };

  // Réinitialisation du mot de passe
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setError(getErrorMessage(error));
        throw error;
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      throw error;
    }
  };

  // Helper pour traduire les erreurs
  const getErrorMessage = (error: AuthError): string => {
    switch (error.message) {
      case "Invalid login credentials":
        return "Email ou mot de passe incorrect";
      case "User already registered":
        return "Un compte existe déjà avec cet email";
      case "Email not confirmed":
        return "Veuillez confirmer votre email avant de vous connecter";
      case "Password should be at least 6 characters":
        return "Le mot de passe doit contenir au moins 6 caractères";
      case "Unable to validate email address: invalid format":
        return "Format d'email invalide";
      case "Signup is disabled":
        return "Les inscriptions sont actuellement désactivées";
      default:
        return error.message || "Une erreur inattendue s'est produite";
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  };
}
