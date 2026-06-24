import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/auth/roles";
import { PUBLISHABLE_STATUSES, PROFILE_STATUS } from "@/lib/profiles";
import { DEMANDE_STATUS, PROPOSITION_STATUS } from "@/lib/demandes";
import { REVIEW_STATUS } from "@/lib/reviews";

/**
 * Indicateurs de pilotage de l'agence (M9 — US-15, §3.10).
 * Calculés par agrégation sur les données existantes.
 */

export interface AdminStats {
  families: number;
  intervenants: number;
  demandesTotal: number;
  demandesByStatus: Record<string, number>;
  placements: number;
  conversionRate: number; // placements / demandes (%)
  profilesTotal: number;
  profilesVerified: number;
  profilesPendingReview: number;
  verifiedRate: number; // part de profils vérifiés (%)
  avgRating: number | null;
  reviewsApproved: number;
  reviewsPending: number;
  avgFirstProposalDays: number | null;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [
    families,
    intervenants,
    demandesTotal,
    demandeGroups,
    placements,
    profilesTotal,
    profilesVerified,
    profilesPendingReview,
    reviewAgg,
    reviewsPending,
    demandesWithProps,
  ] = await Promise.all([
    prisma.user.count({ where: { role: ROLES.FAMILY } }),
    prisma.user.count({ where: { role: ROLES.INTERVENANT } }),
    prisma.demande.count(),
    prisma.demande.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.proposition.count({ where: { status: PROPOSITION_STATUS.PLACED } }),
    prisma.intervenantProfile.count(),
    prisma.intervenantProfile.count({ where: { status: { in: PUBLISHABLE_STATUSES } } }),
    prisma.intervenantProfile.count({
      where: { status: { in: [PROFILE_STATUS.SUBMITTED, PROFILE_STATUS.IN_REVIEW] } },
    }),
    prisma.review.aggregate({
      where: { status: REVIEW_STATUS.APPROVED },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    prisma.review.count({ where: { status: REVIEW_STATUS.PENDING } }),
    // Pour le délai moyen de première proposition
    prisma.demande.findMany({
      where: { propositions: { some: {} } },
      select: { createdAt: true, propositions: { select: { createdAt: true }, orderBy: { createdAt: "asc" }, take: 1 } },
    }),
  ]);

  const demandesByStatus: Record<string, number> = {};
  for (const g of demandeGroups) demandesByStatus[g.status] = g._count._all;

  const conversionRate = demandesTotal > 0 ? Math.round((placements / demandesTotal) * 100) : 0;
  const verifiedRate = profilesTotal > 0 ? Math.round((profilesVerified / profilesTotal) * 100) : 0;

  // Délai moyen (jours) entre dépôt de la demande et première proposition
  let avgFirstProposalDays: number | null = null;
  const delays = demandesWithProps
    .map((d) => {
      const first = d.propositions[0]?.createdAt;
      if (!first) return null;
      return (first.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    })
    .filter((v): v is number => v !== null && v >= 0);
  if (delays.length > 0) {
    avgFirstProposalDays = Math.round((delays.reduce((a, b) => a + b, 0) / delays.length) * 10) / 10;
  }

  return {
    families,
    intervenants,
    demandesTotal,
    demandesByStatus,
    placements,
    conversionRate,
    profilesTotal,
    profilesVerified,
    profilesPendingReview,
    verifiedRate,
    avgRating: reviewAgg._count._all > 0 ? reviewAgg._avg.rating : null,
    reviewsApproved: reviewAgg._count._all,
    reviewsPending,
    avgFirstProposalDays,
  };
}

/** Calcule la part conclue (demandes conclues / total). */
export function concludedShare(stats: AdminStats): number {
  const concluded = stats.demandesByStatus[DEMANDE_STATUS.CONCLUDED] ?? 0;
  return stats.demandesTotal > 0 ? Math.round((concluded / stats.demandesTotal) * 100) : 0;
}
