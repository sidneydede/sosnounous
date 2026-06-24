import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { PROFILE_STATUS, type ProfileStatus } from "@/lib/profiles";

/**
 * Actions de vérification / gestion d'un profil par l'agence (M3 — US-04, RG-07/10).
 * Toute action sensible est tracée via VerificationEvent (RG-10 : qui, quand, résultat).
 */

const SETTABLE_STATUSES: ProfileStatus[] = [
  PROFILE_STATUS.IN_REVIEW,
  PROFILE_STATUS.VERIFIED,
  PROFILE_STATUS.ACTIVE,
  PROFILE_STATUS.SUSPENDED,
  PROFILE_STATUS.ARCHIVED,
  PROFILE_STATUS.DRAFT,
];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.ADMIN)
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const { id } = await params;
  const profile = await prisma.intervenantProfile.findUnique({ where: { id } });
  if (!profile) return NextResponse.json({ ok: false, error: "Profil introuvable." }, { status: 404 });

  let body: { action?: string; status?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const log = (type: string, result: string, note?: string) =>
    prisma.verificationEvent.create({
      data: { profileId: profile.id, type, result, note, performedById: me.id },
    });

  switch (body.action) {
    case "identity_pass":
      await prisma.intervenantProfile.update({ where: { id }, data: { identityVerified: true } });
      await log("IDENTITY", "PASS");
      break;
    case "identity_fail":
      await prisma.intervenantProfile.update({ where: { id }, data: { identityVerified: false } });
      await log("IDENTITY", "FAIL");
      break;
    case "references_pass":
      await prisma.$transaction([
        prisma.intervenantProfile.update({ where: { id }, data: { referencesVerified: true } }),
        prisma.reference.updateMany({ where: { profileId: id }, data: { status: "VERIFIED" } }),
      ]);
      await log("REFERENCES", "PASS");
      break;
    case "references_fail":
      await prisma.intervenantProfile.update({ where: { id }, data: { referencesVerified: false } });
      await log("REFERENCES", "FAIL");
      break;
    case "toggle_trained":
      await prisma.intervenantProfile.update({ where: { id }, data: { trained: !profile.trained } });
      await log("APTITUDE", profile.trained ? "PENDING" : "PASS", "Statut « formé » mis à jour");
      break;
    case "toggle_blacklist":
      await prisma.intervenantProfile.update({
        where: { id },
        data: { blacklisted: !profile.blacklisted },
      });
      await log("IDENTITY", "PENDING", profile.blacklisted ? "Retiré de la blacklist" : "Ajouté à la blacklist");
      break;
    case "save_notes":
      await prisma.intervenantProfile.update({
        where: { id },
        data: { internalNotes: (body.notes ?? "").trim() || null },
      });
      break;
    case "set_status": {
      const next = body.status as ProfileStatus;
      if (!SETTABLE_STATUSES.includes(next)) {
        return NextResponse.json({ ok: false, error: "Statut invalide." }, { status: 422 });
      }
      await prisma.intervenantProfile.update({
        where: { id },
        data: {
          status: next,
          verifiedAt: next === PROFILE_STATUS.VERIFIED ? new Date() : profile.verifiedAt,
        },
      });
      await log("IDENTITY", "PENDING", `Changement de statut → ${next}`);
      break;
    }
    default:
      return NextResponse.json({ ok: false, error: "Action inconnue." }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
