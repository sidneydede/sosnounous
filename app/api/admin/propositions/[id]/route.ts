import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import {
  logActivity,
  DEMANDE_STATUS,
  PROPOSITION_STATUS,
  propositionStatusLabels,
  type PropositionStatus,
} from "@/lib/demandes";
import { sendNotification } from "@/lib/notifications";

/**
 * Pilotage d'une proposition par l'agence (M6 — RG-21/22/23/24).
 */
const SETTABLE: PropositionStatus[] = [
  PROPOSITION_STATUS.RECEIVED,
  PROPOSITION_STATUS.IN_VERIFICATION,
  PROPOSITION_STATUS.PROPOSED,
  PROPOSITION_STATUS.RETAINED,
  PROPOSITION_STATUS.MEETING_PLANNED,
  PROPOSITION_STATUS.PLACED,
  PROPOSITION_STATUS.REJECTED,
];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.ADMIN)
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const { id } = await params;
  const proposition = await prisma.proposition.findUnique({
    where: { id },
    include: { demande: { select: { id: true, familyId: true, contactEmail: true, contactPhone: true } } },
  });
  if (!proposition) return NextResponse.json({ ok: false, error: "Proposition introuvable." }, { status: 404 });

  let body: { action?: string; status?: string; meetingAt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const log = (kind: string, message: string) =>
    logActivity({ demandeId: proposition.demandeId, propositionId: id, kind, message, performedById: me.id });

  switch (body.action) {
    case "set_status": {
      const next = body.status as PropositionStatus;
      if (!SETTABLE.includes(next)) {
        return NextResponse.json({ ok: false, error: "Statut invalide." }, { status: 422 });
      }
      await prisma.proposition.update({ where: { id }, data: { status: next } });
      await log("STATUS", `Proposition → ${propositionStatusLabels[next]}`);
      break;
    }

    case "release_coordinates":
      // RG-22 : divulgation des coordonnées validée par l'agence
      await prisma.proposition.update({ where: { id }, data: { coordinatesReleased: true } });
      await log("STATUS", "Coordonnées communiquées (mise en relation validée)");
      break;

    case "plan_meeting": {
      const when = body.meetingAt ? new Date(body.meetingAt) : null;
      await prisma.proposition.update({
        where: { id },
        data: { status: PROPOSITION_STATUS.MEETING_PLANNED, meetingAt: when },
      });
      await log("MEETING", `Rencontre planifiée${when ? ` le ${when.toLocaleString("fr-FR")}` : ""}`);
      await sendNotification({
        channel: "email",
        to: proposition.demande.contactEmail,
        subject: "Rencontre planifiée",
        message: "Une rencontre a été planifiée avec un intervenant. Détails dans votre espace.",
        event: "rencontre",
        userId: proposition.demande.familyId ?? undefined,
      });
      break;
    }

    case "place":
      // RG-24 : placement conclu → suivi qualité + éligibilité avis ; RG-22 coordonnées
      await prisma.$transaction([
        prisma.proposition.update({
          where: { id },
          data: { status: PROPOSITION_STATUS.PLACED, coordinatesReleased: true },
        }),
        prisma.demande.update({
          where: { id: proposition.demandeId },
          data: { status: DEMANDE_STATUS.CONCLUDED },
        }),
      ]);
      await log("PLACEMENT", "Placement confirmé");
      await sendNotification({
        channel: "email",
        to: proposition.demande.contactEmail,
        subject: "Placement confirmé",
        message: "Votre placement est confirmé. Merci de votre confiance ! Vous pourrez bientôt laisser un avis.",
        event: "placement",
        userId: proposition.demande.familyId ?? undefined,
      });
      break;

    case "reject":
      await prisma.proposition.update({ where: { id }, data: { status: PROPOSITION_STATUS.REJECTED } });
      await log("STATUS", "Proposition écartée");
      break;

    default:
      return NextResponse.json({ ok: false, error: "Action inconnue." }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
