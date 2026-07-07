import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getForgeTools } from "@/lib/ai/tools/forge";
import { checkUserRoles } from "@/lib/server/api-auth";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, accessToken, systemContext } = await req.json();

    // Authentification Supabase pour vérifier les rôles (Admin / VIP)
    const { errorResponse } = await checkUserRoles(accessToken, ["admin", "vip"]);
    if (errorResponse) return errorResponse;

    // Pour réduire drastiquement le nombre de tokens envoyés (et rester sous la limite de 6000 TPM),
    // on ne garde que la toute dernière requête de l'utilisateur (requête standalone).
    const standaloneMessage = [messages[messages.length - 1]];
    const modelsToTry = [
      "llama-3.1-8b-instant",
      "llama-3.3-70b-versatile",
      "allam-2-7b",
    ];
    let lastError: any;

    let systemPrompt = `Tu es un assistant "Builder" intelligent pour l'application AppSuite.
                   Ton rôle est de comprendre les requêtes de l'utilisateur concernant les données du backend Forge (API Java), 
                   d'appeler les outils appropriés pour récupérer ces données, et de laisser le frontend afficher des composants UI riches.
                   
                   Règles importantes :
                   - Analyse la requête et choisis le ou les outils les plus pertinents parmi ceux à ta disposition.
                   - CRITIQUE : Transmets les paramètres (ex: nom de ville, identifiant, recherche) EXACTEMENT tels que fournis par l'utilisateur, sans aucune modification, traduction ou correction.
                   - Ne rédige pas de résumé textuel des données si un outil a été appelé avec succès. Réponds simplement "Voici les informations demandées :" ou une phrase d'accroche similaire ; le frontend s'occupera du rendu visuel des données.
                   - Parle toujours en français de façon concise et professionnelle.`;

    // Injection générique du contexte système
    if (systemContext && Object.keys(systemContext).length > 0) {
      systemPrompt += `\n\nCONTEXTE ACTUEL DU SYSTEME ET DE L'UTILISATEUR :`;
      for (const [key, value] of Object.entries(systemContext)) {
        systemPrompt += `\n- ${key}: ${value}`;
      }
    }

    for (const modelName of modelsToTry) {
      try {
        const result = await streamText({
          model: groq(modelName),
          system: systemPrompt,
          messages: standaloneMessage,
          tools: getForgeTools(),
          maxToolRoundtrips: 1,
        });

        console.log(
          `[API Forge Chat] Modèle utilisé avec succès : ${modelName}`,
        );

        return result.toDataStreamResponse({
          getErrorMessage: (error) => {
            console.error(
              `[API Forge Chat] Erreur durant le streaming avec ${modelName}:`,
              error,
            );
            return String(error);
          },
        });
      } catch (error: any) {
        lastError = error;

        // Vérifie si l'erreur est liée à une limite de quota ou surcharge
        const isRateLimit =
          error?.statusCode === 429 ||
          error?.message?.includes("429") ||
          error?.message?.toLowerCase().includes("rate limit");

        if (isRateLimit) {
          console.warn(
            `[API Forge Chat] Limite atteinte pour le modèle ${modelName}. Basculement automatique vers le modèle de secours...`,
          );
          continue; // On passe au modèle suivant dans le tableau
        }

        // Si c'est une autre erreur (ex: mauvaise clé API), on arrête de boucler
        throw error;
      }
    }

    // Si on sort de la boucle, c'est que tous les modèles ont échoué
    throw lastError;
  } catch (error: any) {
    console.error(`[API Forge Chat] Erreur fatale:`, error);
    if (error?.stack) {
      console.error(error.stack);
    }
    return new Response(
      JSON.stringify({ error: error.message || "Erreur serveur" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
