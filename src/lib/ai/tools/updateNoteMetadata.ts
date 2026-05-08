import { tool } from "ai";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";

export const updateNoteMetadataTool = (supabase: SupabaseClient, userId: string) => tool({
  description: `Mettre à jour les données structurées (metadata) d'une note. Permet d'ajouter des lignes à un tableau, de modifier un champ texte/nombre/date/etc.
  
  IMPORTANT : Avant d'utiliser cet outil, tu DOIS d'abord appeler getNoteContentTool pour :
  1. Connaître la structure exacte du template (noms et IDs des champs)
  2. Récupérer les données existantes pour ne pas les écraser
  
  Les metadata sont un objet JSON où chaque clé est l'ID d'un champ du template.
  - Pour un champ simple (text, number, date, etc.) : la valeur est directement le contenu
  - Pour un champ de type "table" : la valeur est un tableau d'objets, chaque objet représente une ligne avec les IDs des colonnes comme clés
  
  L'outil fait un MERGE : les champs non mentionnés dans metadataUpdates restent inchangés.
  Pour les tableaux, utilise "appendRows" pour ajouter des lignes sans écraser les existantes.`,
  parameters: z.object({
    noteId: z.string().describe("L'ID de la note à modifier"),
    metadataUpdates: z
      .record(z.any())
      .optional()
      .describe(
        "Objet de mises à jour partielles des metadata. Clé = ID du champ, Valeur = nouvelle valeur. Les champs non mentionnés restent inchangés.",
      ),
    appendRows: z
      .object({
        fieldId: z
          .string()
          .describe("L'ID du champ tableau dans lequel ajouter des lignes"),
        rows: z
          .array(z.record(z.any()))
          .describe(
            "Tableau d'objets à ajouter. Chaque objet = une ligne, avec les IDs des colonnes comme clés.",
          ),
      })
      .optional()
      .describe(
        "Pour ajouter des lignes à un champ tableau existant sans écraser les données. Utiliser ceci plutôt que metadataUpdates pour les tableaux.",
      ),
  }),
  execute: async ({ noteId, metadataUpdates, appendRows }) => {
    if (!userId)
      return { success: false, error: "Utilisateur non authentifié" };

    // 1. Récupérer la note actuelle
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("id, metadata, template_id, title")
      .eq("id", noteId)
      .eq("user_id", userId)
      .single();

    if (noteError)
      return { success: false, error: noteError.message };
    if (!note)
      return { success: false, error: "Note introuvable." };

    // 2. Récupérer le schéma du template pour résoudre les IDs
    let templateFields: any[] = [];
    if (note.template_id) {
      const { data: template } = await supabase
        .from("note_templates")
        .select("fields")
        .eq("id", note.template_id)
        .single();
      if (template?.fields && Array.isArray(template.fields)) {
        templateFields = template.fields;
      }
    }

    // Fonction pour trouver le vrai ID d'un champ (par ID exact ou par nom)
    const resolveFieldId = (idOrName: string) => {
      const field = templateFields.find(
        (f) =>
          f.id === idOrName ||
          (f.name && f.name.toLowerCase() === idOrName.toLowerCase()),
      );
      return field ? field.id : idOrName;
    };

    // Fonction pour mapper les noms de colonnes vers leurs vrais IDs
    const resolveColumnIds = (fieldId: string, rowObj: any) => {
      const field = templateFields.find((f) => f.id === fieldId);
      if (!field || !field.columns) return rowObj;

      const newRow: any = {};
      for (const [key, value] of Object.entries(rowObj)) {
        const col = field.columns.find(
          (c: any) =>
            c.id === key ||
            (c.name && c.name.toLowerCase() === key.toLowerCase()),
        );
        const finalKey = col ? col.id : key;
        newRow[finalKey] = value;
      }
      return newRow;
    };

    // 3. Fusionner les metadata existantes avec les nouvelles
    const currentMetadata = (note.metadata as Record<string, any>) || {};
    const newMetadata = { ...currentMetadata };

    // Appliquer les mises à jour simples (avec résolution intelligente)
    if (metadataUpdates) {
      for (const [key, value] of Object.entries(metadataUpdates)) {
        const resolvedKey = resolveFieldId(key);
        
        // Si on essaie de mettre à jour un tableau entier, on mappe aussi les colonnes
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
          newMetadata[resolvedKey] = value.map(row => resolveColumnIds(resolvedKey, row));
        } else {
          newMetadata[resolvedKey] = value;
        }
      }
    }

    // Appliquer l'ajout de lignes à un tableau (avec résolution intelligente)
    if (appendRows) {
      const resolvedFieldId = resolveFieldId(appendRows.fieldId);
      const existingRows = Array.isArray(newMetadata[resolvedFieldId])
        ? newMetadata[resolvedFieldId]
        : [];
      
      const mappedRows = appendRows.rows.map(row => resolveColumnIds(resolvedFieldId, row));
      
      newMetadata[resolvedFieldId] = [
        ...existingRows,
        ...mappedRows,
      ];
    }

    // 4. Sauvegarder en base
    const { error: updateError } = await supabase
      .from("notes")
      .update({ metadata: newMetadata as any })
      .eq("id", noteId)
      .eq("user_id", userId);

    if (updateError)
      return { success: false, error: updateError.message };

    // 5. Construire le résumé des changements
    const changes: string[] = [];
    if (metadataUpdates) {
      changes.push(
        `${Object.keys(metadataUpdates).length} champ(s) mis à jour`,
      );
    }
    if (appendRows) {
      changes.push(
        `${appendRows.rows.length} ligne(s) ajoutée(s) au tableau`,
      );
    }

    return {
      success: true,
      message: `La note "${note.title}" a été mise à jour : ${changes.join(", ")}.`,
      updatedFields: changes,
    };
  },
});
