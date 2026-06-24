/**
 * Témoignages clients (CDC §2.15, §3.11 — réassurance).
 * ⚠️ PLACEHOLDER : témoignages FICTIFS de démonstration.
 * À remplacer par de vrais témoignages modérés (RG-31) avant mise en production.
 */

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number; // échelle 1 à 5 (hypothèse, CDC "échelle définie")
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "Nous cherchions une nounou de confiance pour nos deux enfants. L'agence a compris notre besoin et nous a proposé un profil parfaitement adapté en quelques jours.",
    author: "Aïcha K.",
    role: "Maman de deux enfants, Cocody",
    rating: 5,
  },
  {
    quote:
      "Le sérieux de la sélection nous a rassurés. Tout est cadré, les références sont vérifiées et le suivi est réel.",
    author: "Jean-Marc D.",
    role: "Parent, Marcory",
    rating: 5,
  },
  {
    quote:
      "En tant qu'aide ménagère, j'apprécie d'être accompagnée et d'avoir des missions près de chez moi. Le cadre est respectueux.",
    author: "Mariam T.",
    role: "Intervenante — aide ménagère",
    rating: 5,
  },
];
