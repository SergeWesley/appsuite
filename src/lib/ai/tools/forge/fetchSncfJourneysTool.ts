import { tool } from "ai";
import { z } from "zod";
import { callForgeApi } from "./api";

export const fetchSncfJourneysTool = () => tool({
  description: "Rechercher un itinéraire de train entre deux gares à une date donnée.",
  parameters: z.object({
    from: z.string().describe("The name of the departure station (e.g., 'Paris', 'Gare de Lyon')"),
    to: z.string().describe("The name of the arrival station (e.g., 'Marseille', 'Part Dieu')"),
    datetime: z.string().optional().describe("Optional date and time in format YYYY-MM-DDTHH:mm:ss (e.g., '2026-07-11T14:30:00'). If not specified, returns upcoming journeys."),
    datetimeRepresents: z.enum(["departure", "arrival"]).optional().describe("Whether the datetime represents a departure or an arrival. Defaults to departure."),
  }),
  execute: async ({ from, to, datetime, datetimeRepresents }) => {
    try {
      let url = `/api/sncf/journeys?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      if (datetime) {
        url += `&datetime=${encodeURIComponent(datetime)}`;
      }
      if (datetimeRepresents) {
        url += `&datetimeRepresents=${encodeURIComponent(datetimeRepresents)}`;
      }

      const result = await callForgeApi(
        url,
        "Erreur lors de la récupération de l'itinéraire SNCF"
      );

      return {
        ...result,
        from,
        to,
        datetime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Impossible de récupérer l'itinéraire.",
        from,
        to,
      };
    }
  },
});
