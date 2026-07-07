import { tool } from "ai";
import { z } from "zod";
import { callForgeApi } from "./api";

export const checkTempEmailTool = () =>
  tool({
    description: "Vérifie la boîte de réception pour lire les nouveaux e-mails reçus sur l'adresse temporaire.",
    parameters: z.object({
      sid_token: z.string().describe("Le jeton (sid_token) de l'e-mail temporaire"),
    }),
    execute: async ({ sid_token }) => {
      const result = await callForgeApi(
        `/api/tempmail/check?sidToken=${encodeURIComponent(sid_token)}`,
        "Erreur lors de la vérification des e-mails"
      );
      
      return {
        ...result,
        sid_token
      };
    },
  });
