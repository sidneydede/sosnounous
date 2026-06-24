import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { logActivity, INTERVENANT_RESPONSE } from "@/lib/demandes";

/** L'intervenant accepte ou refuse une proposition de mission (M6 — RG-21). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.INTERVENANT)
    return NextResponse.json({ ok: false, error: "Réservé aux intervenants." }, { status: 403 });

  const { id } = await params;
  let body: { response?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const response = body.response;
  if (response !== INTERVENANT_RESPONSE.ACCEPTED && response !== INTERVENANT_RESPONSE.REFUSED) {
    return NextResponse.json({ ok: false, error: "Valeur invalide." }, { status: 422 });
  }

  const proposition = await prisma.proposition.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  });
  if (!proposition || proposition.profile.userId !== me.id) {
    return NextResponse.json({ ok: false, error: "Proposition introuvable." }, { status: 404 });
  }

  await prisma.proposition.update({ where: { id }, data: { intervenantResponse: response } });
  await logActivity({
    demandeId: proposition.demandeId,
    propositionId: id,
    kind: "RESPONSE",
    message: response === INTERVENANT_RESPONSE.ACCEPTED ? "Intervenant a accepté une proposition" : "Intervenant a refusé une proposition",
    performedById: me.id,
  });

  return NextResponse.json({ ok: true });
}
