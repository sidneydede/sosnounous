import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/roles";

/**
 * Gardes d'accès pour les pages serveur (RBAC — CDC §4.1).
 * Pour les routes API, utiliser directement getSessionUser() et renvoyer 401/403.
 */

/** Exige un utilisateur connecté, sinon redirige vers la connexion. */
export async function requireUser(nextPath = "/espace"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/connexion?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/** Exige un rôle parmi ceux autorisés, sinon redirige. */
export async function requireRole(
  roles: Role[],
  nextPath = "/espace",
): Promise<SessionUser> {
  const user = await requireUser(nextPath);
  if (!roles.includes(user.role)) redirect("/espace");
  return user;
}
