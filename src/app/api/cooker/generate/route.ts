import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";
import { checkUserRoles } from "@/lib/server/api-auth";
import { createHash } from "crypto";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { ingredients, accessToken } = await req.json();

    // 1. Validation de base
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(JSON.stringify({ error: "Aucun ingrédient fourni" }), {
        status: 400,
      });
    }

    // 2. Vérification de l'utilisateur (Admin / VIP) via Supabase
    const { supabase, errorResponse } = await checkUserRoles(accessToken, ["admin", "vip"]);
    if (errorResponse) return errorResponse;

    // 3. Logique de Cache
    // Trier les ingrédients pour assurer la cohérence du hash
    const sortedIngredients = [...ingredients].sort((a, b) => a.localeCompare(b));
    const ingredientsHash = createHash("md5")
      .update(sortedIngredients.join(",").toLowerCase())
      .digest("hex");

    // Vérifier le cache
    const { data: cachedData, error: selectError } = await supabase
      .from("cooker_recipe_cache")
      .select("recipes")
      .eq("ingredients_hash", ingredientsHash)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("[Cooker] Erreur de sélection du cache :", selectError);
    }

    if (cachedData) {
      console.log("[Cooker] Cache Hit pour le hash :", ingredientsHash);
      return new Response(JSON.stringify({ recipes: cachedData.recipes }), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    console.log("[Cooker] Cache Miss - Génération avec l'IA...");

    // 4. Génération IA (si pas de cache)
    const result = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: z.object({
        recipes: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            steps: z.array(z.string()),
            nutritionBenefits: z.string(),
            difficulty: z.enum(["Facile", "Moyen", "Difficile"]),
            prepTime: z.string(),
          })
        ).length(3),
      }),
      system: `Vous êtes un Chef cuisinier étoilé et nutritionniste. 
      Votre mission est de proposer 3 recettes originales basées sur une liste d'ingrédients.
      L'utilisateur a choisi ces ingrédients : ${ingredients.join(", ")}.
      Vous pouvez supposer qu'il a aussi des basiques : sel, poivre, huile, eau, vinaigre, ail, oignon, épices courantes.
      Soyez créatif, moderne et gastronomique. 
      Les recettes doivent être équilibrées.`,
      prompt: `Générez 3 recettes gourmandes et saines en utilisant principalement ces ingrédients : ${ingredients.join(", ")}.`,
    });

    // 5. Sauvegarder dans le cache pour la prochaine fois
    const { error: upsertError } = await supabase.from("cooker_recipe_cache").upsert({
      ingredients_hash: ingredientsHash,
      ingredients_list: sortedIngredients,
      recipes: result.object.recipes,
      created_at: new Date().toISOString(),
    });

    if (upsertError) {
      console.error("[Cooker] Erreur d'insertion dans le cache :", upsertError);
    }

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("[Cooker Generate] Erreur :", error);
    return new Response(JSON.stringify({ error: "Une erreur est survenue lors de la génération." }), {
      status: 500,
    });
  }
}
