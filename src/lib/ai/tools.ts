import { SupabaseClient } from "@supabase/supabase-js";
import { createNoteFolderTool } from "./tools/createNoteFolder";
import { createNoteTool } from "./tools/createNote";
import { deleteNoteFolderTool } from "./tools/deleteNoteFolder";
import { getExercisePerformanceTool } from "./tools/getExercisePerformance";
import { getNoteContentTool } from "./tools/getNoteContent";
import { updateNoteMetadataTool } from "./tools/updateNoteMetadata";

// C'est ici qu'on définit le registre des outils disponibles pour l'Agent.
// Ce registre est générique et peut être étendu avec d'autres modules (tracker, spender, etc.)
export const getAgentTools = (supabase: SupabaseClient, userId: string) => {
  return {
    createNoteFolderTool: createNoteFolderTool(supabase, userId),
    createNoteTool: createNoteTool(supabase, userId),
    deleteNoteFolderTool: deleteNoteFolderTool(supabase, userId),
    getExercisePerformanceTool: getExercisePerformanceTool(supabase, userId),
    getNoteContentTool: getNoteContentTool(supabase, userId),
    updateNoteMetadataTool: updateNoteMetadataTool(supabase, userId),
  };
};
