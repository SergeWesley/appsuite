import { tool } from "ai";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";

export const getNoteContentTool = (supabase: SupabaseClient, userId: string) => tool({
  description:
    "Récupérer le contenu complet d'une note par son ID, incluant le titre, le texte, les données structurées (metadata), le dossier parent et les champs du template associé. Utiliser cet outil quand le contexte mentionne une note ouverte ou quand l'utilisateur demande d'analyser/résumer une note.",
  parameters: z.object({
    noteId: z
      .string()
      .describe("L'ID de la note à récupérer"),
  }),
  execute: async ({ noteId }) => {
    if (!userId)
      return { success: false, error: "Utilisateur non authentifié" };

    // 1. Récupérer la note
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .eq("user_id", userId)
      .single();

    if (noteError)
      return { success: false, error: noteError.message };
    if (!note)
      return { success: false, error: "Note introuvable." };

    // 2. Récupérer le dossier parent
    const { data: folder } = await supabase
      .from("note_folders")
      .select("id, name, color")
      .eq("id", note.folder_id)
      .single();

    // 3. Récupérer le template si la note en a un
    let templateSchema: Array<{
      id: string;
      name: string;
      type: string;
      columns?: Array<{ id: string; name: string; type: string }>;
    }> = [];
    if (note.template_id) {
      const { data: template } = await supabase
        .from("note_templates")
        .select("name, fields")
        .eq("id", note.template_id)
        .single();

      if (template?.fields && Array.isArray(template.fields)) {
        templateSchema = (template.fields as any[]).map((f: any) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          ...(f.columns && Array.isArray(f.columns)
            ? {
                columns: f.columns.map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  type: c.type,
                })),
              }
            : {}),
        }));
      }
    }

    // 4. Construire un résumé lisible des metadata (données de tableaux, champs remplis, etc.)
    let metadataSummary = "";
    const meta = note.metadata as Record<string, any> | null;
    if (meta && typeof meta === "object" && Object.keys(meta).length > 0) {
      metadataSummary = Object.entries(meta)
        .map(([key, value]) => {
          // Trouver le nom du champ dans le schema pour un affichage plus lisible
          const fieldDef = templateSchema.find((f) => f.id === key);
          const fieldLabel = fieldDef ? `${fieldDef.name} (id: ${key})` : key;

          if (Array.isArray(value)) {
            return `Tableau "${fieldLabel}" : ${value.length} entrée(s) — ${JSON.stringify(value)}`;
          }
          return `${fieldLabel} : ${JSON.stringify(value)}`;
        })
        .join("\n");
    }

    return {
      success: true,
      noteId: note.id,
      title: note.title,
      content: note.content || "(Pas de contenu texte)",
      folderName: folder?.name || "Inconnu",
      templateSchema:
        templateSchema.length > 0
          ? templateSchema
          : "Aucun template — note libre",
      metadata: metadataSummary || "Aucune donnée structurée",
      metadataRaw: meta || {},
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    };
  },
});
