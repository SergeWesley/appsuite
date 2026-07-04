import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getForgeTools } from "@/lib/ai/tools/forge";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: `Tu es un assistant "Builder" intelligent pour l'application AppSuite.
               Ton rôle est de comprendre les requêtes de l'utilisateur concernant les données du backend Forge (API Java), 
               d'appeler les outils appropriés pour récupérer ces données, et de laisser le frontend afficher des composants UI riches.
               
               Règles importantes :
               - Analyse la requête et choisis le ou les outils les plus pertinents parmi ceux à ta disposition.
               - CRITIQUE : Transmets les paramètres (ex: nom de ville, identifiant, recherche) EXACTEMENT tels que fournis par l'utilisateur, sans aucune modification, traduction ou correction.
               - Ne rédige pas de résumé textuel des données si un outil a été appelé avec succès. Réponds simplement "Voici les informations demandées :" ou une phrase d'accroche similaire ; le frontend s'occupera du rendu visuel des données.
               - Parle toujours en français de façon concise et professionnelle.`,
      messages,
      tools: getForgeTools(),
      maxToolRoundtrips: 3,
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error(`[API Forge Chat] Erreur durant le streaming:`, error);
        return String(error);
      }
    });
  } catch (error: any) {
    console.error(`[API Forge Chat] Erreur fatale:`, error);
    if (error?.stack) {
      console.error(error.stack);
    }
    return new Response(JSON.stringify({ error: error.message || "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
