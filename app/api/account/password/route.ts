import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, destroyAllUserSessions, createSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword, checkPasswordStrength } from "@/lib/auth/password";
import { rateLimit, clientKey } from "@/lib/rateLimit";

/** Changement de mot de passe par l'utilisateur connecté (CDC §3.1). */
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });

  const limit = rateLimit(clientKey(req, `pwd:${me.id}`), { max: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Trop de tentatives. Merci de réessayer plus tard." },
      { status: 429 },
    );
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  if (!body.currentPassword) errors.currentPassword = "Mot de passe actuel requis.";
  const strength = checkPasswordStrength(body.newPassword ?? "");
  if (strength) errors.newPassword = strength;
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) return NextResponse.json({ ok: false, error: "Compte introuvable." }, { status: 404 });

  const ok = await verifyPassword(body.currentPassword!, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { ok: false, errors: { currentPassword: "Mot de passe actuel incorrect." } },
      { status: 422 },
    );
  }

  const passwordHash = await hashPassword(body.newPassword!);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  // Révoque toutes les sessions puis recrée la session courante (sécurité)
  await destroyAllUserSessions(user.id);
  await createSession(user.id, req.headers.get("user-agent") ?? undefined);

  return NextResponse.json({ ok: true });
}
