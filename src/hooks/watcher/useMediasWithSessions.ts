"use client";

import { useCallback } from "react";
import { useMedias } from "./useMedias";
import { useWatchingSessions } from "./useWatchingSessions";

/**
 * Hook combiné qui synchronise automatiquement les médias et les sessions de visionnage.
 * Quand une session est créée/modifiée, les médias sont automatiquement rafraîchis
 * pour refléter les changements de progression et de statut.
 */
export function useMediasWithSessions() {
  const mediasHook = useMedias();

  // Callback pour rafraîchir les médias après modification des sessions
  const handleMediaDataChanged = useCallback(() => {
    console.log(
      "🔄 Hook combiné: Données de session modifiées, rafraîchissement des médias...",
    );
    // Rafraîchir les médias pour récupérer les mises à jour du trigger SQL
    mediasHook.refreshMedias();
  }, [mediasHook.refreshMedias]);

  // Hook des sessions avec callback de synchronisation
  const sessionsHook = useWatchingSessions(handleMediaDataChanged);

  return {
    // Données des médias
    medias: mediasHook.medias,
    mediasLoading: mediasHook.loading,
    mediasError: mediasHook.error,

    // Actions sur les médias
    addMedia: mediasHook.addMedia,
    updateMedia: mediasHook.updateMedia,
    deleteMedia: mediasHook.deleteMedia,
    getMediasByStatus: mediasHook.getMediasByStatus,
    getMediasByType: mediasHook.getMediasByType,
    getStats: mediasHook.getStats,
    refreshMedias: mediasHook.refreshMedias,

    // Données des sessions
    sessions: sessionsHook.sessions,
    activeSessions: sessionsHook.activeSessions,
    sessionsLoading: sessionsHook.loading,
    sessionsError: sessionsHook.error,

    // Actions sur les sessions
    startSession: sessionsHook.startSession,
    stopSession: sessionsHook.stopSession,
    getSessionsForMedia: sessionsHook.getSessionsForMedia,
    getMediaStats: sessionsHook.getMediaStats,
    isSessionActive: sessionsHook.isSessionActive,
    getActiveSession: sessionsHook.getActiveSession,
    deleteSession: sessionsHook.deleteSession,
    formatDuration: sessionsHook.formatDuration,
    getCurrentSessionTime: sessionsHook.getCurrentSessionTime,
    getFormattedCurrentTime: sessionsHook.getFormattedCurrentTime,
    refreshSessions: sessionsHook.refreshSessions,

    // État de chargement combiné
    loading: mediasHook.loading || sessionsHook.loading,
    error: mediasHook.error || sessionsHook.error,
  };
}
