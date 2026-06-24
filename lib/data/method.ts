/**
 * Parcours guidé "Notre méthode" — réassurance par étapes.
 * Source : CDC §1.5 (parcours en étapes), §2.3 (parcours Famille), §5.4.
 * Modèle hybride : l'agence présélectionne et propose des profils vérifiés (CDC §1.5).
 */

export interface MethodStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

/** Parcours Famille (CDC §2.3). */
export const familySteps: MethodStep[] = [
  {
    number: 1,
    title: "Vous exprimez votre besoin",
    description:
      "Décrivez en quelques étapes le service recherché, la fréquence, vos horaires et votre commune — ou demandez un devis.",
    icon: "edit",
  },
  {
    number: 2,
    title: "L'agence présélectionne",
    description:
      "Un conseiller analyse votre demande et sélectionne, dans notre base vérifiée, les profils les plus adaptés.",
    icon: "search",
  },
  {
    number: 3,
    title: "Vous recevez des profils",
    description:
      "Consultez dans votre espace les profils proposés : expérience, références et disponibilités.",
    icon: "users",
  },
  {
    number: 4,
    title: "Rencontre & mise en place",
    description:
      "Échangez avec le ou les candidats retenus, rencontrez-les, puis démarrez la prestation en toute confiance.",
    icon: "handshake",
  },
  {
    number: 5,
    title: "Suivi & accompagnement",
    description:
      "L'agence reste à vos côtés : suivi qualité, médiation, remplacement et dépôt d'avis après la prestation.",
    icon: "heart",
  },
];

/** Parcours Intervenant (CDC §2.4). */
export const interventantSteps: MethodStep[] = [
  {
    number: 1,
    title: "Vous candidatez en ligne",
    description:
      "Indiquez votre métier, votre expérience, vos disponibilités et votre zone d'intervention.",
    icon: "edit",
  },
  {
    number: 2,
    title: "Vous créez votre profil",
    description:
      "Complétez votre profil, déposez vos pièces justificatives et vos références.",
    icon: "profile",
  },
  {
    number: 3,
    title: "L'agence vérifie votre profil",
    description:
      "Vérification de l'identité et des références ; votre profil passe au statut « vérifié ».",
    icon: "shield",
  },
  {
    number: 4,
    title: "Vous êtes proposé(e) aux familles",
    description:
      "Vous recevez des offres compatibles avec votre profil et vos disponibilités.",
    icon: "users",
  },
  {
    number: 5,
    title: "Mission, suivi & formation",
    description:
      "Vous réalisez vos missions, suivez votre planning et accédez progressivement à des conseils et formations.",
    icon: "graduation",
  },
];

/** Engagements de confiance (CDC §1.5 réassurance, §2.15 badges). */
export const trustCommitments = [
  {
    title: "Vérification d'identité",
    description:
      "Chaque intervenant fait l'objet d'une vérification d'identité avant toute proposition.",
  },
  {
    title: "Références vérifiées",
    description:
      "Anciens employeurs et recommandations sont contrôlés par l'agence.",
  },
  {
    title: "Confidentialité & discrétion",
    description:
      "Les coordonnées restent masquées tant que la mise en relation n'est pas validée par l'agence.",
  },
  {
    title: "Charte éthique",
    description:
      "Un cadre éthique pour des relations de travail respectueuses et formalisées.",
  },
  {
    title: "Accompagnement continu",
    description:
      "Un suivi avant, pendant et après la mise en relation, avec médiation si besoin.",
  },
  {
    title: "Formation des intervenants",
    description:
      "Une montée en compétences pour un service plus professionnel et de qualité.",
  },
];
