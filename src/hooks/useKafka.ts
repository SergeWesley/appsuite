"use client";

import { useCallback } from "react";

interface UserConnectionEventData {
  userId: string;
  email: string;
  sessionId?: string;
}

/**
 * Court-circuit Kafka — toutes les fonctions sont des no-ops silencieux.
 * Pour réactiver, restaurer l'implémentation avec les appels à /api/events/user-connection.
 */
export function useKafka() {
  const sendConnectionEvent = useCallback(
    async (_userData: UserConnectionEventData) => {
      // Kafka désactivé — no-op
    },
    [],
  );

  const sendDisconnectionEvent = useCallback(
    async (_userData: UserConnectionEventData) => {
      // Kafka désactivé — no-op
    },
    [],
  );

  const getCurrentSessionId = useCallback(() => undefined, []);

  const checkKafkaStatus = useCallback(
    async () => ({ status: "disabled", kafka: "bypassed" }),
    [],
  );

  return {
    sendConnectionEvent,
    sendDisconnectionEvent,
    getCurrentSessionId,
    checkKafkaStatus,
  };
}
