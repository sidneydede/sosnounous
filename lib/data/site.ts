/**
 * Données institutionnelles & configuration globale du site.
 * Source : Cahier des charges GBC-SOSN-CDC-2026-001 + présentation projet.
 * Contenus fournis par le client conservés fidèlement (CDC : ne pas reformuler).
 * Les valeurs marquées « PLACEHOLDER » sont à fournir par l'agence.
 */

export const site = {
  name: "SOS Nounous & Services",
  shortName: "SOS Nounous",
  signature: "Le bon profil.",
  baseline:
    "La mise en relation sécurisée et professionnelle entre familles et personnels domestiques en Côte d'Ivoire.",
  // Vision / mission — repris mot pour mot du cahier des charges (§1.1)
  vision:
    "Devenir l'agence de référence en Côte d'Ivoire pour la mise en relation sécurisée et professionnelle entre familles et personnels domestiques.",
  mission:
    "Offrir un accès simple, rapide et fiable à des profils sélectionnés, référencés, formés et accompagnés, tout en valorisant le travail domestique.",
  // Coordonnées — PLACEHOLDER : à compléter par l'agence
  contact: {
    phone: process.env.NEXT_PUBLIC_AGENCY_PHONE ?? "+225 00 00 00 00",
    email: process.env.NEXT_PUBLIC_AGENCY_EMAIL ?? "contact@sosnounous.ci",
    hours: "Lundi – Samedi, 8h00 – 19h00",
    city: "Abidjan, Côte d'Ivoire",
    address: "Adresse de l'agence — à compléter", // PLACEHOLDER
  },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  social: {
    // PLACEHOLDER : liens réseaux sociaux de l'agence
    facebook: "#",
    instagram: "#",
    linkedin: "#",
  },
} as const;

/**
 * Informations légales & conformité (CDC §4.4).
 * ⚠️ PLACEHOLDER : valeurs à compléter et valider par l'agence (+ conseil juridique)
 * AVANT mise en production. Centralisées ici pour une saisie unique.
 */
export const legal = {
  legalName: "SOS Nounous & Services", // raison sociale exacte — à confirmer
  legalForm: "à préciser", // forme juridique (SARL, entreprise individuelle…)
  rccm: "à préciser", // n° RCCM / identifiant
  capital: "à préciser", // capital social le cas échéant
  headOffice: "à préciser — Abidjan, Côte d'Ivoire", // adresse du siège
  publicationDirector: "Mme Marcelle Kouakou", // directrice de la publication
  host: {
    name: "à préciser", // nom de l'hébergeur
    address: "à préciser", // adresse de l'hébergeur
    contact: "à préciser", // contact de l'hébergeur
  },
  // Contact pour l'exercice des droits (RGPD / loi 2013-450)
  dataContactEmail: process.env.NEXT_PUBLIC_AGENCY_EMAIL ?? "contact@sosnounous.ci",
  authority: "ARTCI (Autorité de Régulation des Télécommunications de Côte d'Ivoire)",
  lastUpdated: "à compléter lors de la validation finale",
} as const;

/** Les cinq piliers de la proposition de valeur (présentation projet §8). */
export const valuePillars = [
  {
    title: "Sécurité dans le choix des profils",
    description:
      "Un processus rigoureux de présélection et de vérification d'identité avant toute proposition.",
    icon: "shield",
  },
  {
    title: "Fiabilité des références",
    description:
      "Anciens employeurs et recommandations collectés puis vérifiés par l'agence.",
    icon: "check",
  },
  {
    title: "Rapidité de mise en relation",
    description:
      "Une présélection réactive pour vous proposer rapidement le bon profil.",
    icon: "bolt",
  },
  {
    title: "Accompagnement personnalisé",
    description:
      "Un conseiller dédié avant, pendant et après la mise en relation.",
    icon: "hands",
  },
  {
    title: "Professionnalisation des intervenants",
    description:
      "Formation de base et montée en compétences pour un service de qualité.",
    icon: "graduation",
  },
] as const;

/** Navigation principale (CDC §5.2 / §5.3). */
export const mainNav = [
  { label: "Services", href: "/services" },
  { label: "Trouver un intervenant", href: "/trouver-un-intervenant" },
  { label: "Devenir intervenant", href: "/devenir-intervenant" },
  { label: "Notre méthode", href: "/notre-methode" },
  { label: "Tarifs & devis", href: "/tarifs" },
  { label: "À propos", href: "/a-propos" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;

/** Liens du pied de page (CDC §5.2 — bloc légal). */
export const footerLegalNav = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
  { label: "Gestion des cookies", href: "/cookies" },
  { label: "Conditions générales d'utilisation", href: "/cgu" },
  { label: "Plan du site", href: "/plan-du-site" },
] as const;
