import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { validateLogin, type LoginInput, EMAIL_RE } from "@/lib/auth/validation";
import { createSession } from "@/lib/auth/session";
import { issueVerificationCode } from "@/lib/auth/otp";
import { isHoneypotFilled } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rateLimit";

/**
 * Connexion par e-mail ou téléphone (CDC §2.5).
 * RG-06 : verrouillage temporaire du compte après N tentatives échouées.
 */

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: Request) {
  // Rate limit par IP (complémentaire au verrouillage par compte)
  const limit = rateLimit(clientKey(req, "login"), { max: 10, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Trop de tentatives. Merci de réessayer dans un instant." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let data: LoginInput;
  try {
    data = (await req.json()) as LoginInput;
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  if (isHoneypotFilled(data.company)) {
    return NextResponse.json({ ok: false, error: "Identifiants invalides." }, { status: 401 });
  }

  const errors = validateLogin(data);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const identifier = data.identifier.trim();
  const where = EMAIL_RE.test(identifier)
    ? { email: identifier.toLowerCase() }
    : { phone: identifier };

  const user = await prisma.user.findUnique({ where });

  // Message neutre pour ne pas révéler l'existence du compte
  const invalid = NextResponse.json(
    { ok: false, error: "Identifiants invalides." },
    { status: 401 },
  );
  if (!user) return invalid;

  // RG-06 : compte verrouillé ?
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return NextResponse.json(
      {
        ok: false,
        error: `Compte temporairement verrouillé suite à plusieurs tentatives. Réessayez dans ${minutes} minute(s).`,
      },
      { status: 423 },
    );
  }

  const passwordOk = await verifyPassword(data.password, user.passwordHash);

  if (!passwordOk) {
    const attempts = user.failedLoginAttempts + 1;
    const lock = attempts >= MAX_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: lock ? 0 : attempts,
        lockedUntil: lock ? new Date(Date.now() + LOCK_MS) : null,
      },
    });
    if (lock) {
      return NextResponse.json(
        {
          ok: false,
          error: "Compte verrouillé pendant 15 minutes suite à trop de tentatives.",
        },
        { status: 423 },
      );
    }
    return invalid;
  }

  // RG-03 : compte non vérifié -> renvoyer vers la vérification
  if (user.status === "PENDING") {
    await issueVerificationCode(user.id, "email", user.email);
    return NextResponse.json(
      {
        ok: false,
        needsVerification: true,
        email: user.email,
        error: "Votre compte n'est pas encore vérifié. Un nouveau code vous a été envoyé.",
      },
      { status: 403 },
    );
  }

  if (user.status === "SUSPENDED") {
    return NextResponse.json(
      { ok: false, error: "Votre compte est suspendu. Contactez l'agence." },
      { status: 403 },
    );
  }

  // Succès : réinitialisation du compteur + ouverture de session
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
  await createSession(user.id, req.headers.get("user-agent") ?? undefined);

  return NextResponse.json({ ok: true, role: user.role });
}
