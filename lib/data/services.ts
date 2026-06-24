/**
 * Catalogue des services domestiques.
 * Source : CDC §1.1, §3.11, §5.2 + présentation projet §5 (offre de services).
 * Le périmètre couvre l'ensemble des personnels domestiques, priorité garde d'enfants.
 */

export type Frequency = "Ponctuel" | "Régulier" | "Temps plein";

export interface Service {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  /** Détail enrichi affiché sur la page service. */
  longDescription: string;
  /** Tâches / prestations typiques (présentation projet §5). */
  tasks: string[];
  frequencies: Frequency[];
  icon: string;
  /** Cas d'usage concrets (inspiration Kinougarde : offre par besoin — CDC §1.5). */
  useCases: string[];
}

export const services: Service[] = [
  {
    slug: "garde-d-enfants",
    name: "Garde d'enfants & baby-sitting",
    shortName: "Garde d'enfants",
    tagline: "Le cœur de métier de l'agence depuis 2022.",
    description:
      "Baby-sitters et nounous sélectionnées pour la garde de vos enfants, en toute confiance.",
    longDescription:
      "Notre activité historique : la garde d'enfants. Nous sélectionnons des baby-sitters et des nounous expérimentées, vérifiées et, lorsque c'est possible, formées aux notions de base de la petite enfance, de l'hygiène et de la sécurité. Que vous ayez besoin d'une garde ponctuelle, régulière ou à temps plein, l'agence vous propose le bon profil.",
    tasks: [
      "Baby-sitting ponctuel (soirées, week-ends, imprévus)",
      "Nounou régulière (sortie d'école, mercredis, vacances)",
      "Nounou à temps plein",
      "Garde d'enfants en horaires décalés",
    ],
    frequencies: ["Ponctuel", "Régulier", "Temps plein"],
    icon: "child",
    useCases: [
      "Sortie d'école et aide aux devoirs",
      "Garde pendant les vacances scolaires",
      "Horaires décalés des parents",
      "Dépannage et remplacement temporaire",
    ],
  },
  {
    slug: "aide-menagere",
    name: "Aide ménagère & employé(e) de maison",
    shortName: "Aide ménagère",
    tagline: "Un foyer entretenu, l'esprit tranquille.",
    description:
      "Aides ménagères et employés de maison pour l'entretien quotidien de votre foyer.",
    longDescription:
      "Des aides ménagères et employés de maison fiables pour l'entretien de votre domicile : ménage, linge, rangement et organisation du foyer. Des profils présélectionnés et vérifiés, disponibles de façon ponctuelle, régulière ou à temps plein selon vos besoins.",
    tasks: [
      "Entretien et nettoyage du domicile",
      "Lessive, repassage et gestion du linge",
      "Rangement et organisation du foyer",
      "Petites courses du quotidien",
    ],
    frequencies: ["Ponctuel", "Régulier", "Temps plein"],
    icon: "home",
    useCases: [
      "Entretien régulier de la maison",
      "Grand ménage ponctuel",
      "Soutien pour un foyer actif",
    ],
  },
  {
    slug: "cuisine",
    name: "Cuisinier / Cuisinière à domicile",
    shortName: "Cuisine",
    tagline: "Des repas faits maison, chaque jour.",
    description:
      "Cuisiniers et cuisinières à domicile pour des repas équilibrés et savoureux.",
    longDescription:
      "Des cuisiniers et cuisinières à domicile pour préparer des repas faits maison, adaptés aux goûts et aux besoins de votre famille. Nos profils sont sélectionnés pour leur savoir-faire, leur sens de l'hygiène et leur professionnalisme.",
    tasks: [
      "Préparation des repas quotidiens",
      "Cuisine pour événements familiaux",
      "Respect des régimes et préférences alimentaires",
      "Gestion des courses et des stocks",
    ],
    frequencies: ["Ponctuel", "Régulier", "Temps plein"],
    icon: "chef",
    useCases: [
      "Repas quotidiens en semaine",
      "Réceptions et événements familiaux",
      "Accompagnement nutritionnel de la famille",
    ],
  },
  {
    slug: "chauffeur",
    name: "Chauffeur privé",
    shortName: "Chauffeur",
    tagline: "Vos déplacements en toute sérénité.",
    description:
      "Chauffeurs privés ponctuels, réguliers ou à temps plein, sélectionnés et vérifiés.",
    longDescription:
      "Des chauffeurs privés fiables et discrets pour vos déplacements et ceux de votre famille. Permis et références vérifiés, ponctualité et professionnalisme au cœur de la sélection.",
    tasks: [
      "Trajets domicile / travail / école",
      "Accompagnement des enfants et des aînés",
      "Déplacements professionnels et personnels",
      "Disponibilité ponctuelle ou à temps plein",
    ],
    frequencies: ["Ponctuel", "Régulier", "Temps plein"],
    icon: "car",
    useCases: [
      "Trajets scolaires des enfants",
      "Déplacements professionnels réguliers",
      "Mobilité des personnes âgées",
    ],
  },
  {
    slug: "gardiennage",
    name: "Gardien & agent d'entretien",
    shortName: "Gardiennage",
    tagline: "La sécurité et l'entretien de votre propriété.",
    description:
      "Gardiens et agents d'entretien pour veiller sur votre domicile et vos espaces.",
    longDescription:
      "Des gardiens et agents d'entretien sérieux pour assurer la surveillance et l'entretien de votre propriété. Des profils présélectionnés, dont les références sont vérifiées par l'agence.",
    tasks: [
      "Surveillance et gardiennage du domicile",
      "Entretien des espaces extérieurs",
      "Accueil et contrôle des accès",
      "Petits travaux d'entretien courant",
    ],
    frequencies: ["Régulier", "Temps plein"],
    icon: "shield",
    useCases: [
      "Surveillance d'une résidence",
      "Entretien d'espaces verts",
      "Accueil et gestion des accès",
    ],
  },
];

export const frequencyLabels: Record<Frequency, string> = {
  Ponctuel: "Besoin ponctuel, à la demande",
  Régulier: "Présence régulière (hebdomadaire)",
  "Temps plein": "Présence à temps plein",
};

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
