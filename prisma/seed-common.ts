/**
 * Utilitaires partagés par les scripts de seed.
 *
 * Le seed est volontairement découpé en deux :
 *   - `seed-content.ts` : contenu éditorial et paramétrage — sûr en production ;
 *   - `seed-demo.ts`    : comptes et données fictifs — jamais en production.
 */
import { PrismaClient } from "../lib/generated/prisma/index.js";

export const prisma = new PrismaClient();

/** Sérialise une liste (le schéma reste portable : pas de tableau natif). */
export const J = (v: string[]) => JSON.stringify(v);

/**
 * Garde-fou : refuse d'injecter les données de démonstration en production.
 * Ces données comprennent un compte ADMIN au mot de passe public — les créer
 * sur un environnement exposé ouvrirait le back-office à n'importe qui.
 * Contournable explicitement (ALLOW_DEMO_SEED=1) pour une recette isolée.
 */
export function assertDemoAllowed(): void {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "1") {
    console.error(
      [
        "✗ Refus : seed de DÉMONSTRATION avec NODE_ENV=production.",
        "  Il crée des comptes fictifs, dont un ADMIN au mot de passe connu.",
        "  En production : npm run db:seed:content  puis  npm run db:create-admin",
        "  Recette isolée uniquement : ALLOW_DEMO_SEED=1 npm run db:seed:demo",
      ].join("\n"),
    );
    process.exit(1);
  }
}

/** Exécution uniforme : journal, code de sortie, déconnexion. */
export function run(label: string, fn: () => Promise<void>): void {
  fn()
    .then(() => console.log(`Seed ${label} terminé.`))
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
