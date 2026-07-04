import { tool } from "ai";
import { z } from "zod";

export const fetchRandomAnimeTool = () =>
  tool({
    description: "Récupère les informations d'un anime aléatoire via le backend Java Forge (qui utilise l'API Jikan).",
    parameters: z.preprocess(
      (val) => (val === null || val === undefined ? {} : val),
      z.object({})
    ),
    execute: async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_FORGE_API_URL || "http://localhost:8080";
        const response = await fetch(`${baseUrl}/api/anime/random`);
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return {
          success: true,
          data
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Erreur lors de la récupération de l'anime"
        };
      }
    },
  });
