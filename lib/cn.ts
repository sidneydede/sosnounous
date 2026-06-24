/**
 * Concatène des classes conditionnelles (utilitaire léger, sans dépendance).
 * Évite d'ajouter clsx/tailwind-merge pour ce périmètre (CDC §4.x : éviter
 * les dépendances inutiles).
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
