import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateForgot, type ForgotInput } from "@/lib/auth/validation";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { sendNotification } from "@/lib/notifications";
import { isHoneypotFilled } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { site } from "@/lib/data/site";

/**
 * Demande de réinitialisation de mot de passe (US-03).
 * Réponse neutre systématique (anti-énumération de comptes).
 */

const TTL_MS = 60 * 60 * 1000; // 1 heure

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "forgot"), { max: 3, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Trop de demandes. Merci de patienter une minute." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let data: ForgotInput;
  try {
    data = (await req.json()) as ForgotInput;
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  if (isHoneypotFilled(data.company)) return NextResponse.json({ ok: true });

  const errors = validateForgot(data);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const email = data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (user) {
    const token = generateToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + TTL_MS),
      },
    });
    const link = `${site.url}/reinitialiser-mot-de-passe?token=${token}`;
    await sendNotification({
      channel: "email",
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      message: `Pour réinitialiser votre mot de passe, cliquez sur ce lien (valable 1 heure) : ${link}`,
      event: "password_reset",
      userId: user.id,
      critical: true, // sécurité : toujours émis
    });
  }

  return NextResponse.json({ ok: true });
}
