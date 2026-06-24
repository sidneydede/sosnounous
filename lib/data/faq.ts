/**
 * FAQ — réassurance et conseils (CDC §2.15, §3.11, §5.4 "FAQ riche").
 * Contenu rédactionnel basé sur le positionnement du CDC. À enrichir via le CMS.
 */

export interface FaqItem {
  question: string;
  answer: string;
  category: "Familles" | "Intervenants" | "Sécurité & confiance" | "Tarifs";
}

export const faqItems: FaqItem[] = [
  {
    category: "Familles",
    question: "Comment se déroule une demande de garde ou de personnel ?",
    answer:
      "Vous décrivez votre besoin en quelques étapes (type de service, fréquence, horaires, commune). Un conseiller analyse votre demande, présélectionne des profils vérifiés dans notre base, puis vous les propose dans votre espace personnel. Vous rencontrez les candidats retenus avant la mise en place.",
  },
  {
    category: "Familles",
    question: "Dois-je créer un compte pour déposer une demande ?",
    answer:
      "Vous pouvez démarrer une demande en tant que visiteur. La création de compte intervient à la fin du parcours pour vous permettre de suivre vos demandes, consulter les profils proposés et échanger avec votre conseiller.",
  },
  {
    category: "Sécurité & confiance",
    question: "Comment vérifiez-vous les profils des intervenants ?",
    answer:
      "Chaque intervenant fait l'objet d'une vérification d'identité et d'un contrôle de ses références (anciens employeurs, recommandations). Le profil ne devient « vérifié » et proposable aux familles qu'à l'issue de ce processus. Des badges de confiance (profil vérifié, références vérifiées, formé) sont affichés.",
  },
  {
    category: "Sécurité & confiance",
    question: "Mes données personnelles sont-elles protégées ?",
    answer:
      "Oui. Nous traitons vos données conformément à la loi ivoirienne n°2013-450 (autorité ARTCI) et aux principes du RGPD : consentement, finalités limitées, minimisation, sécurité renforcée des pièces d'identité et des données concernant les enfants. Vous disposez de droits d'accès, de rectification et de suppression.",
  },
  {
    category: "Sécurité & confiance",
    question: "Pourquoi les coordonnées des intervenants ne sont-elles pas visibles ?",
    answer:
      "C'est le principe de notre modèle hybride : l'agence reste au centre de la mise en relation, garante de la vérification et de la confiance. Les coordonnées ne sont communiquées qu'une fois la mise en relation validée par l'agence.",
  },
  {
    category: "Intervenants",
    question: "Comment devenir intervenant chez SOS Nounous & Services ?",
    answer:
      "Remplissez le formulaire de candidature en ligne (métier, expérience, disponibilités, zone). Vous créez ensuite votre profil et déposez vos pièces justificatives. Après vérification par l'agence, votre profil est proposé aux familles correspondantes.",
  },
  {
    category: "Intervenants",
    question: "Vais-je bénéficier d'une formation ?",
    answer:
      "La formation est un axe central du projet. Les intervenants accèdent progressivement à des conseils et à des modules de base (hygiène, sécurité, posture professionnelle, communication avec les familles). Une offre de formation plus complète est prévue à terme.",
  },
  {
    category: "Tarifs",
    question: "Combien coûtent vos services ?",
    answer:
      "Les tarifs dépendent du type de service, de la fréquence et de la durée. Demandez un devis gratuit et sans engagement : nous vous transmettons une estimation adaptée à votre besoin.",
  },
  {
    category: "Tarifs",
    question: "Le devis est-il payant ?",
    answer:
      "Non. La demande de devis et l'estimation sont gratuites et sans engagement.",
  },
];

export const faqCategories = [
  "Familles",
  "Intervenants",
  "Sécurité & confiance",
  "Tarifs",
] as const;
