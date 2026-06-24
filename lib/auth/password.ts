import bcrypt from "bcryptjs";

/**
 * Hachage et politique de robustesse des mots de passe (RG-05).
 * bcrypt est conforme à la recommandation du CDC (§4.3 : bcrypt/argon2).
 */

const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Politique de robustesse (RG-05) : 8 caractères minimum, au moins une lettre
 * et un chiffre. Retourne un message d'erreur ou null si valide.
 */
export function checkPasswordStrength(password: string): string | null {
  if (!password || password.length < 8)
    return "Le mot de passe doit contenir au moins 8 caractères.";
  if (password.length > 100) return "Le mot de passe est trop long.";
  if (!/[a-zA-Z]/.test(password))
    return "Le mot de passe doit contenir au moins une lettre.";
  if (!/[0-9]/.test(password))
    return "Le mot de passe doit contenir au moins un chiffre.";
  return null;
}
