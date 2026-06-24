import { prisma } from "@/lib/db";
import type { IntervenantProfile, User } from "@/lib/generated/prisma";

/**
 * Helpers du module Profils intervenants (M3).
 * Les champs « liste » sont stockés en JSON (string) — voir parseList/serializeList.
 */

/** Cycle de vie du profil (RG-07). */
export const PROFILE_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  IN_REVIEW: "IN_REVIEW",
  VERIFIED: "VERIFIED",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  ARCHIVED: "ARCHIVED",
} as const;

export type ProfileStatus = (typeof PROFILE_STATUS)[keyof typeof PROFILE_STATUS];

export const profileStatusLabels: Record<ProfileStatus, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumis",
  IN_REVIEW: "En vérification",
  VERIFIED: "Vérifié",
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  ARCHIVED: "Archivé",
};

/** RG-08 / RG-12 : statuts pour lesquels un profil est proposable / visible. */
export const PUBLISHABLE_STATUSES: ProfileStatus[] = [
  PROFILE_STATUS.VERIFIED,
  PROFILE_STATUS.ACTIVE,
];

export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function serializeList(values: string[]): string {
  return JSON.stringify(values.filter(Boolean));
}

/** Projection publique ANONYMISÉE d'un profil (RG-09, RG-15). */
export interface PublicProfile {
  id: string;
  displayName: string; // prénom + initiale uniquement
  headline: string | null;
  metiers: string[];
  zones: string[];
  experienceYears: number;
  languages: string[];
  missionTypes: string[];
  hasDrivingLicense: boolean;
  rating: number | null;
  ratingCount: number;
  identityVerified: boolean;
  referencesVerified: boolean;
  trained: boolean;
  /** Score de pertinence (renseigné lors d'une recherche). */
  score?: number;
}

type ProfileWithUser = IntervenantProfile & { user: Pick<User, "firstName" | "lastName"> };

/** Construit la vue publique anonymisée (jamais de coordonnées — RG-09/15). */
export function toPublicProfile(p: ProfileWithUser): PublicProfile {
  const initial = (p.user.lastName ?? "").charAt(0).toUpperCase();
  return {
    id: p.id,
    displayName: `${p.user.firstName} ${initial}.`.trim(),
    headline: p.headline,
    metiers: parseList(p.metiers),
    zones: parseList(p.zones),
    experienceYears: p.experienceYears,
    languages: parseList(p.languages),
    missionTypes: parseList(p.missionTypes),
    hasDrivingLicense: p.hasDrivingLicense,
    rating: p.rating,
    ratingCount: p.ratingCount,
    identityVerified: p.identityVerified,
    referencesVerified: p.referencesVerified,
    trained: p.trained,
  };
}

/**
 * Récupère le profil de l'intervenant, en le créant (statut brouillon) au besoin.
 * Le profil est pré-rempli à partir des informations d'inscription.
 */
export async function getOrCreateProfile(user: {
  id: string;
  metiers: string | null;
  commune: string;
}): Promise<IntervenantProfile> {
  const existing = await prisma.intervenantProfile.findUnique({ where: { userId: user.id } });
  if (existing) return existing;

  return prisma.intervenantProfile.create({
    data: {
      userId: user.id,
      metiers: user.metiers ?? "[]",
      zones: serializeList([user.commune]),
      missionTypes: "[]",
      status: PROFILE_STATUS.DRAFT,
    },
  });
}
