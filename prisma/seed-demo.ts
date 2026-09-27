/**
 * Seed de DÉMONSTRATION — comptes fictifs, profils vérifiés, demande d'exemple.
 * Exécuter avec : npm run db:seed:demo
 *
 * ⚠️ DÉVELOPPEMENT ET RECETTE UNIQUEMENT. Ce script crée des comptes au mot de
 * passe public « MotDePasse123 », dont un compte ADMINISTRATEUR. Il refuse de
 * s'exécuter avec NODE_ENV=production (voir `assertDemoAllowed`).
 *
 * En production, l'administrateur se crée avec : npm run db:create-admin
 */
import bcrypt from "bcryptjs";
import { prisma, J, run, assertDemoAllowed } from "./seed-common.ts";

const DEMO_PASSWORD = "MotDePasse123";

export async function seedDemo(): Promise<void> {
  assertDemoAllowed();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const now = new Date();

  // Comptes de base (admin + famille)
  const base = [
    { role: "ADMIN", firstName: "Marcelle", lastName: "Kouakou", email: "admin@sosnounous.ci", phone: "+2250700000001", commune: "Abidjan" },
    { role: "FAMILY", firstName: "Famille", lastName: "Démo", email: "famille@example.com", phone: "+2250700000002", commune: "Cocody" },
  ];
  for (const a of base) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: { ...a, passwordHash, status: "ACTIVE", emailVerifiedAt: now, consentAt: now },
    });
    console.log(`✓ Compte ${a.role} : ${a.email}`);
  }

  // Intervenants avec profils vérifiés (démo recherche/matching)
  const intervenants = [
    {
      firstName: "Aminata", lastName: "Diabaté", email: "aminata@example.com", phone: "+2250701000001", commune: "Cocody",
      headline: "Nounou expérimentée, douce et ponctuelle",
      metiers: ["Garde d'enfants", "Aide ménagère"], zones: ["Cocody", "Riviera"], experienceYears: 6,
      languages: ["Français"], missionTypes: ["Régulier", "Temps plein"], formations: ["Petite enfance"],
      rating: 4.9, ratingCount: 12, identity: true, refs: true, trained: true, license: false,
    },
    {
      firstName: "Koffi", lastName: "N'Guessan", email: "koffi@example.com", phone: "+2250701000002", commune: "Plateau",
      headline: "Chauffeur privé, 10 ans d'expérience, discret",
      metiers: ["Chauffeur"], zones: ["Plateau", "Cocody", "Marcory"], experienceYears: 10,
      languages: ["Français"], missionTypes: ["Temps plein"], formations: [],
      rating: 4.8, ratingCount: 8, identity: true, refs: true, trained: false, license: true,
    },
    {
      firstName: "Fatou", lastName: "Sako", email: "fatou@example.com", phone: "+2250701000003", commune: "Marcory",
      headline: "Aide ménagère minutieuse et de confiance",
      metiers: ["Aide ménagère"], zones: ["Marcory", "Treichville"], experienceYears: 4,
      languages: ["Français"], missionTypes: ["Régulier"], formations: [],
      rating: 4.7, ratingCount: 5, identity: true, refs: true, trained: true, license: false,
    },
    {
      firstName: "Awa", lastName: "Bamba", email: "awa@example.com", phone: "+2250701000004", commune: "Yopougon",
      headline: "Cuisinière à domicile, cuisine ivoirienne et internationale",
      metiers: ["Cuisine"], zones: ["Yopougon", "Plateau"], experienceYears: 8,
      languages: ["Français"], missionTypes: ["Ponctuel", "Régulier"], formations: ["Hygiène alimentaire"],
      rating: 4.9, ratingCount: 15, identity: true, refs: false, trained: false, license: false,
    },
    {
      firstName: "Ibrahim", lastName: "Touré", email: "ibrahim@example.com", phone: "+2250701000005", commune: "Riviera",
      headline: "Gardien sérieux, vigilant et ponctuel",
      metiers: ["Gardiennage"], zones: ["Riviera", "Cocody"], experienceYears: 12,
      languages: ["Français"], missionTypes: ["Temps plein"], formations: [],
      rating: 4.6, ratingCount: 4, identity: true, refs: false, trained: false, license: true,
    },
    {
      firstName: "Grâce", lastName: "Aka", email: "grace@example.com", phone: "+2250701000006", commune: "Abobo",
      headline: "Baby-sitter dynamique, idéale pour les sorties d'école",
      metiers: ["Garde d'enfants"], zones: ["Abobo", "Adjamé"], experienceYears: 3,
      languages: ["Français"], missionTypes: ["Ponctuel"], formations: ["Petite enfance", "Premiers secours"],
      rating: 4.8, ratingCount: 9, identity: true, refs: true, trained: true, license: false,
    },
    {
      // Intervenant de démo générique (compte "intervenant@example.com")
      firstName: "Intervenant", lastName: "Démo", email: "intervenant@example.com", phone: "+2250700000003", commune: "Marcory",
      headline: "Profil de démonstration",
      metiers: ["Garde d'enfants", "Aide ménagère"], zones: ["Marcory"], experienceYears: 5,
      languages: ["Français"], missionTypes: ["Régulier"], formations: [],
      rating: null as number | null, ratingCount: 0, identity: true, refs: true, trained: false, license: false,
    },
  ];

  for (const it of intervenants) {
    const user = await prisma.user.upsert({
      where: { email: it.email },
      update: {},
      create: {
        role: "INTERVENANT",
        firstName: it.firstName,
        lastName: it.lastName,
        email: it.email,
        phone: it.phone,
        commune: it.commune,
        metiers: J(it.metiers),
        passwordHash,
        status: "ACTIVE",
        emailVerifiedAt: now,
        consentAt: now,
      },
    });

    await prisma.intervenantProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        headline: it.headline,
        metiers: J(it.metiers),
        zones: J(it.zones),
        experienceYears: it.experienceYears,
        languages: J(it.languages),
        formations: J(it.formations),
        missionTypes: J(it.missionTypes),
        hasDrivingLicense: it.license,
        status: "ACTIVE",
        verifiedAt: now,
        identityVerified: it.identity,
        referencesVerified: it.refs,
        trained: it.trained,
        rating: it.rating,
        ratingCount: it.ratingCount,
      },
    });
    console.log(`✓ Intervenant vérifié : ${it.email}`);
  }

  // Demande de démonstration (avec une proposition) pour la famille de démo
  const family = await prisma.user.findUnique({ where: { email: "famille@example.com" } });
  if (family) {
    const existing = await prisma.demande.count({ where: { familyId: family.id } });
    if (existing === 0) {
      const aminataUser = await prisma.user.findUnique({
        where: { email: "aminata@example.com" },
        include: { intervenantProfile: true },
      });
      const demande = await prisma.demande.create({
        data: {
          familyId: family.id,
          contactName: "Famille Démo",
          contactEmail: family.email,
          contactPhone: family.phone,
          serviceType: "Garde d'enfants",
          frequency: "Régulier",
          commune: "Cocody",
          details: "2 enfants (3 et 6 ans), sortie d'école et mercredis.",
          status: "PROPOSED",
        },
      });
      if (aminataUser?.intervenantProfile) {
        await prisma.proposition.create({
          data: {
            demandeId: demande.id,
            profileId: aminataUser.intervenantProfile.id,
            status: "PROPOSED",
          },
        });
      }
      await prisma.activityEvent.create({
        data: { demandeId: demande.id, kind: "STATUS", message: "Demande de démonstration créée" },
      });
      console.log("✓ Demande de démonstration créée pour la famille");
    }
  }

  console.log(`Mot de passe des comptes de démonstration : ${DEMO_PASSWORD}`);
}

run("démonstration", seedDemo);
