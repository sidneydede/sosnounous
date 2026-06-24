import { prisma } from "@/lib/db";
import { testimonials as staticTestimonials, type Testimonial } from "@/lib/data/testimonials";

/**
 * Helpers du module Avis (M11 — RG-31/32/34).
 */

export const REVIEW_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  HIDDEN: "HIDDEN",
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

export const reviewStatusLabels: Record<ReviewStatus, string> = {
  PENDING: "En attente de modération",
  APPROVED: "Publié",
  REJECTED: "Rejeté",
  HIDDEN: "Masqué",
};

/** Valide une saisie d'avis (échelle 1 à 5 + commentaire). */
export function validateReview(rating: number, comment: string): string | null {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return "La note doit être comprise entre 1 et 5.";
  if (!comment || comment.trim().length < 10)
    return "Merci de détailler votre avis (10 caractères minimum).";
  if (comment.length > 1500) return "Avis trop long.";
  return null;
}

/**
 * Recalcule la note moyenne et le nombre d'avis publiés d'un profil.
 * À appeler après toute modération modifiant le jeu d'avis approuvés.
 */
export async function recomputeProfileRating(profileId: string): Promise<void> {
  const agg = await prisma.review.aggregate({
    where: { profileId, status: REVIEW_STATUS.APPROVED },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await prisma.intervenantProfile.update({
    where: { id: profileId },
    data: {
      rating: agg._count._all > 0 ? agg._avg.rating : null,
      ratingCount: agg._count._all,
    },
  });
}

/**
 * Témoignages publics pour le site vitrine : avis approuvés (anonymisés),
 * avec repli sur les témoignages illustratifs si aucun avis publié.
 */
export async function getPublishedTestimonials(limit = 3): Promise<Testimonial[]> {
  let reviews;
  try {
    reviews = await prisma.review.findMany({
      where: { status: REVIEW_STATUS.APPROVED },
      include: {
        author: { select: { firstName: true, lastName: true, commune: true } },
        profile: { select: { metiers: true } },
      },
      orderBy: { moderatedAt: "desc" },
      take: limit,
    });
  } catch {
    // Base indisponible (ex. build sans BDD) : repli sur les témoignages par défaut.
    return staticTestimonials.slice(0, limit);
  }

  if (reviews.length === 0) return staticTestimonials.slice(0, limit);

  return reviews.map((r) => {
    let metier = "";
    try {
      const parsed = JSON.parse(r.profile.metiers) as string[];
      metier = Array.isArray(parsed) && parsed[0] ? parsed[0] : "";
    } catch {
      metier = "";
    }
    const initial = (r.author.lastName ?? "").charAt(0).toUpperCase();
    return {
      quote: r.comment,
      author: `${r.author.firstName} ${initial}.`.trim(),
      role: [`Famille`, r.author.commune, metier].filter(Boolean).join(" · "),
      rating: r.rating,
    };
  });
}
