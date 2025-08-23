'use client';

import { useCallback, useRef, useEffect } from 'react';

interface UserConnectionEventData {
  userId: string;
  email: string;
  sessionId?: string;
}

interface UserConnectionEventRequest {
  userId: string;
  email: string;
  eventType: 'connection' | 'disconnection';
  sessionId: string;
  userAgent?: string;
}

export function useKafka() {
  const sessionIdRef = useRef<string>();

  // Générer un ID de session unique au chargement du hook
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }, []);

  // Fonction utilitaire pour envoyer un événement via l'API
  const sendEventToAPI = useCallback(async (eventType: 'connection' | 'disconnection', userData: UserConnectionEventData) => {
    try {
      const sessionId = userData.sessionId || sessionIdRef.current || 'unknown';

      const eventData: UserConnectionEventRequest = {
        userId: userData.userId,
        email: userData.email,
        eventType,
        sessionId,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      };

      const response = await fetch('/api/events/user-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(`Erreur API: ${response.status} - ${errorData.error || 'Erreur inconnue'}`);
      }

      const result = await response.json();
      console.log(`Événement ${eventType} envoyé avec succès:`, result);

      return result;
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'événement ${eventType}:`, error);
      // Ne pas faire échouer le processus d'authentification/déconnexion
      throw error;
    }
  }, []);

  // Fonction pour envoyer un événement de connexion
  const sendConnectionEvent = useCallback(async (userData: UserConnectionEventData) => {
    try {
      await sendEventToAPI('connection', userData);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'événement de connexion:', error);
      // Ne pas faire échouer le processus d'authentification
    }
  }, [sendEventToAPI]);

  // Fonction pour envoyer un événement de déconnexion
  const sendDisconnectionEvent = useCallback(async (userData: UserConnectionEventData) => {
    try {
      await sendEventToAPI('disconnection', userData);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'événement de déconnexion:', error);
      // Ne pas faire échouer le processus de déconnexion
    }
  }, [sendEventToAPI]);

  // Fonction pour obtenir l'ID de session actuel
  const getCurrentSessionId = useCallback(() => {
    return sessionIdRef.current;
  }, []);

  // Fonction pour vérifier le statut de Kafka via l'API
  const checkKafkaStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/events/user-connection', {
        method: 'GET',
      });

      const status = await response.json();
      return status;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut Kafka:', error);
      return { status: 'error', error: (error as Error).message };
    }
  }, []);

  return {
    sendConnectionEvent,
    sendDisconnectionEvent,
    getCurrentSessionId,
    checkKafkaStatus,
  };
}
