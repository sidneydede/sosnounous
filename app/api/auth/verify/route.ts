import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccountCode } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";
import { rateLimit, clientKey } from "@/lib/rateLimit";

/**
 * Vérification du compte par code OTP (RG-03).
 * En cas de succès, le compte est activé et une session est ouverte.
 */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "verify"), { max: 10, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Trop de tentatives. Merci de réessayer dans un instant." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let body: { email?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const code = (body.code ?? "").trim();
  if (!email || !code) {
    return NextResponse.json({ ok: false, error: "Code requis." }, { status: 422 });
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    // Réponse neutre (ne pas révéler l'existence d'un compte)
    return NextResponse.json({ ok: false, error: "Code invalide ou expiré." }, { status: 422 });
  }

  const result = await verifyAccountCode(user.id, code);
  if (!result.ok) {
    const messages: Record<string, string> = {
      invalid: "Code invalide.",
      expired: "Ce code a expiré. Demandez un nouveau code.",
      too_many_attempts: "Trop de tentatives. Demandez un nouveau code.",
      not_found: "Aucun code en attente. Demandez un nouveau code.",
    };
    return NextResponse.json(
      { ok: false, error: messages[result.reason] ?? "Code invalide." },
      { status: 422 },
    );
  }

  // Compte activé : ouverture de session
  await createSession(user.id, req.headers.get("user-agent") ?? undefined);
  return NextResponse.json({ ok: true });
}
