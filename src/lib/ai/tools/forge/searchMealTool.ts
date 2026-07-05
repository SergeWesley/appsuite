import { tool } from "ai";
import { z } from "zod";
import { callForgeApi } from "./api";

export const searchMealTool = () =>
  tool({
    description: "Recherche des recettes de cuisine à partir d'un mot clé (ex: Chicken, Pasta) via le backend Java Forge.",
    parameters: z.object({
      query: z.string().describe("Mot clé de recherche pour trouver des recettes de cuisine"),
    }),
    execute: async ({ query }) => {
      const result = await callForgeApi(
        `/api/meals/search?query=${encodeURIComponent(query)}`,
        "Erreur lors de la recherche de recettes"
      );
      
      return {
        ...result,
        query
      };
    },
  });
