import { prisma } from "@/lib/db";
import {
  PUBLISHABLE_STATUSES,
  parseList,
  toPublicProfile,
  type PublicProfile,
} from "@/lib/profiles";

/**
 * Moteur de recherche & matching (M4 — RG-12 à RG-15).
 *
 * - RG-12 : seuls les profils « vérifiés / actifs » (et non blacklistés) sont retournés.
 * - RG-13 : score pondéré sur service, zone, fréquence, expérience, langues.
 * - RG-15 : la projection renvoyée est anonymisée (toPublicProfile).
 *
 * NB : les critères « liste » étant stockés en JSON, le filtrage/scoring fin est
 * réalisé en mémoire après un préfiltre SQL sur le statut. Pour de gros volumes,
 * migrer ces champs vers des colonnes/relations indexées (PostgreSQL).
 */

export interface SearchCriteria {
  metier?: string;
  zone?: string;
  frequency?: string; // Ponctuel | Régulier | Temps plein
  language?: string;
  minExperience?: number;
  sort?: "relevance" | "rating" | "experience";
}

/** Pondérations du score de pertinence (RG-13). */
const WEIGHTS = {
  metier: 40,
  zone: 25,
  frequency: 15,
  language: 10,
  experience: 10,
};

function eqInsensitive(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Calcule un score de pertinence d'un profil au regard des critères. */
export function scoreProfile(criteria: SearchCriteria, p: PublicProfile): number {
  let score = 0;

  if (criteria.metier) {
    if (p.metiers.some((m) => eqInsensitive(m, criteria.metier!))) score += WEIGHTS.metier;
  } else {
    score += WEIGHTS.metier / 2; // pas de critère : neutre
  }

  if (criteria.zone) {
    if (p.zones.some((z) => z.toLowerCase().includes(criteria.zone!.toLowerCase())))
      score += WEIGHTS.zone;
  } else {
    score += WEIGHTS.zone / 2;
  }

  if (criteria.frequency) {
    if (p.missionTypes.some((f) => eqInsensitive(f, criteria.frequency!)))
      score += WEIGHTS.frequency;
  } else {
    score += WEIGHTS.frequency / 2;
  }

  if (criteria.language) {
    if (p.languages.some((l) => eqInsensitive(l, criteria.language!)))
      score += WEIGHTS.language;
  } else {
    score += WEIGHTS.language / 2;
  }

  // Expérience : bonus proportionnel (plafonné à 10 ans)
  score += Math.min(p.experienceYears, 10) / 10 * WEIGHTS.experience;

  return Math.round(score);
}

/** Indique si un profil satisfait les filtres « durs » (exclusion). */
function matchesHardFilters(criteria: SearchCriteria, p: PublicProfile): boolean {
  if (criteria.metier && !p.metiers.some((m) => eqInsensitive(m, criteria.metier!)))
    return false;
  if (
    criteria.zone &&
    !p.zones.some((z) => z.toLowerCase().includes(criteria.zone!.toLowerCase()))
  )
    return false;
  if (
    criteria.frequency &&
    !p.missionTypes.some((f) => eqInsensitive(f, criteria.frequency!))
  )
    return false;
  if (
    criteria.language &&
    !p.languages.some((l) => eqInsensitive(l, criteria.language!))
  )
    return false;
  if (criteria.minExperience && p.experienceYears < criteria.minExperience) return false;
  return true;
}

/**
 * Recherche les profils proposables correspondant aux critères (RG-12/13/15).
 * Retourne des profils anonymisés, triés selon `sort`.
 */
export async function searchProfiles(criteria: SearchCriteria): Promise<PublicProfile[]> {
  const rows = await prisma.intervenantProfile.findMany({
    where: { status: { in: PUBLISHABLE_STATUSES }, blacklisted: false },
    include: { user: { select: { firstName: true, lastName: true } } },
  });

  const profiles = rows
    .map(toPublicProfile)
    .filter((p) => matchesHardFilters(criteria, p))
    .map((p) => ({ ...p, score: scoreProfile(criteria, p) }));

  const sort = criteria.sort ?? "relevance";
  profiles.sort((a, b) => {
    if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    if (sort === "experience") return b.experienceYears - a.experienceYears;
    return (b.score ?? 0) - (a.score ?? 0);
  });

  return profiles;
}

/** Valeurs distinctes pour alimenter les filtres (zones, langues). */
export async function getSearchFacets(): Promise<{ zones: string[]; languages: string[] }> {
  const rows = await prisma.intervenantProfile.findMany({
    where: { status: { in: PUBLISHABLE_STATUSES }, blacklisted: false },
    select: { zones: true, languages: true },
  });
  const zones = new Set<string>();
  const languages = new Set<string>();
  for (const r of rows) {
    parseList(r.zones).forEach((z) => zones.add(z));
    parseList(r.languages).forEach((l) => languages.add(l));
  }
  return {
    zones: [...zones].sort(),
    languages: [...languages].sort(),
  };
}
