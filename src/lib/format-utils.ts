/**
 * Fonctions utilitaires de formatage réutilisables dans l'ensemble du projet.
 */

/**
 * Formate un timestamp Navitia (format YYYYMMDDTHHmmss) en heure lisible HH:mm.
 * Retourne "--:--" si la valeur est vide ou invalide.
 *
 * @example formatNavitiaTime("20260711T143500") → "14:35"
 */
export function formatNavitiaTime(navitiaTime: string): string {
  if (!navitiaTime) return "--:--";
  const match = navitiaTime.match(
    /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/
  );
  if (match) {
    return `${match[4]}:${match[5]}`;
  }
  return navitiaTime;
}

/**
 * Formate un nombre en devise avec séparateur français.
 * Utilise un nombre de décimales adapté (6 pour les petites valeurs, 2 sinon).
 */
export function formatCurrency(
  value: number,
  currency: string = "usd"
): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

/**
 * Formate un grand nombre (capitalisation boursière, etc.) avec les suffixes T, Md, M.
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)} T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)} Md`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)} M`;
  return value.toLocaleString("fr-FR");
}

/**
 * Formate une durée en secondes en heures et minutes (ex: 3660 -> "1h01").
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "--h--";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const hStr = h > 0 ? `${h}h` : "";
  const mStr = m.toString().padStart(2, "0");
  return `${hStr}${mStr}`;
}
