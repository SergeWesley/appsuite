import { tool } from "ai";
import { z } from "zod";
import { callForgeApi } from "./api";

export const fetchMcuNextTool = () =>
  tool({
    description: "Récupère les détails et le compte à rebours pour le prochain film ou série Marvel (MCU) via le backend Java Forge.",
    parameters: z.preprocess(
      (val) => (val === null || val === undefined ? {} : val),
      z.object({})
    ),
    execute: async () => {
      const result = await callForgeApi(
        `/api/mcu/next`,
        "Erreur lors de la récupération des données du prochain MCU"
      );

      return result;
    },
  });
