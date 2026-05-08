import { tool } from "ai";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";

export const getExercisePerformanceTool = (supabase: SupabaseClient, userId: string) => tool({
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
});
