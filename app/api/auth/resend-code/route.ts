import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { issueVerificationCode } from "@/lib/auth/otp";
import { rateLimit, clientKey } from "@/lib/rateLimit";

/** Renvoi d'un code de vérification (RG-03). Réponse neutre par sécurité. */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "resend"), { max: 3, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Trop de demandes. Merci de patienter une minute." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, status: true },
  });

  // On renvoie un code uniquement pour un compte encore en attente.
  if (user && user.status === "PENDING") {
    await issueVerificationCode(user.id, "email", user.email);
  }

  // Réponse identique dans tous les cas (anti-énumération de comptes)
  return NextResponse.json({ ok: true });
}
