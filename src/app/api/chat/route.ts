import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getAgentTools } from "@/lib/ai/tools";
import { createClient } from "@supabase/supabase-js";

// Configuration explicite du provider Groq avec la clé côté serveur
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// Optionnel: autoriser un temps d'exécution plus long pour l'IA
export const maxDuration = 30;

function getErrorResponse(error: unknown): { message: string; status: number } {
  // Clé API manquante
  if (!process.env.GROQ_API_KEY) {
    return {
      message:
        "L'assistant IA n'est pas configuré. Contactez l'administrateur.",
      status: 503,
    };
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    // Erreur d'authentification (clé invalide)
    if (
      msg.includes("api_key") ||
      msg.includes("unauthorized") ||
      msg.includes("403")
    ) {
      return {
        message:
          "La clé API est invalide ou expirée. Contactez l'administrateur.",
        status: 401,
      };
    }

    // Modèle introuvable (404)
    if (msg.includes("not found") || msg.includes("404")) {
      return {
        message:
          "Le modèle IA est temporairement indisponible. Réessayez dans quelques instants.",
        status: 503,
      };
    }

    // Quota dépassé / Rate limit
    if (msg.includes("quota") || msg.includes("rate") || msg.includes("429")) {
      return {
        message:
          "Le quota de l'assistant IA est temporairement épuisé. Réessayez dans quelques instants.",
        status: 429,
      };
    }

    // Délai d'attente dépassé
    if (msg.includes("timeout") || msg.includes("timed out")) {
      return {
        message:
          "L'assistant IA met trop de temps à répondre. Réessayez avec une question plus courte.",
        status: 504,
      };
    }
  }

  // Erreur générique
  return {
    message:
      "Une erreur inattendue s'est produite. Réessayez dans quelques instants.",
    status: 500,
  };
}

export async function POST(req: Request) {
  try {
    const { messages, data, accessToken } = await req.json();

    // Créer un client Supabase authentifié avec le token du client
    // Le token dans global.headers est envoyé pour chaque requête DB → RLS fonctionne
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${accessToken || ""}` },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser(accessToken || "");
    const userId = user?.id;

    // Vérification du rôle admin (double protection côté serveur)
    const role =
      (user?.app_metadata?.role as string | undefined) ||
      (user?.user_metadata?.role as string | undefined);
    if (role !== "admin") {
      return new Response(JSON.stringify({ error: "Accès réservé aux administrateurs." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Contexte additionnel optionnel
    const contextStr = data?.systemContext
      ? `Contexte actuel de l'utilisateur : ${data.systemContext}`
      : "";

    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: `Tu es l'assistant IA de l'application "AppSuite", un coach personnel et assistant de productivité.
                Parle toujours en français, de façon chaleureuse, directe et motivante.
                
                Règles de style importantes :
                - Ne jamais retourner de JSON brut ou de données techniques crues à l'utilisateur
                - Toujours interpréter les résultats des outils et les reformuler en phrases naturelles
                - Les dates doivent être écrites en français (ex: "3 mai 2026", pas "2026-05-03")
                - Pour les perfs sportives : résume en 2-3 phrases claires, mentionne la progression si elle existe, et encourage
                - Sois concis : pas de listes techniques, favorise les phrases courtes et impactantes
                - Utilise des emojis avec parcimonie pour ponctuer les messages de performances (ex: 💪, 🔥, ✅)
                
                Si l'utilisateur demande de créer un dossier ou une note mais que tu ne connais pas les paramètres, pose la question.
                Si on te demande de faire une action pour laquelle tu n'as pas d'outil, dis gentiment que ça sera ajouté bientôt.
                Si le contexte mentionne une note ouverte avec un ID, utilise l'outil getNoteContentTool pour récupérer son contenu avant de répondre.
                ${contextStr}`,
      messages,
      tools: getAgentTools(supabase, userId as string),
      maxToolRoundtrips: 3, // Permet à l'IA de recevoir le résultat de l'outil et de répondre en langage naturel
    });

    return result.toDataStreamResponse();
  } catch (error) {
    const { message, status } = getErrorResponse(error);
    console.error(`[API Chat] Erreur ${status}:`, error);

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
