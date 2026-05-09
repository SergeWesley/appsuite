import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
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

    // 2. Client Supabase pour Auth & Cache
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${accessToken || ""}` },
        },
      }
    );

    // Vérification de l'utilisateur
    const { data: { user } } = await supabase.auth.getUser(accessToken || "");
    const role = (user?.app_metadata?.role as string | undefined) || (user?.user_metadata?.role as string | undefined);

    if (role !== "admin" && role !== "vip") {
      return new Response(JSON.stringify({ error: "Accès réservé aux administrateurs et membres VIP." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

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
      console.error("[Cooker] Cache Select Error:", selectError);
    }

    if (cachedData) {
      console.log("[Cooker] Cache Hit for hash:", ingredientsHash);
      return new Response(JSON.stringify({ recipes: cachedData.recipes }), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    console.log("[Cooker] Cache Miss - Generating with AI...");

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
      system: `Tu es un Chef cuisinier étoilé et nutritionniste. 
      Ta mission est de proposer 3 recettes originales basées sur une liste d'ingrédients.
      L'utilisateur a choisi ces ingrédients : ${ingredients.join(", ")}.
      Tu peux supposer qu'il a aussi des basiques : sel, poivre, huile, eau, vinaigre, ail, oignon, épices courantes.
      Sois créatif, moderne et gastronomique. 
      Les recettes doivent être équilibrées.`,
      prompt: `Génère 3 recettes gourmandes et saines en utilisant principalement ces ingrédients : ${ingredients.join(", ")}.`,
    });

    // 5. Sauvegarder dans le cache pour la prochaine fois
    const { error: upsertError } = await supabase.from("cooker_recipe_cache").upsert({
      ingredients_hash: ingredientsHash,
      ingredients_list: sortedIngredients,
      recipes: result.object.recipes,
      created_at: new Date().toISOString(),
    });

    if (upsertError) {
      console.error("[Cooker] Cache Upsert Error:", upsertError);
    }

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("[Cooker Generate] Error:", error);
    return new Response(JSON.stringify({ error: "Une erreur est survenue lors de la génération." }), {
      status: 500,
    });
  }
}
