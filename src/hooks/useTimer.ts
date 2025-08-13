'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';

interface ActiveTimer {
  sessionId: string;
  bookId: string;
  startTime: Date;
  currentDuration: number;
}

interface TimerHookReturn {
  // État des timers
  activeTimers: Map<string, ActiveTimer>;
  isTimerActive: (bookId: string) => boolean;
  getTimerDuration: (bookId: string) => number;
  getFormattedTime: (bookId: string) => string;

  // Actions
  startTimer: (bookId: string) => Promise<string | null>;
  stopTimer: (bookId: string, notes?: string, pagesRead?: number) => Promise<boolean>;

  // État de chargement
  loading: boolean;
  error: string | null;
}

export function useTimer(onBookDataChanged?: () => void): TimerHookReturn {
  const [activeTimers, setActiveTimers] = useState<Map<string, ActiveTimer>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Référence pour l'intervalle de mise à jour
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Charger les sessions actives au démarrage
  const loadActiveSessions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Appeler la fonction Supabase pour obtenir les sessions actives
      const { data, error } = await supabase.rpc('get_user_active_sessions', {
        p_user_id: user.id
      });

      if (error) throw error;

      const timersMap = new Map<string, ActiveTimer>();
      
      if (data) {
        data.forEach((session: any) => {
          timersMap.set(session.book_id, {
            sessionId: session.session_id,
            bookId: session.book_id,
            startTime: new Date(session.start_time),
            currentDuration: session.current_duration
          });
        });
      }

      setActiveTimers(timersMap);
    } catch (err) {
      console.error('Erreur lors du chargement des sessions actives:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mettre à jour les durées des timers actifs
  const updateTimerDurations = useCallback(() => {
    setActiveTimers(prev => {
      const newMap = new Map(prev);
      const now = new Date();
      
      for (const [bookId, timer] of newMap) {
        const newDuration = Math.floor((now.getTime() - timer.startTime.getTime()) / 1000);
        newMap.set(bookId, {
          ...timer,
          currentDuration: newDuration
        });
      }
      
      return newMap;
    });
  }, []);

  // Effet pour charger les sessions au démarrage
  useEffect(() => {
    if (user) {
      loadActiveSessions();
    } else {
      setLoading(false);
    }
  }, [user, loadActiveSessions]);

  // Effet pour démarrer/arrêter l'intervalle de mise à jour
  useEffect(() => {
    if (activeTimers.size > 0) {
      // Démarrer l'intervalle pour mettre �� jour toutes les secondes
      intervalRef.current = setInterval(updateTimerDurations, 1000);
    } else {
      // Arrêter l'intervalle s'il n'y a pas de timers actifs
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeTimers.size, updateTimerDurations]);

  // Démarrer un timer
  const startTimer = useCallback(async (bookId: string): Promise<string | null> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    try {
      setError(null);
      
      // Appeler la fonction Supabase pour démarrer la session
      const { data, error } = await supabase.rpc('start_reading_session', {
        p_book_id: bookId,
        p_user_id: user.id
      });

      if (error) throw error;

      const sessionId = data;
      const startTime = new Date();

      // Ajouter le timer aux timers actifs
      setActiveTimers(prev => {
        const newMap = new Map(prev);
        newMap.set(bookId, {
          sessionId,
          bookId,
          startTime,
          currentDuration: 0
        });
        return newMap;
      });

      return sessionId;
    } catch (err) {
      console.error('Erreur lors du démarrage du timer:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  }, [user]);

  // Arrêter un timer
  const stopTimer = useCallback(async (
    bookId: string, 
    notes?: string, 
    pagesRead?: number
  ): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    const timer = activeTimers.get(bookId);
    if (!timer) {
      return false;
    }

    try {
      setError(null);

      // Appeler la fonction Supabase pour arrêter la session
      const { data, error } = await supabase.rpc('stop_reading_session', {
        p_session_id: timer.sessionId,
        p_user_id: user.id,
        p_notes: notes || null,
        p_pages_read: pagesRead || null
      });

      if (error) throw error;

      if (data) {
        // Retirer le timer des timers actifs
        setActiveTimers(prev => {
          const newMap = new Map(prev);
          newMap.delete(bookId);
          return newMap;
        });
        return true;
      }

      return false;
    } catch (err) {
      console.error('Erreur lors de l\'arrêt du timer:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  }, [user, activeTimers]);

  // Vérifier si un timer est actif pour un livre
  const isTimerActive = useCallback((bookId: string): boolean => {
    return activeTimers.has(bookId);
  }, [activeTimers]);

  // Obtenir la durée actuelle d'un timer
  const getTimerDuration = useCallback((bookId: string): number => {
    const timer = activeTimers.get(bookId);
    return timer ? timer.currentDuration : 0;
  }, [activeTimers]);

  // Formater le temps en format HH:MM:SS
  const getFormattedTime = useCallback((bookId: string): string => {
    const duration = getTimerDuration(bookId);
    
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    // Format HH:MM:SS
    return [hours, minutes, seconds]
      .map(val => val.toString().padStart(2, '0'))
      .join(':');
  }, [getTimerDuration]);

  return {
    activeTimers,
    isTimerActive,
    getTimerDuration,
    getFormattedTime,
    startTimer,
    stopTimer,
    loading,
    error,
  };
}
