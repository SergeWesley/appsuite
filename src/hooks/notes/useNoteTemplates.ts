"use client";

import { useState, useEffect } from "react";
import { NoteTemplate, CustomFieldDefinition } from "@/types/notes";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useNoteTemplates(folderId?: string) {
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadTemplates = async () => {
    if (!user || !folderId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase
        .from("note_templates")
        .select("*")
        .eq("folder_id", folderId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const mapped: NoteTemplate[] = (data || []).map((row: any) => ({
        id: row.id,
        folderId: row.folder_id,
        name: row.name,
        fields: row.fields || [],
        userId: row.user_id,
        dateCreated: new Date(row.created_at),
        dateUpdated: new Date(row.updated_at),
      }));

      setTemplates(mapped);
    } catch (err) {
      console.error("Erreur lors du chargement des templates:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && folderId) {
      loadTemplates();
    } else {
      setLoading(false);
    }
  }, [user, folderId]);

  const addTemplate = async (
    name: string,
    fields: CustomFieldDefinition[],
  ): Promise<NoteTemplate | null> => {
    if (!user || !folderId) {
      setError("Utilisateur non connecté");
      return null;
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from("note_templates")
        .insert({
          folder_id: folderId,
          name,
          fields,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newTemplate: NoteTemplate = {
        id: data.id,
        folderId: data.folder_id,
        name: data.name,
        fields: data.fields || [],
        userId: data.user_id,
        dateCreated: new Date(data.created_at),
        dateUpdated: new Date(data.updated_at),
      };

      setTemplates((prev) => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      console.error("Erreur lors de la création du template:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return null;
    }
  };

  const updateTemplate = async (
    id: string,
    updates: { name?: string; fields?: CustomFieldDefinition[] },
  ): Promise<boolean> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }

    try {
      setError(null);

      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.fields !== undefined) updateData.fields = updates.fields;

      const { error } = await supabase
        .from("note_templates")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setTemplates((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...updates, dateUpdated: new Date() } : t,
        ),
      );

      return true;
    } catch (err) {
      console.error("Erreur lors de la mise à jour du template:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from("note_templates")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setTemplates((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression du template:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    }
  };

  const getTemplateById = (id: string): NoteTemplate | undefined => {
    return templates.find((t) => t.id === id);
  };

  return {
    templates,
    loading,
    error,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    refreshTemplates: loadTemplates,
  };
}
