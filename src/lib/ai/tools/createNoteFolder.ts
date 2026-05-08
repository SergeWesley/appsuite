import { tool } from "ai";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";

export const createNoteFolderTool = (supabase: SupabaseClient, userId: string) => tool({
  description: "Créer un nouveau dossier de notes",
  parameters: z.object({
    name: z.string().describe("Le nom du dossier"),
    color: z
      .string()
      .optional()
      .describe("La couleur du dossier au format hexa (ex: #f59e0b)"),
    parentId: z
      .string()
      .optional()
      .describe("L'ID du dossier parent si applicable"),
  }),
  execute: async ({ name, color, parentId }) => {
    if (!userId)
      return { success: false, error: "Utilisateur non authentifié" };

    const { data, error } = await supabase
      .from("note_folders")
      .insert({
        name,
        color: color || "#f59e0b",
        user_id: userId,
        parent_id: parentId || null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      folder: data,
      message: `Le dossier "${name}" a été créé avec succès.`,
    };
  },
});
