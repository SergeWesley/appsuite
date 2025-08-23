"use client";

import { useState, useEffect, useCallback } from "react";
import {
  WatchingSession,
  WatchingSessionFormData,
} from "@/types/watching-session";
import { Database } from "@/types/supabase";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

type SessionRow = Database["public"]["Tables"]["watching_sessions"]["Row"];
type SessionInsert =
  Database["public"]["Tables"]["watching_sessions"]["Insert"];
type SessionUpdate =
  Database["public"]["Tables"]["watching_sessions"]["Update"];

// Interface pour les statistiques de visionnage d'un média
export interface MediaWatchingStats {
  totalSessions: number;
  totalWatchingTime: number; // en secondes
  averageSessionTime: number; // en secondes
  lastSession?: Date;
}

// Fonction pour convertir les données de la base vers le type WatchingSession
function mapRowToSession(row: SessionRow): WatchingSession {
  return {
    id: row.id,
    mediaId: row.media_id,
    startTime: new Date(row.start_time),
    endTime: row.end_time ? new Date(row.end_time) : undefined,
    duration: row.duration || undefined,
    notes: row.notes || undefined,
    episodeWatched: row.episode_watched || undefined,
    seasonWatched: row.season_watched || undefined,
    isActive: row.is_active,
    userId: row.user_id,
  };
}

