import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { validateRegister, type RegisterInput } from "@/lib/auth/validation";
import { issueVerificationCode } from "@/lib/auth/otp";
import { isHoneypotFilled } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { ROLES } from "@/lib/auth/roles";

/**
 * Inscription Famille / Intervenant (US-01, US-02 ; RG-01, RG-02, RG-04, RG-05).
 * Le compte est créé au statut PENDING et activé après vérification OTP (RG-03).
 */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "register"), { max: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Trop de tentatives. Merci de réessayer dans un instant." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let data: RegisterInput;
  try {
    data = (await req.json()) as RegisterInput;
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  if (isHoneypotFilled(data.company)) return NextResponse.json({ ok: true });

  const errors = validateRegister(data);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const email = data.email.trim().toLowerCase();
  const phone = data.phone.trim();

  // RG-02 : unicité e-mail / téléphone (contrôle explicite + contrainte BDD)
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
    select: { email: true, phone: true },
  });
  if (existing) {
    const fieldErrors: Record<string, string> = {};
    if (existing.email === email) fieldErrors.email = "Un compte existe déjà avec cet e-mail.";
    if (existing.phone === phone) fieldErrors.phone = "Un compte existe déjà avec ce téléphone.";
    return NextResponse.json({ ok: false, errors: fieldErrors }, { status: 409 });
  }

  const passwordHash = await hashPassword(data.password);
  const metiers =
    data.role === ROLES.INTERVENANT && data.metiers
      ? JSON.stringify(data.metiers.filter(Boolean))
      : null;

  let user;
  try {
    user = await prisma.user.create({
      data: {
        role: data.role,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email,
        phone,
        passwordHash,
        commune: data.commune.trim(),
        metiers,
        status: "PENDING",
        consentAt: new Date(), // RG-04 : consentement horodaté
      },
      select: { id: true, email: true },
    });
  } catch {
    // Contrainte d'unicité concurrente
    return NextResponse.json(
      { ok: false, error: "Un compte existe déjà avec ces informations." },
      { status: 409 },
    );
  }

  // RG-03 : envoi du code de vérification (e-mail)
  await issueVerificationCode(user.id, "email", user.email);

  return NextResponse.json({ ok: true, email: user.email });
}
