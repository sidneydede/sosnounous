import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getOrCreateProfile, serializeList } from "@/lib/profiles";

/**
 * Mise à jour du profil professionnel de l'intervenant (M3 — US-05).
 * Accessible uniquement au rôle Intervenant. Sauvegarde possible en brouillon.
 */
export async function PATCH(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.INTERVENANT)
    return NextResponse.json({ ok: false, error: "Réservé aux intervenants." }, { status: 403 });

  let body: {
    headline?: string;
    bio?: string;
    photoUrl?: string;
    metiers?: string[];
    zones?: string[];
    experienceYears?: number;
    languages?: string[];
    skills?: string[];
    formations?: string[];
    hasDrivingLicense?: boolean;
    missionTypes?: string[];
    availabilityDays?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const profile = await getOrCreateProfile({
    id: me.id,
    metiers: serializeList(me.metiers),
    commune: me.commune,
  });

  const experienceYears = Number.isFinite(body.experienceYears)
    ? Math.max(0, Math.min(60, Math.trunc(body.experienceYears!)))
    : profile.experienceYears;

  await prisma.intervenantProfile.update({
    where: { id: profile.id },
    data: {
      headline: body.headline?.trim() || null,
      bio: body.bio?.trim() || null,
      photoUrl: body.photoUrl?.trim() || null,
      metiers: serializeList(body.metiers ?? []),
      zones: serializeList(body.zones ?? []),
      experienceYears,
      languages: serializeList(body.languages ?? []),
      skills: serializeList(body.skills ?? []),
      formations: serializeList(body.formations ?? []),
      hasDrivingLicense: Boolean(body.hasDrivingLicense),
      missionTypes: serializeList(body.missionTypes ?? []),
      availabilityDays: serializeList(body.availabilityDays ?? []),
    },
  });

  return NextResponse.json({ ok: true });
}
