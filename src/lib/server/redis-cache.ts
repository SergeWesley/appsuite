import { Redis } from "@upstash/redis";
import { normalizeText } from "@/lib/format-utils";

// On initialise l'instance Redis une seule fois
const redis = Redis.fromEnv();

/**
 * Tente de récupérer un stream brut du cache Redis.
 * Retourne la chaîne de caractères du stream si elle existe, ou null.
 */
export async function getCachedStream(prefix: string, prompt: string): Promise<string | null> {
  const normalized = normalizeText(prompt);
  if (!normalized) return null;

  const cacheKey = `${prefix}:${normalized}`;
  try {
    return await redis.get<string>(cacheKey);
  } catch (error) {
    console.error(`[Redis Cache] Erreur de lecture du cache pour la clé ${cacheKey}:`, error);
    return null;
  }
}

/**
 * Sauvegarde de façon asynchrone la réponse d'un DataStream dans Redis.
 * Clone la réponse pour ne pas bloquer le flux envoyé au client.
 */
export function cacheStreamResponseAsync(
  prefix: string,
  prompt: string,
  response: Response,
  ttlSeconds: number = 300
) {
  const normalized = normalizeText(prompt);
  if (!normalized) return;

  const cacheKey = `${prefix}:${normalized}`;
  const responseClone = response.clone();

  responseClone.text().then((rawStreamString) => {
    if (rawStreamString) {
      redis.set(cacheKey, rawStreamString, { ex: ttlSeconds }).catch((err) => {
        console.error(`[Redis Cache] Erreur d'écriture dans le cache Redis pour ${cacheKey}:`, err);
      });
      console.log(`[Redis Cache] Cache mis à jour pour la clé : "${cacheKey}"`);
    }
  }).catch((err) => console.error(`[Redis Cache] Erreur lors du clonage du stream pour le cache ${cacheKey}:`, err));
}
