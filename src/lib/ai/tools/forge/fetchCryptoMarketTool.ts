import { tool } from "ai";
import { z } from "zod";
import { callForgeApi } from "./api";

export const fetchCryptoMarketTool = () =>
  tool({
    description: "Récupère les données de marché d'une cryptomonnaie (prix actuel, variation 24h, capitalisation, plus haut/bas) via le backend Java Forge et CoinGecko.",
    parameters: z.object({
      coin: z.string().describe("L'identifiant CoinGecko de la cryptomonnaie, ex: bitcoin, ethereum, solana, dogecoin"),
      currency: z.string().optional().default("usd").describe("La devise pour afficher le prix, ex: usd, eur"),
    }),
    execute: async ({ coin, currency }) => {
      const result = await callForgeApi(
        `/api/crypto/market?coin=${encodeURIComponent(coin)}&currency=${encodeURIComponent(currency)}`,
        "Erreur lors de la récupération des données crypto"
      );

      return {
        ...result,
        coin,
        currency,
      };
    },
  });
