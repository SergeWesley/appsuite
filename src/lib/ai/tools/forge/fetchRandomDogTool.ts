import { tool } from "ai";
import { z } from "zod";
import { callForgeApi } from "./api";

export const fetchRandomDogTool = () =>
  tool({
    description: "Récupère l'URL d'une image de chien aléatoire via le backend Java Forge (qui utilise l'API Dog CEO).",
    parameters: z.preprocess(
      (val) => (val === null || val === undefined ? {} : val),
      z.object({})
    ),
    execute: async () => {
      return callForgeApi("/api/dogs/random", "Erreur lors de la récupération de l'image de chien");
    },
  });
