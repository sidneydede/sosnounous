import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { logActivity, FAMILY_INTEREST } from "@/lib/demandes";

/** La famille exprime son intérêt pour un profil proposé (M6 — RG-21). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.FAMILY)
    return NextResponse.json({ ok: false, error: "Réservé aux familles." }, { status: 403 });

  const { id } = await params;
  let body: { interest?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const interest = body.interest;
  if (interest !== FAMILY_INTEREST.INTERESTED && interest !== FAMILY_INTEREST.DECLINED) {
    return NextResponse.json({ ok: false, error: "Valeur invalide." }, { status: 422 });
  }

  const proposition = await prisma.proposition.findUnique({
    where: { id },
    include: { demande: { select: { familyId: true } } },
  });
  // RG-25 : la famille n'accède qu'à ses propres propositions
  if (!proposition || proposition.demande.familyId !== me.id) {
    return NextResponse.json({ ok: false, error: "Proposition introuvable." }, { status: 404 });
  }

  await prisma.proposition.update({ where: { id }, data: { familyInterest: interest } });
  await logActivity({
    demandeId: proposition.demandeId,
    propositionId: id,
    kind: "INTEREST",
    message: interest === FAMILY_INTEREST.INTERESTED ? "Famille intéressée par un profil" : "Famille a décliné un profil",
    performedById: me.id,
  });

  return NextResponse.json({ ok: true });
}
