import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { toCsv, csvResponse } from "@/lib/csv";
import { reviewStatusLabels, type ReviewStatus } from "@/lib/reviews";

/** Export CSV des avis (reporting — RG-39). Réservé à l'agence. */
export async function GET() {
  const me = await getSessionUser();
  if (!me || me.role !== ROLES.ADMIN)
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const reviews = await prisma.review.findMany({
    include: {
      author: { select: { firstName: true, lastName: true } },
      profile: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["Date", "Note", "Auteur", "Intervenant", "Commentaire", "Statut", "Réponse agence"];
  const rows = reviews.map((r) => [
    new Date(r.createdAt).toLocaleString("fr-FR"),
    r.rating,
    `${r.author.firstName} ${r.author.lastName}`,
    `${r.profile.user.firstName} ${r.profile.user.lastName}`,
    r.comment,
    reviewStatusLabels[r.status as ReviewStatus] ?? r.status,
    r.agencyReply ?? "",
  ]);

  return csvResponse("avis.csv", toCsv(headers, rows));
}
