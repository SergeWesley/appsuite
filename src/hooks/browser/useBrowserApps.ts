"use client";

import { useState, useEffect } from "react";
import { BrowserApp, BrowserAppFormData, BrowserAppConfig } from "@/types/browser";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useBrowserApps() {
  const [apps, setApps] = useState<BrowserApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadApps = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from("browser_apps")
        .select("*")
        .eq("user_id", user.id)
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Mapping des données avec typage de JSONB (settings)
      const mappedApps: BrowserApp[] = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        url: row.url,
        icon_url: row.icon_url,
        order_index: row.order_index ?? 0,
        settings: (row.settings || {}) as BrowserAppConfig,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      setApps(mappedApps);
    } catch (err) {
      console.error("Erreur lors du chargement des apps browser:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadApps();
    } else {
      setLoading(false);
      setApps([]);
    }
  }, [user]);

  const addApp = async (formData: BrowserAppFormData): Promise<BrowserApp | null> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return null;
    }

    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from("browser_apps")
        .insert({
          user_id: user.id,
          name: formData.name,
          url: formData.url,
          icon_url: formData.icon_url,
          order_index: formData.order_index || 0,
          settings: formData.settings as any,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newApp: BrowserApp = {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        url: data.url,
        icon_url: data.icon_url,
        order_index: data.order_index ?? 0,
        settings: (data.settings || {}) as BrowserAppConfig,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setApps((prev) => [...prev, newApp]);
      return newApp;
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'app:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return null;
    }
  };

  const updateApp = async (id: string, updates: Partial<BrowserAppFormData>): Promise<boolean> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }

    try {
      setError(null);

      const updateData: any = { ...updates };
      
      const { error: updateError } = await supabase
        .from("browser_apps")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setApps((prev) =>
        prev.map((app) =>
          app.id === id ? ({ ...app, ...updates, updated_at: new Date().toISOString() } as BrowserApp) : app
        )
      );

      return true;
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'app:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    }
  };

  const deleteApp = async (id: string): Promise<boolean> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from("browser_apps")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      setApps((prev) => prev.filter((app) => app.id !== id));
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression de l'app:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    }
  };
  const reorderApp = async (id: string, direction: "up" | "down"): Promise<boolean> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }

    try {
      setError(null);

      const currentIndex = apps.findIndex((a) => a.id === id);
      if (currentIndex === -1) return false;

      const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (swapIndex < 0 || swapIndex >= apps.length) return false;

      const currentApp = apps[currentIndex];
      const swapApp = apps[swapIndex];

      // Échanger les order_index
      const currentOrder = currentApp.order_index;
      const swapOrder = swapApp.order_index;

      // Si les deux ont le même order_index, on utilise les positions dans le tableau
      const newCurrentOrder = swapOrder === currentOrder ? swapIndex : swapOrder;
      const newSwapOrder = swapOrder === currentOrder ? currentIndex : currentOrder;

      const { error: err1 } = await supabase
        .from("browser_apps")
        .update({ order_index: newCurrentOrder })
        .eq("id", currentApp.id)
        .eq("user_id", user.id);

      if (err1) throw err1;

      const { error: err2 } = await supabase
        .from("browser_apps")
        .update({ order_index: newSwapOrder })
        .eq("id", swapApp.id)
        .eq("user_id", user.id);

      if (err2) throw err2;

      // Mise à jour locale : on swap les deux éléments
      setApps((prev) => {
        const newApps = [...prev];
        newApps[currentIndex] = { ...swapApp, order_index: newSwapOrder };
        newApps[swapIndex] = { ...currentApp, order_index: newCurrentOrder };
        return newApps;
      });

      return true;
    } catch (err) {
      console.error("Erreur lors du réordonnancement:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    }
  };

  return {
    apps,
    loading,
    error,
    addApp,
    updateApp,
    deleteApp,
    reorderApp,
    refreshApps: loadApps,
  };
}
