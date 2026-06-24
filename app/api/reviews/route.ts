import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { validateReview, REVIEW_STATUS } from "@/lib/reviews";
import { logActivity } from "@/lib/demandes";
import { PROPOSITION_STATUS } from "@/lib/demandes";
import { rateLimit, clientKey } from "@/lib/rateLimit";

/**
 * Dépôt d'un avis par la famille (M11 — US-14).
 * RG-27/24 : uniquement pour une prestation effectivement réalisée (placement).
 * RG-32 : rattaché à la prestation et à son auteur. L'avis est créé en attente (RG-31).
 */
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.FAMILY)
    return NextResponse.json({ ok: false, error: "Réservé aux familles." }, { status: 403 });

  const limit = rateLimit(clientKey(req, `review:${me.id}`), { max: 10, windowMs: 60_000 });
  if (!limit.allowed)
    return NextResponse.json({ ok: false, error: "Trop de tentatives." }, { status: 429 });

  let body: { propositionId?: string; rating?: number; comment?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const proposition = await prisma.proposition.findUnique({
    where: { id: body.propositionId ?? "" },
    include: { demande: { select: { familyId: true } }, review: { select: { id: true } } },
  });
  if (!proposition || proposition.demande.familyId !== me.id) {
    return NextResponse.json({ ok: false, error: "Prestation introuvable." }, { status: 404 });
  }
  // RG-27 : prestation réalisée (placée)
  if (proposition.status !== PROPOSITION_STATUS.PLACED) {
    return NextResponse.json(
      { ok: false, error: "Un avis n'est possible qu'après une prestation réalisée." },
      { status: 422 },
    );
  }
  if (proposition.review) {
    return NextResponse.json({ ok: false, error: "Vous avez déjà laissé un avis." }, { status: 409 });
  }

  const rating = Number(body.rating);
  const comment = (body.comment ?? "").trim();
  const err = validateReview(rating, comment);
  if (err) return NextResponse.json({ ok: false, error: err }, { status: 422 });

  await prisma.review.create({
    data: {
      propositionId: proposition.id,
      authorId: me.id,
      profileId: proposition.profileId,
      rating,
      comment,
      status: REVIEW_STATUS.PENDING,
    },
  });
  await logActivity({
    demandeId: proposition.demandeId,
    propositionId: proposition.id,
    kind: "NOTE",
    message: "Avis déposé par la famille (en attente de modération)",
    performedById: me.id,
  });

  return NextResponse.json({ ok: true });
}
