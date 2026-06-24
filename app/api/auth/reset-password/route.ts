import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { validateReset, type ResetInput } from "@/lib/auth/validation";
import { hashToken } from "@/lib/auth/tokens";
import { rateLimit, clientKey } from "@/lib/rateLimit";

/**
 * Réinitialisation effective du mot de passe (US-03).
 * Le jeton est à usage unique ; toutes les sessions sont révoquées par sécurité.
 */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "reset"), { max: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Trop de tentatives. Merci de réessayer dans un instant." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let data: ResetInput;
  try {
    data = (await req.json()) as ResetInput;
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const errors = validateReset(data);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(data.token) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json(
      { ok: false, error: "Ce lien est invalide ou a expiré. Refaites une demande." },
      { status: 422 },
    );
  }

  const passwordHash = await hashPassword(data.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Révocation de toutes les sessions existantes (sécurité)
    prisma.session.deleteMany({ where: { userId: record.userId } }),
  ]);

  return NextResponse.json({ ok: true });
}
