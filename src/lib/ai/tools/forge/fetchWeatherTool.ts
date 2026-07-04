import { tool } from "ai";
import { z } from "zod";

export const fetchWeatherTool = () =>
  tool({
    description: "Récupère les informations météorologiques pour une ville donnée via le backend Java Forge.",
    parameters: z.object({
      city: z.string().describe("Le nom de la ville pour laquelle obtenir la météo, ex: Paris, Tokyo"),
    }),
    execute: async ({ city }) => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_FORGE_API_URL || "http://localhost:8080";
        const response = await fetch(`${baseUrl}/api/weather?city=${encodeURIComponent(city)}`);
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return {
          success: true,
          data,
          city
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Erreur lors de la récupération de la météo",
          city
        };
      }
    },
  });
