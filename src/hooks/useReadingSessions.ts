'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReadingSession, ReadingSessionFormData, BookReadingStats } from '@/types/reading-session';
import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

type SessionRow = Database['public']['Tables']['reading_sessions']['Row'];
type SessionInsert = Database['public']['Tables']['reading_sessions']['Insert'];
type SessionUpdate = Database['public']['Tables']['reading_sessions']['Update'];

// Fonction pour convertir les données de la base vers le type ReadingSession
function mapRowToSession(row: SessionRow): ReadingSession {
  return {
    id: row.id,
    bookId: row.book_id,
    startTime: new Date(row.start_time),
    endTime: row.end_time ? new Date(row.end_time) : undefined,
    duration: row.duration,
    notes: row.notes || undefined,
    pagesRead: row.pages_read || undefined,
    isActive: row.is_active,
  };
}

export function useReadingSessions(onBookDataChanged?: () => void) {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<Map<string, ReadingSession>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();


  // Charger les sessions depuis Supabase
  const loadSessions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('reading_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;

      const mappedSessions = data.map(mapRowToSession);

      // Nettoyer les sessions actives trop anciennes (plus de 24h)
      const now = new Date();
      const cleanedSessions = await Promise.all(
        mappedSessions.map(async (session) => {
          if (session.isActive) {
            const hoursSinceStart = (now.getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
            if (hoursSinceStart > 24) {
              // Marquer comme terminée automatiquement
              const endTime = new Date(session.startTime.getTime() + (24 * 60 * 60 * 1000));
              const duration = 24 * 60 * 60;

              const { data: updatedData, error: updateError } = await supabase
                .from('reading_sessions')
                .update({
                  is_active: false,
                  end_time: endTime.toISOString(),
                  duration: duration,
                })
                .eq('id', session.id)
                .eq('user_id', user.id)
                .select()
                .single();

              if (updateError) {
                console.error('Erreur lors de la mise à jour de la session:', updateError);
                return session;
              }

              return mapRowToSession(updatedData);
            }
          }
          return session;
        })
      );

      setSessions(cleanedSessions);

      // Construire la map des sessions actives
      const activeSessionsMap = new Map<string, ReadingSession>();
      cleanedSessions.forEach((session) => {
        if (session.isActive) {
          activeSessionsMap.set(session.bookId, session);
        }
      });
      setActiveSessions(activeSessionsMap);
    } catch (err) {
      console.error('Erreur lors du chargement des sessions:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadSessions();
    } else {
      setLoading(false);
    }
  }, [user]);


  // Démarrer une session de lecture (utilise maintenant la fonction Supabase)
  const startSession = useCallback(async (bookId: string): Promise<ReadingSession | null> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    try {
      setError(null);

      // Utiliser la fonction Supabase qui gère automatiquement les sessions uniques
      const { data: sessionId, error } = await supabase.rpc('start_reading_session', {
        p_book_id: bookId,
        p_user_id: user.id
      });

      if (error) throw error;

      // Récupérer la session créée
      const { data: sessionData, error: fetchError } = await supabase
        .from('reading_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (fetchError) throw fetchError;

      const newSession = mapRowToSession(sessionData);

      setSessions(prev => {
        // Retirer toute session active existante pour ce livre
        const filtered = prev.filter(s => !(s.bookId === bookId && s.isActive));
        return [newSession, ...filtered];
      });

      setActiveSessions(prev => {
        const newMap = new Map(prev);
        newMap.set(bookId, newSession);
        return newMap;
      });

      return newSession;
    } catch (err) {
      console.error('Erreur lors du démarrage de la session:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  }, [user]);

  // Arrêter une session de lecture (utilise maintenant la fonction Supabase)
  const stopSession = useCallback(async (bookId: string, sessionData?: ReadingSessionFormData): Promise<ReadingSession | null> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    const activeSession = activeSessions.get(bookId);
    if (!activeSession) {
      return null;
    }

    try {
      setError(null);

      // Utiliser la fonction Supabase pour arrêter la session
      const { data: success, error } = await supabase.rpc('stop_reading_session', {
        p_session_id: activeSession.id,
        p_user_id: user.id,
        p_notes: sessionData?.notes || null,
        p_pages_read: sessionData?.pagesRead || null
      });

      if (error) throw error;

      if (!success) {
        throw new Error('Impossible d\'arrêter la session');
      }

      // Récupérer la session mise à jour
      const { data: updatedSessionData, error: fetchError } = await supabase
        .from('reading_sessions')
        .select('*')
        .eq('id', activeSession.id)
        .single();

      if (fetchError) throw fetchError;

      const updatedSession = mapRowToSession(updatedSessionData);

      setSessions(prev =>
        prev.map(session =>
          session.id === activeSession.id ? updatedSession : session
        )
      );

      setActiveSessions(prev => {
        const newMap = new Map(prev);
        newMap.delete(bookId);
        return newMap;
      });

      return updatedSession;
    } catch (err) {
      console.error('Erreur lors de l\'arrêt de la session:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  }, [activeSessions, user]);

  // Obtenir les sessions pour un livre
  const getSessionsForBook = useCallback((bookId: string): ReadingSession[] => {
    return sessions.filter(session => session.bookId === bookId);
  }, [sessions]);

  // Obtenir les statistiques de lecture pour un livre
  const getBookStats = useCallback((bookId: string): BookReadingStats => {
    const bookSessions = getSessionsForBook(bookId);
    const completedSessions = bookSessions.filter(session => !session.isActive);
    
    const totalSessions = completedSessions.length;
    const totalReadingTime = completedSessions.reduce((acc, session) => acc + session.duration, 0);
    const averageSessionTime = totalSessions > 0 ? totalReadingTime / totalSessions : 0;
    const totalPagesRead = completedSessions.reduce((acc, session) => acc + (session.pagesRead || 0), 0);
    const lastSession = completedSessions.length > 0 
      ? completedSessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0].startTime
      : undefined;

    return {
      totalSessions,
      totalReadingTime,
      averageSessionTime,
      totalPagesRead,
      lastSession,
    };
  }, [getSessionsForBook]);

  // Vérifier si une session est active pour un livre
  const isSessionActive = useCallback((bookId: string): boolean => {
    return activeSessions.has(bookId);
  }, [activeSessions]);

  // Obtenir la session active pour un livre
  const getActiveSession = useCallback((bookId: string): ReadingSession | undefined => {
    return activeSessions.get(bookId);
  }, [activeSessions]);

  // Supprimer une session
  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      setError(null);
      const { error } = await supabase
        .from('reading_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== sessionId));

      // Supprimer des sessions actives si nécessaire
      setActiveSessions(prev => {
        const newMap = new Map(prev);
        for (const [bookId, session] of prev) {
          if (session.id === sessionId) {
            newMap.delete(bookId);
            break;
          }
        }
        return newMap;
      });

      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de la session:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  }, [user]);

  // Formater la durée en format lisible
  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }, []);

  return {
    sessions,
    activeSessions: Array.from(activeSessions.values()),
    loading,
    error,
    startSession,
    stopSession,
    getSessionsForBook,
    getBookStats,
    isSessionActive,
    getActiveSession,
    deleteSession,
    formatDuration,
    refreshSessions: loadSessions,
  };
}
