/**
 * Limitation de débit en mémoire (CDC §4.3 — rate limiting / anti-abus).
 * ⚠️ Implémentation simple par instance, suffisante pour le périmètre vitrine.
 * En production multi-instances, remplacer par un store partagé (Redis, etc.).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  { max = 5, windowMs = 60_000 }: { max?: number; windowMs?: number } = {},
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (bucket.count >= max) {
    return { allowed: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

/** Extrait une clé client (IP) depuis les en-têtes de la requête. */
export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0]!.trim() : "local";
  return `${scope}:${ip}`;
}
