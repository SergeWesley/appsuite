import { tool } from "ai";
import { z } from "zod";
import { callForgeApi } from "./api";

export const fetchSncfArrivalsTool = () =>
  tool({
    description: "Obtenir les prochaines arrivées de trains pour une gare donnée via l'API SNCF / Navitia.",
    parameters: z.object({
      station: z.string().describe("Le nom de la gare (ex: Paris Gare de Lyon, Marseille Saint-Charles)"),
    }),
    execute: async ({ station }) => {
      const result = await callForgeApi(
        `/api/sncf/arrivals?station=${encodeURIComponent(station)}`,
        "Erreur lors de la récupération des arrivées SNCF"
      );

      return {
        ...result,
        station,
      };
    },
  });
