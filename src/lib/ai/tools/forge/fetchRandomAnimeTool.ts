import { tool } from "ai";
import { z } from "zod";
import { callForgeApi } from "./api";

export const fetchRandomAnimeTool = () =>
  tool({
    description: "Récupère les informations d'un anime aléatoire via le backend Java Forge (qui utilise l'API Jikan).",
    parameters: z.preprocess(
      (val) => (val === null || val === undefined ? {} : val),
      z.object({})
    ),
    execute: async () => {
      return callForgeApi("/api/anime/random", "Erreur lors de la récupération de l'anime");
    },
  });
