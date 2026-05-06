"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Retourne true si l'utilisateur connecté a le rôle "admin".
 *
 * Le rôle est lu depuis :
 *  1. `app_metadata.role` — défini côté Supabase Auth Dashboard ou via l'API admin
 *     (non modifiable par l'utilisateur lui-même → recommandé pour la sécurité)
 *  2. `user_metadata.role` — défini lors de l'inscription ou mis à jour par l'utilisateur
 *     (fallback, moins sécurisé)
 *
 * Pour promouvoir un utilisateur admin dans Supabase :
 *   Dashboard → Authentication → Users → [user] → Edit → app_metadata: { "role": "admin" }
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return false;
    const role =
      (user.app_metadata?.role as string | undefined) ||
      (user.user_metadata?.role as string | undefined);
    return role === "admin";
  }, [user]);
}
