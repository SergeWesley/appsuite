import { tool } from "ai";
import { z } from "zod";
import { callForgeApi } from "./api";

export const fetchSncfDeparturesTool = () =>
  tool({
    description: "Obtenir les prochains départs de trains pour une gare donnée via l'API SNCF / Navitia.",
    parameters: z.object({
      station: z.string().describe("Le nom de la gare (ex: Paris Gare de Lyon, Marseille Saint-Charles)"),
    }),
    execute: async ({ station }) => {
      const result = await callForgeApi(
        `/api/sncf/departures?station=${encodeURIComponent(station)}`,
        "Erreur lors de la récupération des départs SNCF"
      );

      return {
        ...result,
        station,
      };
    },
  });
