import { tool } from "ai";
import { z } from "zod";
import { callForgeApi } from "./api";

export const fetchWeatherTool = () =>
  tool({
    description: "Récupère les informations météorologiques pour une ville donnée via le backend Java Forge.",
    parameters: z.object({
      city: z.string().describe("Le nom de la ville pour laquelle obtenir la météo, ex: Paris, Tokyo"),
    }),
    execute: async ({ city }) => {
      const result = await callForgeApi(
        `/api/weather?city=${encodeURIComponent(city)}`,
        "Erreur lors de la récupération de la météo"
      );
      
      return {
        ...result,
        city
      };
    },
  });
