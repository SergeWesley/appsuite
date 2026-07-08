import { tool } from "ai";
import { z } from "zod";
import { callForgeApi } from "./api";

export const geocodeAddressTool = () =>
  tool({
    description: "Convertit une adresse textuelle en coordonnées géographiques (latitude, longitude) via l'API Nominatim du backend Forge.",
    parameters: z.object({
      address: z.string().describe("L'adresse à rechercher, ex: 10 rue de la Paix, Paris"),
    }),
    execute: async ({ address }) => {
      const result = await callForgeApi(
        `/api/nominatim/geocode?address=${encodeURIComponent(address)}`,
        "Erreur lors de la géolocalisation de l'adresse"
      );
      
      return {
        ...result,
        address
      };
    },
  });
