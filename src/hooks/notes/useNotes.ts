"use client";

import { useState, useEffect } from "react";
import { Note, NoteFormData } from "@/types/notes";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useNotes(folderId?: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadNotes = async () => {
    if (!user || !folderId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("folder_id", folderId)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const mapped: Note[] = (data || []).map((row: any) => ({
        id: row.id,
        folderId: row.folder_id,
        title: row.title,
        content: row.content || "",
        userId: row.user_id,
        metadata: row.metadata || {},
        dateCreated: new Date(row.created_at),
        dateUpdated: new Date(row.updated_at),
      }));

      setNotes(mapped);
    } catch (err) {
      console.error("Erreur lors du chargement des notes:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && folderId) {
      loadNotes();
    } else {
      setLoading(false);
    }
  }, [user, folderId]);

  const addNote = async (
    formData: NoteFormData,
  ): Promise<Note | null> => {
    if (!user || !folderId) {
      setError("Utilisateur non connecté");
      return null;
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from("notes")
        .insert({
          folder_id: folderId,
          title: formData.title,
          content: formData.content,
          metadata: formData.metadata || {},
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newNote: Note = {
        id: data.id,
        folderId: data.folder_id,
        title: data.title,
        content: data.content || "",
        userId: data.user_id,
        metadata: data.metadata || {},
        dateCreated: new Date(data.created_at),
        dateUpdated: new Date(data.updated_at),
      };

      setNotes((prev) => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      console.error("Erreur lors de la création de la note:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return null;
    }
  };

  const updateNote = async (
    id: string,
    updates: Partial<NoteFormData>,
  ): Promise<boolean> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }

    try {
      setError(null);

      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

      const { error } = await supabase
        .from("notes")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? { ...note, ...updates, dateUpdated: new Date() }
            : note,
        ),
      );

      return true;
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la note:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    }
  };

  const deleteNote = async (id: string): Promise<boolean> => {
    if (!user) {
      setError("Utilisateur non connecté");
      return false;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setNotes((prev) => prev.filter((note) => note.id !== id));
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression de la note:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    }
  };

  const getNoteById = (id: string): Note | undefined => {
    return notes.find((note) => note.id === id);
  };

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    getNoteById,
    refreshNotes: loadNotes,
  };
}
