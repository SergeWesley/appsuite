import { tool } from "ai";
import { z } from "zod";
import { callForgeApi } from "./api";

export const searchArtTool = () =>
  tool({
    description: "Recherche des oeuvres d'art à partir d'un mot clé (ex: Van Gogh, cats) via le backend Java Forge.",
    parameters: z.object({
      query: z.string().describe("Mot clé de recherche pour trouver des oeuvres d'art"),
    }),
    execute: async ({ query }) => {
      const result = await callForgeApi(
        `/api/art/search?query=${encodeURIComponent(query)}`,
        "Erreur lors de la recherche d'oeuvres d'art"
      );
      
      return {
        ...result,
        query
      };
    },
  });
