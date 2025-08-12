'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReadingSession, ReadingSessionFormData, BookReadingStats } from '@/types/reading-session';

// Fonction pour générer un ID unique
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'session-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

export function useReadingSessions() {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<Map<string, ReadingSession>>(new Map());
  const [loading, setLoading] = useState(true);

  // Charger les sessions depuis localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('reading-sessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
        }));
        
        // Vérifier les sessions actives et nettoyer les sessions trop anciennes (plus de 24h)
        const now = new Date();
        const validSessions = parsedSessions.map((session: ReadingSession) => {
          if (session.isActive) {
            const hoursSinceStart = (now.getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
            // Si la session est active depuis plus de 24h, la marquer comme terminée automatiquement
            if (hoursSinceStart > 24) {
              return {
                ...session,
                isActive: false,
                endTime: new Date(session.startTime.getTime() + (24 * 60 * 60 * 1000)), // 24h après le début
                duration: 24 * 60 * 60, // 24 heures en secondes
              };
            }
          }
          return session;
        });
        
        setSessions(validSessions);
        
        // Charger les sessions actives valides
        const activeSessionsMap = new Map<string, ReadingSession>();
        validSessions.forEach((session: ReadingSession) => {
          if (session.isActive) {
            activeSessionsMap.set(session.bookId, session);
          }
        });
        setActiveSessions(activeSessionsMap);
        
        // Sauvegarder les sessions nettoyées si des changements ont été apportés
        if (validSessions.some((session: ReadingSession, index:  number) => 
          session.isActive !== parsedSessions[index]?.isActive ||
          session.endTime !== parsedSessions[index]?.endTime
        )) {
          localStorage.setItem('reading-sessions', JSON.stringify(validSessions));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des sessions:', error);
      }
    }
    setLoading(false);
  }, []);

  // Sauvegarder les sessions dans localStorage
  const saveSessions = useCallback((newSessions: ReadingSession[]) => {
    localStorage.setItem('reading-sessions', JSON.stringify(newSessions));
    setSessions(newSessions);
  }, []);

  // Démarrer une session de lecture
  const startSession = useCallback((bookId: string): ReadingSession => {
    // Arrêter toute session active existante pour ce livre
    const existingSession = activeSessions.get(bookId);
    if (existingSession) {
      stopSession(bookId);
    }

    const newSession: ReadingSession = {
      id: generateId(),
      bookId,
      startTime: new Date(),
      duration: 0,
      isActive: true,
    };

    setSessions(prevSessions => {
      const updatedSessions = [...prevSessions, newSession];
      localStorage.setItem('reading-sessions', JSON.stringify(updatedSessions));
      return updatedSessions;
    });
    
    setActiveSessions(prev => {
      const newMap = new Map(prev);
      newMap.set(bookId, newSession);
      return newMap;
    });
    
    return newSession;
  }, [activeSessions]);

  // Arrêter une session de lecture
  const stopSession = useCallback((bookId: string, sessionData?: ReadingSessionFormData): ReadingSession | null => {
    const activeSession = activeSessions.get(bookId);
    if (!activeSession) {
      return null;
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeSession.startTime.getTime()) / 1000);

    const completedSession: ReadingSession = {
      ...activeSession,
      endTime,
      duration,
      isActive: false,
      notes: sessionData?.notes,
      pagesRead: sessionData?.pagesRead,
    };

    setSessions(prevSessions => {
      const updatedSessions = prevSessions.map(session =>
        session.id === activeSession.id ? completedSession : session
      );
      localStorage.setItem('reading-sessions', JSON.stringify(updatedSessions));
      return updatedSessions;
    });
    
    setActiveSessions(prev => {
      const newMap = new Map(prev);
      newMap.delete(bookId);
      return newMap;
    });

    return completedSession;
  }, [activeSessions]);

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
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prevSessions => {
      const updatedSessions = prevSessions.filter(session => session.id !== sessionId);
      localStorage.setItem('reading-sessions', JSON.stringify(updatedSessions));
      return updatedSessions;
    });
    
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
  }, []);

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
    startSession,
    stopSession,
    getSessionsForBook,
    getBookStats,
    isSessionActive,
    getActiveSession,
    deleteSession,
    formatDuration,
  };
}
