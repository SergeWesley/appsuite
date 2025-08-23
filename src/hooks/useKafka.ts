'use client';

import { useCallback, useRef, useEffect } from 'react';
import { kafkaService } from '@/lib/kafka';

interface UserConnectionEventData {
  userId: string;
  email: string;
  sessionId?: string;
}

export function useKafka() {
  const sessionIdRef = useRef<string>();

  // Générer un ID de session unique au chargement du hook
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }, []);

  // Fonction pour envoyer un événement de connexion
  const sendConnectionEvent = useCallback(async (userData: UserConnectionEventData) => {
    try {
      const sessionId = userData.sessionId || sessionIdRef.current || 'unknown';
      
      const event = kafkaService.createConnectionEvent(
        userData.userId,
        userData.email,
        sessionId
      );

      await kafkaService.sendUserConnectionEvent(event);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'événement de connexion:', error);
      // Ne pas faire échouer le processus d'authentification
    }
  }, []);

  // Fonction pour envoyer un événement de déconnexion
  const sendDisconnectionEvent = useCallback(async (userData: UserConnectionEventData) => {
    try {
      const sessionId = userData.sessionId || sessionIdRef.current || 'unknown';
      
      const event = kafkaService.createDisconnectionEvent(
        userData.userId,
        userData.email,
        sessionId
      );

      await kafkaService.sendUserConnectionEvent(event);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'événement de déconnexion:', error);
      // Ne pas faire échouer le processus de déconnexion
    }
  }, []);

  // Fonction pour obtenir l'ID de session actuel
  const getCurrentSessionId = useCallback(() => {
    return sessionIdRef.current;
  }, []);

  // Initialiser la connexion Kafka (tentative en arrière-plan)
  useEffect(() => {
    const initKafka = async () => {
      try {
        await kafkaService.connect();
      } catch (error) {
        console.warn('Impossible de se connecter à Kafka au démarrage:', error);
        // L'application continue de fonctionner même si Kafka n'est pas disponible
      }
    };

    // Initialiser seulement côté client
    if (typeof window !== 'undefined') {
      initKafka();
    }

    // Nettoyage lors du démontage du composant
    return () => {
      if (typeof window !== 'undefined') {
        kafkaService.disconnect().catch(console.error);
      }
    };
  }, []);

  return {
    sendConnectionEvent,
    sendDisconnectionEvent,
    getCurrentSessionId,
  };
}
