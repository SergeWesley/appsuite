import { tool } from "ai";
import { z } from "zod";
import { callForgeApi } from "./api";

export const generateTempEmailTool = () =>
  tool({
    description: "Génère une nouvelle adresse e-mail temporaire (jetable) et son jeton de session.",
    parameters: z.object({
      trigger: z.boolean().optional().describe("Paramètre technique optionnel"),
    }),
    execute: async () => {
      const result = await callForgeApi(
        `/api/tempmail/generate`,
        "Erreur lors de la génération de l'e-mail temporaire"
      );
      
      return result;
    },
  });
