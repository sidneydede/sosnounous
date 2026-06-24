import { randomBytes, createHash, randomInt } from "node:crypto";

/**
 * Génération et hachage de jetons (sessions, réinitialisation, OTP).
 * Principe : on transmet une valeur aléatoire au client et on ne stocke en base
 * que son empreinte SHA-256 — une fuite de base ne livre pas de jeton utilisable.
 */

/** Jeton opaque pour cookie de session / lien de réinitialisation. */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

/** Empreinte SHA-256 d'un jeton (stockage en base). */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Code OTP numérique (par défaut 6 chiffres) — RG-03. */
export function generateOtp(length = 6): string {
  const max = 10 ** length;
  return randomInt(0, max).toString().padStart(length, "0");
}