export function useWatchingSessions(onMediaDataChanged?: () => void) {
  const [sessions, setSessions] = useState<WatchingSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<
    Map<string, WatchingSession>
  >(new Map());
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
        .from("watching_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: false });

      if (error) throw error;

      const mappedSessions = data.map(mapRowToSession);

      // Nettoyer les sessions actives trop anciennes (plus de 24h)
      const now = new Date();
      const cleanedSessions = await Promise.all(
        mappedSessions.map(async (session) => {
          if (session.isActive) {
            const hoursSinceStart =
              (now.getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
            if (hoursSinceStart > 24) {
              // Marquer comme terminée automatiquement
              const endTime = new Date(
                session.startTime.getTime() + 24 * 60 * 60 * 1000,
              );
              const duration = 24 * 60 * 60;

              const { data: updatedData, error: updateError } = await supabase
                .from("watching_sessions")
                .update({
                  is_active: false,
                  end_time: endTime.toISOString(),
                  duration: duration,
                })
                .eq("id", session.id)
                .eq("user_id", user.id)
                .select()
                .single();

              if (updateError) {
                console.error(
                  "Erreur lors de la mise à jour de la session:",
                  updateError,
                );
                return session;
              }

              return mapRowToSession(updatedData);
            }
          }
          return session;
        }),
      );

      setSessions(cleanedSessions);

      // Construire la map des sessions actives
      const activeSessionsMap = new Map<string, WatchingSession>();
      cleanedSessions.forEach((session) => {
        if (session.isActive) {
          activeSessionsMap.set(session.mediaId, session);
        }
      });
      setActiveSessions(activeSessionsMap);
    } catch (err) {
      console.error("Erreur lors du chargement des sessions:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
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

  // Démarrer une session de visionnage
  const startSession = useCallback(
    async (
      mediaId: string,
      episodeWatched?: number,
      seasonWatched?: number,
    ): Promise<WatchingSession | null> => {
      if (!user) {
        setError("Utilisateur non connecté");
        return null;
      }

      try {
        setError(null);

        // Arrêter d'abord toute session active existante pour cet utilisateur
        await supabase
          .from("watching_sessions")
          .update({
            is_active: false,
            end_time: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("is_active", true);

        // Créer une nouvelle session
        const sessionData: SessionInsert = {
          media_id: mediaId,
          user_id: user.id,
          start_time: new Date().toISOString(),
          is_active: true,
          episode_watched: episodeWatched || null,
          season_watched: seasonWatched || null,
        };

        const { data, error } = await supabase
          .from("watching_sessions")
          .insert(sessionData)
          .select()
          .single();

        if (error) throw error;

        const newSession = mapRowToSession(data);

        setSessions((prev) => {
          // Retirer toute session active existante pour ce média
          const filtered = prev.filter(
            (s) => !(s.mediaId === mediaId && s.isActive),
          );
          return [newSession, ...filtered];
        });

        setActiveSessions((prev) => {
          const newMap = new Map(prev);
          // Effacer toutes les sessions actives et ajouter la nouvelle
          newMap.clear();
          newMap.set(mediaId, newSession);
          return newMap;
        });

        // Déclencher le rafraîchissement des médias après la modification
        if (onMediaDataChanged) {
          onMediaDataChanged();
        }

        return newSession;
      } catch (err) {
        console.error("Erreur lors du démarrage de la session:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        return null;
      }
    },
    [user, onMediaDataChanged],
  );

  // Arrêter une session de visionnage
  const stopSession = useCallback(
    async (
      mediaId: string,
      sessionData?: Partial<WatchingSessionFormData>,
    ): Promise<WatchingSession | null> => {
      if (!user) {
        setError("Utilisateur non connecté");
        return null;
      }

      const activeSession = activeSessions.get(mediaId);
      if (!activeSession) {
        return null;
      }

      try {
        setError(null);

        const endTime = new Date();
        const duration = Math.floor(
          (endTime.getTime() - activeSession.startTime.getTime()) / 1000,
        );

        const updateData: SessionUpdate = {
          is_active: false,
          end_time: endTime.toISOString(),
          duration: duration,
          notes: sessionData?.notes || null,
          episode_watched:
            sessionData?.episodeWatched || activeSession.episodeWatched || null,
          season_watched:
            sessionData?.seasonWatched || activeSession.seasonWatched || null,
        };

        const { data, error } = await supabase
          .from("watching_sessions")
          .update(updateData)
          .eq("id", activeSession.id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;

        const updatedSession = mapRowToSession(data);

        setSessions((prev) =>
          prev.map((session) =>
            session.id === activeSession.id ? updatedSession : session,
          ),
        );

        setActiveSessions((prev) => {
          const newMap = new Map(prev);
          newMap.delete(mediaId);
          return newMap;
        });

        // Déclencher le rafraîchissement des médias après la modification
        if (onMediaDataChanged) {
          onMediaDataChanged();
        }

        return updatedSession;
      } catch (err) {
        console.error("Erreur lors de l'arrêt de la session:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        return null;
      }
    },
    [activeSessions, user, onMediaDataChanged],
  );

  // Obtenir les sessions pour un média
  const getSessionsForMedia = useCallback(
    (mediaId: string): WatchingSession[] => {
      return sessions.filter((session) => session.mediaId === mediaId);
    },
    [sessions],
  );

  // Obtenir les statistiques de visionnage pour un média
  const getMediaStats = useCallback(
    (mediaId: string): MediaWatchingStats => {
      const mediaSessions = getSessionsForMedia(mediaId);
      const completedSessions = mediaSessions.filter(
        (session) => !session.isActive,
      );

      const totalSessions = completedSessions.length;
      const totalWatchingTime = completedSessions.reduce(
        (acc, session) => acc + (session.duration || 0),
        0,
      );
      const averageSessionTime =
        totalSessions > 0 ? totalWatchingTime / totalSessions : 0;
      const lastSession =
        completedSessions.length > 0
          ? completedSessions.sort(
              (a, b) => b.startTime.getTime() - a.startTime.getTime(),
            )[0].startTime
          : undefined;

      return {
        totalSessions,
        totalWatchingTime,
        averageSessionTime,
        lastSession,
      };
    },
    [getSessionsForMedia],
  );

  // Vérifier si une session est active pour un média
  const isSessionActive = useCallback(
    (mediaId: string): boolean => {
      return activeSessions.has(mediaId);
    },
    [activeSessions],
  );

  // Obtenir la session active pour un média
  const getActiveSession = useCallback(
    (mediaId: string): WatchingSession | undefined => {
      return activeSessions.get(mediaId);
    },
    [activeSessions],
  );

  // Supprimer une session
  const deleteSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      if (!user) {
        setError("Utilisateur non connecté");
        return false;
      }

      try {
        setError(null);
        const { error } = await supabase
          .from("watching_sessions")
          .delete()
          .eq("id", sessionId)
          .eq("user_id", user.id);

        if (error) throw error;

        setSessions((prev) =>
          prev.filter((session) => session.id !== sessionId),
        );

        // Supprimer des sessions actives si nécessaire
        setActiveSessions((prev) => {
          const newMap = new Map(prev);
          for (const [mediaId, session] of prev) {
            if (session.id === sessionId) {
              newMap.delete(mediaId);
              break;
            }
          }
          return newMap;
        });

        // Déclencher le rafraîchissement des médias après la suppression
        if (onMediaDataChanged) {
          onMediaDataChanged();
        }

        return true;
      } catch (err) {
        console.error("Erreur lors de la suppression de la session:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        return false;
      }
    },
    [user, onMediaDataChanged],
  );

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

  // Obtenir le temps actuel d'une session active
  const getCurrentSessionTime = useCallback(
    (mediaId: string): number => {
      const activeSession = activeSessions.get(mediaId);
      if (!activeSession) return 0;

      return Math.floor(
        (Date.now() - activeSession.startTime.getTime()) / 1000,
      );
    },
    [activeSessions],
  );

  // Obtenir le temps formaté d'une session active
  const getFormattedCurrentTime = useCallback(
    (mediaId: string): string => {
      const currentTime = getCurrentSessionTime(mediaId);
      return formatDuration(currentTime);
    },
    [getCurrentSessionTime, formatDuration],
  );

  return {
    sessions,
    activeSessions: Array.from(activeSessions.values()),
    loading,
    error,
    startSession,
    stopSession,
    getSessionsForMedia,
    getMediaStats,
    isSessionActive,
    getActiveSession,
    deleteSession,
    formatDuration,
    getCurrentSessionTime,
    getFormattedCurrentTime,
    refreshSessions: loadSessions,
  };
}
