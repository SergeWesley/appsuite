import { tool } from "ai";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";

export const deleteNoteFolderTool = (supabase: SupabaseClient, userId: string) => tool({
  description:
    "Supprimer un dossier de notes par son nom. Demande confirmation avant de supprimer.",
  parameters: z.object({
    name: z.string().describe("Le nom exact du dossier à supprimer"),
    confirmed: z
      .boolean()
      .describe(
        "true si l'utilisateur a explicitement confirmé la suppression, false sinon",
      ),
  }),
  execute: async ({ name, confirmed }) => {
    if (!userId)
      return { success: false, error: "Utilisateur non authentifié" };

    if (!confirmed) {
      return {
        success: false,
        needsConfirmation: true,
        message: `Êtes-vous sûr de vouloir supprimer le dossier "${name}" ? Cette action supprimera aussi toutes les notes qu'il contient. Répondez "oui" pour confirmer.`,
      };
    }

    // Chercher les dossiers correspondant au nom
    const { data: folders, error: fetchError } = await supabase
      .from("note_folders")
      .select("id, name")
      .eq("user_id", userId)
      .ilike("name", name);

    if (fetchError) return { success: false, error: fetchError.message };

    if (!folders || folders.length === 0) {
      return {
        success: false,
        error: `Aucun dossier nommé "${name}" trouvé.`,
      };
    }

    if (folders.length > 1) {
      return {
        success: false,
        ambiguous: true,
        message: `Plusieurs dossiers portent le nom "${name}". Précisez lequel supprimer parmi : ${folders.map((f: { id: string; name: string }) => `"${f.name}" (id: ${f.id})`).join(", ")}.`,
      };
    }

    const folderId = folders[0].id;
    const { error: deleteError } = await supabase
      .from("note_folders")
      .delete()
      .eq("id", folderId)
      .eq("user_id", userId);

    if (deleteError) return { success: false, error: deleteError.message };
    return {
      success: true,
      message: `Le dossier "${name}" a été supprimé avec succès.`,
    };
  },
});
