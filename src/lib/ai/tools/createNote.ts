import { tool } from "ai";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";

export const createNoteTool = (supabase: SupabaseClient, userId: string) => tool({
  description: "Créer une nouvelle note dans un dossier",
  parameters: z.object({
    title: z.string().describe("Le titre de la note"),
    content: z.string().describe("Le contenu de la note (texte)"),
    folderId: z
      .string()
      .describe(
        "L'ID du dossier dans lequel placer la note. Si l'utilisateur ne précise pas, demander l'ID du dossier ou utiliser un dossier par défaut.",
      ),
  }),
  execute: async ({ title, content, folderId }) => {
    if (!userId)
      return { success: false, error: "Utilisateur non authentifié" };

    // Exemple d'insertion d'une note
    const { data, error } = await supabase
      .from("notes")
      .insert({
        title,
        content,
        folder_id: folderId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      message: `La note "${title}" a été créée avec succès dans le dossier ${folderId}.`,
      note: data,
    };
  },
});
