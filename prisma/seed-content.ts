/**
 * Seed de CONTENU — FAQ, catalogue de services, zones, barèmes (CMS/paramétrage).
 * Exécuter avec : npm run db:seed:content
 *
 * Sûr en production : aucune donnée personnelle, aucun compte. Chaque table
 * n'est alimentée que si elle est vide — le script est rejouable sans écraser
 * le contenu édité depuis le back-office.
 */
import { services as staticServices } from "../lib/data/services.ts";
import { prisma, run } from "./seed-common.ts";

export async function seedContent(): Promise<void> {
  // CMS — FAQ initiale (si la table est vide)
  if ((await prisma.faqEntry.count()) === 0) {
    const faq = [
      { question: "Comment se déroule une demande de garde ?", answer: "Vous décrivez votre besoin, un conseiller présélectionne des profils vérifiés et vous les propose dans votre espace.", category: "Familles", sortOrder: 1 },
      { question: "Comment vérifiez-vous les profils ?", answer: "Vérification d'identité et contrôle des références avant qu'un profil ne devienne « vérifié » et proposable.", category: "Sécurité & confiance", sortOrder: 1 },
      { question: "Comment devenir intervenant ?", answer: "Créez votre compte, complétez votre profil et déposez vos références. Après vérification, vous êtes proposé aux familles.", category: "Intervenants", sortOrder: 1 },
      { question: "Le devis est-il payant ?", answer: "Non, la demande de devis et l'estimation sont gratuites et sans engagement.", category: "Tarifs", sortOrder: 1 },
    ];
    for (const f of faq) await prisma.faqEntry.create({ data: f });
    console.log("✓ FAQ initiale créée");
  }

  // CMS — catalogue de services (si la table est vide)
  if ((await prisma.service.count()) === 0) {
    for (let i = 0; i < staticServices.length; i++) {
      const s = staticServices[i];
      await prisma.service.create({
        data: {
          slug: s.slug,
          name: s.name,
          shortName: s.shortName,
          tagline: s.tagline,
          description: s.description,
          longDescription: s.longDescription,
          icon: s.icon,
          tasks: JSON.stringify(s.tasks),
          frequencies: JSON.stringify(s.frequencies),
          useCases: JSON.stringify(s.useCases),
          sortOrder: i,
        },
      });
    }
    console.log("✓ Catalogue de services créé");
  }

  // Paramétrage — zones d'intervention (si la table est vide)
  if ((await prisma.zone.count()) === 0) {
    const zones = ["Cocody", "Plateau", "Marcory", "Yopougon", "Treichville", "Abobo", "Adjamé", "Riviera", "Koumassi", "Port-Bouët", "Attécoubé", "Bingerville"];
    for (let i = 0; i < zones.length; i++) {
      await prisma.zone.create({ data: { name: zones[i], sortOrder: i } });
    }
    console.log("✓ Zones d'intervention créées");
  }

  // Paramétrage — barèmes indicatifs (si la table est vide)
  if ((await prisma.tarif.count()) === 0) {
    const tarifs = [
      { service: "Garde d'enfants", label: "Garde régulière", amount: "À partir de 80 000 FCFA", unit: "/ mois", sortOrder: 1 },
      { service: "Aide ménagère", label: "Entretien régulier", amount: "À partir de 60 000 FCFA", unit: "/ mois", sortOrder: 2 },
      { service: "Tous", label: "Ouverture de dossier", amount: "Sur devis", unit: null, sortOrder: 3 },
    ];
    for (const t of tarifs) await prisma.tarif.create({ data: t });
    console.log("✓ Barèmes indicatifs créés");
  }
}

run("contenu", seedContent);
