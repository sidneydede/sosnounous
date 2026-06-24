import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { REVIEW_STATUS, recomputeProfileRating } from "@/lib/reviews";

/**
 * Modération d'un avis par l'agence (M11 — RG-31/34).
 * approve / reject / hide / reply. La note moyenne du profil est recalculée
 * à chaque changement affectant l'ensemble des avis publiés.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.ADMIN)
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ ok: false, error: "Avis introuvable." }, { status: 404 });

  let body: { action?: string; reply?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const moderate = (status: string) =>
    prisma.review.update({
      where: { id },
      data: { status, moderatedById: me.id, moderatedAt: new Date() },
    });

  switch (body.action) {
    case "approve":
      await moderate(REVIEW_STATUS.APPROVED);
      await recomputeProfileRating(review.profileId);
      break;
    case "reject":
      await moderate(REVIEW_STATUS.REJECTED);
      await recomputeProfileRating(review.profileId);
      break;
    case "hide":
      await moderate(REVIEW_STATUS.HIDDEN);
      await recomputeProfileRating(review.profileId);
      break;
    case "reply": {
      const reply = (body.reply ?? "").trim();
      await prisma.review.update({ where: { id }, data: { agencyReply: reply || null } });
      break;
    }
    default:
      return NextResponse.json({ ok: false, error: "Action inconnue." }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
