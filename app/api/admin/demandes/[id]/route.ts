import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { PUBLISHABLE_STATUSES } from "@/lib/profiles";
import {
  logActivity,
  DEMANDE_STATUS,
  PROPOSITION_STATUS,
  SETTABLE_DEMANDE_STATUSES,
  demandeStatusLabels,
  type DemandeStatus,
} from "@/lib/demandes";
import { sendNotification } from "@/lib/notifications";

/**
 * Traitement d'une demande par l'agence (M5/M6 — RG-17/20/23).
 * Qualification, affectation, devis, présélection de profils, transitions de statut.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.ADMIN)
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const { id } = await params;
  const demande = await prisma.demande.findUnique({ where: { id } });
  if (!demande) return NextResponse.json({ ok: false, error: "Demande introuvable." }, { status: 404 });

  let body: {
    action?: string;
    status?: string;
    profileId?: string;
    quoteAmount?: string;
    quoteNote?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const log = (kind: string, message: string) =>
    logActivity({ demandeId: id, kind, message, performedById: me.id });

  switch (body.action) {
    case "qualify":
      await prisma.demande.update({ where: { id }, data: { status: DEMANDE_STATUS.QUALIFIED } });
      await log("STATUS", "Demande qualifiée");
      break;

    case "assign_me":
      await prisma.demande.update({ where: { id }, data: { assignedToId: me.id } });
      await log("NOTE", `Affectée à ${me.firstName} ${me.lastName}`);
      break;

    case "set_quote":
      await prisma.demande.update({
        where: { id },
        data: {
          quoteAmount: body.quoteAmount?.trim() || null,
          quoteNote: body.quoteNote?.trim() || null,
          quotedAt: new Date(),
        },
      });
      await log("QUOTE", `Devis établi : ${body.quoteAmount ?? "—"}`);
      break;

    case "save_notes":
      await prisma.demande.update({
        where: { id },
        data: { internalNotes: (body.notes ?? "").trim() || null },
      });
      break;

    case "set_status": {
      const next = body.status as DemandeStatus;
      if (!SETTABLE_DEMANDE_STATUSES.includes(next)) {
        return NextResponse.json({ ok: false, error: "Statut invalide." }, { status: 422 });
      }
      await prisma.demande.update({ where: { id }, data: { status: next } });
      await log("STATUS", `Statut → ${demandeStatusLabels[next]}`);
      break;
    }

    case "add_proposition": {
      const profileId = body.profileId ?? "";
      const profile = await prisma.intervenantProfile.findUnique({
        where: { id: profileId },
        include: { user: { select: { firstName: true, lastName: true } } },
      });
      // RG-08 : seul un profil vérifié/actif et non blacklisté peut être proposé
      if (!profile || !PUBLISHABLE_STATUSES.includes(profile.status as never) || profile.blacklisted) {
        return NextResponse.json(
          { ok: false, error: "Profil non proposable (non vérifié ou blacklisté)." },
          { status: 422 },
        );
      }
      const exists = await prisma.proposition.findUnique({
        where: { demandeId_profileId: { demandeId: id, profileId } },
      });
      if (exists) {
        return NextResponse.json({ ok: false, error: "Profil déjà proposé." }, { status: 409 });
      }
      await prisma.proposition.create({
        data: { demandeId: id, profileId, status: PROPOSITION_STATUS.PROPOSED },
      });
      // La demande passe au statut « profils proposés »
      await prisma.demande.update({ where: { id }, data: { status: DEMANDE_STATUS.PROPOSED } });
      await log("PROPOSITION", `Profil proposé : ${profile.user.firstName} ${profile.user.lastName}`);

      // Notification famille (si rattachée)
      if (demande.familyId) {
        await sendNotification({
          channel: "email",
          to: demande.contactEmail,
          subject: "De nouveaux profils vous sont proposés",
          message: "Un conseiller vous a proposé des profils vérifiés. Consultez-les dans votre espace.",
          event: "profils_proposes",
          userId: demande.familyId,
        });
      }
      break;
    }

    default:
      return NextResponse.json({ ok: false, error: "Action inconnue." }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
