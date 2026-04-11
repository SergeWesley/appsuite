"use client";

import { useState, useEffect } from "react";
import { NoteFolder, NoteFolderFormData, CustomFieldDefinition, NoteExportData } from "@/types/notes";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useNoteFolders() {
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadFolders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase
        .from("note_folders")
        .select("*, notes(count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped: NoteFolder[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        color: row.color || "#f59e0b",
        userId: row.user_id,
        parentId: row.parent_id,
        customFields: row.custom_fields || [],
        noteCount: row.notes?.[0]?.count ?? 0,
        dateCreated: new Date(row.created_at),
        dateUpdated: new Date(row.updated_at),
      }));

      setFolders(mapped);
    } catch (err) {
      console.error("Erreur lors du chargement des dossiers:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadFolders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const addFolder = async (
    formData: NoteFolderFormData,
  ): Promise<NoteFolder | null> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return null;
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from("note_folders")
        .insert({
          name: formData.name,
          color: formData.color,
          user_id: user.id,
          parent_id: formData.parentId || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newFolder: NoteFolder = {
        id: data.id,
        name: data.name,
        color: data.color || "#f59e0b",
        userId: data.user_id,
        parentId: data.parent_id,
        customFields: data.custom_fields || [],
        dateCreated: new Date(data.created_at),
        dateUpdated: new Date(data.updated_at),
      };

      setFolders((prev) => [newFolder, ...prev]);
      return newFolder;
    } catch (err) {
      console.error("Erreur lors de la création du dossier:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return null;
    }
  };

  const updateFolder = async (
    id: string,
    updates: Partial<NoteFolderFormData>,
  ): Promise<boolean> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }

    try {
      setError(null);

      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.color !== undefined) updateData.color = updates.color;

      const { error } = await supabase
        .from("note_folders")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === id
            ? { ...folder, ...updates, dateUpdated: new Date() }
            : folder,
        ),
      );

      return true;
    } catch (err) {
      console.error("Erreur lors de la mise à jour du dossier:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    }
  };

  const updateFolderFields = async (
    id: string,
    customFields: CustomFieldDefinition[]
  ): Promise<boolean> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from("note_folders")
        .update({ custom_fields: customFields })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === id
            ? { ...folder, customFields, dateUpdated: new Date() }
            : folder,
        ),
      );

      return true;
    } catch (err) {
      console.error("Erreur lors de la mise à jour des champs du dossier:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    }
  };

  const deleteFolder = async (id: string): Promise<boolean> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from("note_folders")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setFolders((prev) => prev.filter((folder) => folder.id !== id));
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression du dossier:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    }
  };

  const importNoteData = async (data: NoteExportData, parentId?: string | null): Promise<boolean> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }

    try {
      setError(null);
      
      const newFolder = await addFolder({
        name: data.folder.name + " (Importé)",
        color: data.folder.color || "#f59e0b",
        parentId: parentId || null,
      });
      if (!newFolder) throw new Error("Impossible de créer le dossier.");

      let importedTemplateId: string | null = null;

      // 1. Gérer le template si présent (nouveau système)
      if (data.template) {
        const { data: templateData, error: templateError } = await supabase
          .from("note_templates")
          .insert({
            folder_id: newFolder.id,
            user_id: user.id,
            name: data.template.name,
            fields: data.template.fields,
          })
          .select()
          .single();
        
        if (templateError) throw templateError;
        importedTemplateId = templateData.id;
      } 
      // 2. Fallback sur customFields (legacy)
      else if (data.folder.customFields && data.folder.customFields.length > 0) {
        await updateFolderFields(newFolder.id, data.folder.customFields);
      }

      // 3. Créer la note
      const { error: noteError } = await supabase.from("notes").insert({
        folder_id: newFolder.id,
        user_id: user.id,
        template_id: importedTemplateId,
        title: data.note.title,
        content: data.note.content || "",
        metadata: data.note.metadata || {},
      });

      if (noteError) throw noteError;
      
      return true;
    } catch (err) {
      console.error("Erreur lors de l'import:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    }
  };

  return {
    folders,
    loading,
    error,
    addFolder,
    updateFolder,
    updateFolderFields,
    deleteFolder,
    importNoteData,
    refreshFolders: loadFolders,
  };
}
