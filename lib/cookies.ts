/**
 * Gestion du consentement aux cookies / traceurs (CDC §4.4).
 * Le consentement est horodaté et stocké côté client. Seuls les cookies
 * strictement nécessaires (session) sont déposés sans consentement.
 */

export const CONSENT_COOKIE = "sosn_cookie_consent";
const MAX_AGE_DAYS = 180;

export interface CookieConsent {
  /** Cookies de mesure d'audience (analytics). */
  analytics: boolean;
  /** Date du choix (ISO) — horodatage du consentement. */
  date: string;
}

/** Lit le consentement courant (client). Renvoie null si aucun choix exprimé. */
export function readConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  try {
    const value = decodeURIComponent(match.split("=").slice(1).join("="));
    const parsed = JSON.parse(value) as Partial<CookieConsent>;
    if (typeof parsed.analytics !== "boolean") return null;
    return { analytics: parsed.analytics, date: parsed.date ?? "" };
  } catch {
    return null;
  }
}

/** Enregistre le choix de consentement (client), horodaté. */
export function writeConsent(analytics: boolean, nowIso: string): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify({ analytics, date: nowIso }));
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}
