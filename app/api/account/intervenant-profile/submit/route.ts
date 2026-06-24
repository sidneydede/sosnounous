import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { PROFILE_STATUS, parseList } from "@/lib/profiles";

/**
 * Soumission du profil à la vérification de l'agence (RG-07 : DRAFT → SUBMITTED).
 * Exige un profil suffisamment complet pour être traité.
 */
export async function POST() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.INTERVENANT)
    return NextResponse.json({ ok: false, error: "Réservé aux intervenants." }, { status: 403 });

  const profile = await prisma.intervenantProfile.findUnique({ where: { userId: me.id } });
  if (!profile)
    return NextResponse.json(
      { ok: false, error: "Complétez d'abord votre profil." },
      { status: 422 },
    );

  // Complétude minimale avant soumission
  const missing: string[] = [];
  if (parseList(profile.metiers).length === 0) missing.push("au moins un métier");
  if (parseList(profile.zones).length === 0) missing.push("au moins une zone d'intervention");
  if (parseList(profile.missionTypes).length === 0) missing.push("un type de mission");
  if (missing.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Profil incomplet : ${missing.join(", ")}.` },
      { status: 422 },
    );
  }

  // Ne re-soumet que depuis le brouillon (évite de réinitialiser une vérification en cours)
  if (profile.status === PROFILE_STATUS.DRAFT) {
    await prisma.intervenantProfile.update({
      where: { id: profile.id },
      data: { status: PROFILE_STATUS.SUBMITTED, submittedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true, status: PROFILE_STATUS.SUBMITTED });
}
