'use client';

import { useCallback } from 'react';
import { useBooks } from './useBooks';
import { useReadingSessions } from './useReadingSessions';

/**
 * Hook combiné qui synchronise automatiquement les livres et les sessions de lecture.
 * Quand une session est créée/modifiée, les livres sont automatiquement rafraîchis
 * pour refléter les changements de pages lues et de progrès.
 */
export function useBooksWithSessions() {
  const booksHook = useBooks();
  
  // Callback pour rafraîchir les livres après modification des sessions
  const handleBookDataChanged = useCallback(() => {
    // Rafraîchir les livres pour récupérer les mises à jour du trigger SQL
    booksHook.refreshBooks();
  }, [booksHook.refreshBooks]);
  
  // Hook des sessions avec callback de synchronisation
  const sessionsHook = useReadingSessions(handleBookDataChanged);
  
  return {
    // Données des livres
    books: booksHook.books,
    booksLoading: booksHook.loading,
    booksError: booksHook.error,
    
    // Actions sur les livres
    addBook: booksHook.addBook,
    updateBook: booksHook.updateBook,
    deleteBook: booksHook.deleteBook,
    getBooksByStatus: booksHook.getBooksByStatus,
    getStats: booksHook.getStats,
    refreshBooks: booksHook.refreshBooks,
    
    // Données des sessions
    sessions: sessionsHook.sessions,
    activeSessions: sessionsHook.activeSessions,
    sessionsLoading: sessionsHook.loading,
    sessionsError: sessionsHook.error,
    
    // Actions sur les sessions
    startSession: sessionsHook.startSession,
    stopSession: sessionsHook.stopSession,
    getSessionsForBook: sessionsHook.getSessionsForBook,
    getBookStats: sessionsHook.getBookStats,
    isSessionActive: sessionsHook.isSessionActive,
    getActiveSession: sessionsHook.getActiveSession,
    deleteSession: sessionsHook.deleteSession,
    formatDuration: sessionsHook.formatDuration,
    refreshSessions: sessionsHook.refreshSessions,
    
    // État de chargement combiné
    loading: booksHook.loading || sessionsHook.loading,
    error: booksHook.error || sessionsHook.error,
  };
}
