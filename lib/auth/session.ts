import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import type { Role, AccountStatus } from "@/lib/auth/roles";

export { SESSION_COOKIE };

/**
 * Gestion de session (CDC §2.5 : connexion, session, déconnexion).
 * Sessions opaques côté client (cookie httpOnly) ; empreinte stockée en base,
 * ce qui les rend révocables (déconnexion, suspension de compte).
 */

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

export interface SessionUser {
  id: string;
  role: Role;
  status: AccountStatus;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  commune: string;
  metiers: string[];
}

/** Crée une session et pose le cookie httpOnly. */
export async function createSession(userId: string, userAgent?: string): Promise<void> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, userAgent, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Retourne l'utilisateur de la session courante, ou null.
 * Mémoïsé par requête (React `cache`) pour éviter les requêtes BDD redondantes
 * lorsqu'un layout et sa page appellent tous deux ce helper.
 */
export const getSessionUser = cache(async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;

  const u = session.user;
  // Un compte suspendu ne doit pas disposer d'une session active.
  if (u.status === "SUSPENDED") return null;

  return {
    id: u.id,
    role: u.role as Role,
    status: u.status as AccountStatus,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    commune: u.commune,
    metiers: parseMetiers(u.metiers),
  };
});

/** Détruit la session courante (déconnexion) et supprime le cookie. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session
      .delete({ where: { tokenHash: hashToken(token) } })
      .catch(() => undefined); // session déjà absente : sans effet
  }
  cookieStore.delete(SESSION_COOKIE);
}

/** Révoque toutes les sessions d'un utilisateur (ex. changement de mot de passe). */
export async function destroyAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

export function parseMetiers(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
