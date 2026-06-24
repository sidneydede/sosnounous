import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { rateLimit, clientKey } from "@/lib/rateLimit";

/**
 * Messagerie d'une demande : famille ↔ agence (M7 — RG-25).
 * La famille n'accède qu'à ses propres conversations ; l'agence accède à tout.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });

  const limit = rateLimit(clientKey(req, `msg:${me.id}`), { max: 20, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "Trop de messages. Patientez un instant." }, { status: 429 });
  }

  const { id } = await params;
  const demande = await prisma.demande.findUnique({ where: { id }, select: { familyId: true } });
  if (!demande) return NextResponse.json({ ok: false, error: "Demande introuvable." }, { status: 404 });

  // RG-25 : contrôle d'accès (famille propriétaire ou agence)
  const isOwnerFamily = me.role === ROLES.FAMILY && demande.familyId === me.id;
  const isAgency = me.role === ROLES.ADMIN;
  if (!isOwnerFamily && !isAgency) {
    return NextResponse.json({ ok: false, error: "Accès refusé." }, { status: 403 });
  }

  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const text = (body.body ?? "").trim();
  if (!text) return NextResponse.json({ ok: false, error: "Message vide." }, { status: 422 });
  if (text.length > 2000)
    return NextResponse.json({ ok: false, error: "Message trop long." }, { status: 422 });

  await prisma.message.create({
    data: { demandeId: id, senderId: me.id, senderRole: me.role, body: text },
  });

  return NextResponse.json({ ok: true });
}
