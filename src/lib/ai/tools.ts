import { tool } from "ai";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";

// C'est ici qu'on définit le registre des outils disponibles pour l'Agent.
// Ce registre est générique et peut être étendu avec d'autres modules (tracker, spender, etc.)
export const getAgentTools = (supabase: SupabaseClient, userId: string) => {
  return {
    // --- MODULE NOTES ---
    createNoteFolderTool: tool({
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
    }),

    createNoteTool: tool({
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
    }),

    deleteNoteFolderTool: tool({
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
    }),

    // --- MODULE TRACKER ---
    getExercisePerformanceTool: tool({
      description:
        "Récupérer les dernières performances de l'utilisateur sur un exercice donné (poids, séries, répétitions, durée).",
      parameters: z.object({
        exerciseName: z
          .string()
          .describe(
            "Le nom de l'exercice (ex: 'Développé couché', 'Squat', 'Tractions')",
          ),
        limit: z
          .number()
          .optional()
          .default(3)
          .describe("Nombre de dernières séances à retourner (par défaut 3)"),
      }),
      execute: async ({ exerciseName, limit = 3 }) => {
        if (!userId)
          return { success: false, error: "Utilisateur non authentifié" };

        // 1. Chercher l'exercice par nom (insensible à la casse)
        const { data: exercises, error: exError } = await supabase
          .from("exercises")
          .select("id, name, muscle_group")
          .ilike("name", `%${exerciseName}%`);

        if (exError) return { success: false, error: exError.message };
        if (!exercises || exercises.length === 0) {
          return {
            success: false,
            error: `Aucun exercice trouvé pour "${exerciseName}". Vérifiez l'orthographe.`,
          };
        }

        // Si plusieurs exercices trouvés, suggérer
        if (exercises.length > 3) {
          return {
            success: false,
            ambiguous: true,
            message: `Plusieurs exercices correspondent à "${exerciseName}". Précisez parmi : ${exercises
              .slice(0, 5)
              .map((e: { name: string }) => e.name)
              .join(", ")}.`,
          };
        }

        const exerciseIds = exercises.map((e: { id: string }) => e.id);

        // 2. Chercher les workout_exercises liés à cet exercice, avec la séance associée
        const { data: workoutExercises, error: weError } = await supabase
          .from("workout_exercises")
          .select(
            `
            id,
            sets,
            reps,
            weight,
            duration,
            speed,
            slope,
            notes,
            exercise_id,
            exercises ( name, muscle_group ),
            workout_sessions!inner (
              id,
              date,
              user_id
            )
          `,
          )
          .in("exercise_id", exerciseIds)
          .eq("workout_sessions.user_id", userId)
          .order("workout_sessions(date)", { ascending: false })
          .limit(limit * 3); // Marge pour dédupliquer par séance

        if (weError) return { success: false, error: weError.message };
        if (!workoutExercises || workoutExercises.length === 0) {
          return {
            success: true,
            found: false,
            message: `Aucune séance trouvée avec l'exercice "${exerciseName}". Vous n'avez pas encore enregistré de performance pour cet exercice.`,
          };
        }

        // 3. Structurer les résultats par séance (garder les N dernières séances distinctes)
        const seenSessions = new Set<string>();
        const performances: Array<{
          date: string;
          exerciseName: string;
          muscleGroup: string;
          sets: number | null;
          reps: number | null;
          weightKg: number | null;
          durationMin: number | null;
          speed: number | null;
          slope: number | null;
          notes: string | null;
        }> = [];

        // Formatter une date ISO en date française lisible
        const formatDateFr = (dateStr: string) => {
          const date = new Date(dateStr + "T00:00:00");
          return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        };

        for (const we of workoutExercises as any[]) {
          const sessionId = we.workout_sessions?.id;
          if (!sessionId || seenSessions.has(sessionId)) continue;
          seenSessions.add(sessionId);

          performances.push({
            date: formatDateFr(we.workout_sessions.date),
            exerciseName: we.exercises?.name || exerciseName,
            muscleGroup: we.exercises?.muscle_group || "Inconnu",
            sets: we.sets ?? null,
            reps: we.reps ?? null,
            weightKg: we.weight ?? null,
            durationMin: we.duration ?? null,
            speed: we.speed ?? null,
            slope: we.slope ?? null,
            notes: we.notes ?? null,
          });

          if (performances.length >= limit) break;
        }

        // 4. Calculer la progression entre la dernière et l'avant-dernière séance
        let progression: string | null = null;
        if (
          performances.length >= 2 &&
          performances[0].weightKg &&
          performances[1].weightKg
        ) {
          const diff = performances[0].weightKg - performances[1].weightKg;
          progression =
            diff > 0
              ? `+${diff} kg par rapport à la séance précédente`
              : diff < 0
                ? `${diff} kg par rapport à la séance précédente`
                : "Même poids que la séance précédente";
        }

        return {
          success: true,
          found: true,
          exerciseName: performances[0]?.exerciseName || exerciseName,
          lastPerformances: performances,
          progression,
          summary:
            `Dernières ${performances.length} performance(s) pour ${performances[0]?.exerciseName || exerciseName} :` +
            performances
              .map(
                (p) =>
                  `\n- ${p.date} : ${p.sets ?? "?"}×${p.reps ?? "?"} reps${p.weightKg ? ` @ ${p.weightKg}kg` : ""}${p.durationMin ? ` pendant ${p.durationMin}min` : ""}`,
              )
              .join(""),
        };
      },
    }),

    // Tu pourras ajouter d'autres outils ici plus tard (ex: getExpenses, startWorkoutSession, etc.)
  };
};
