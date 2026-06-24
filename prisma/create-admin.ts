/**
 * Création / réinitialisation du compte ADMINISTRATEUR (production).
 * N'insère AUCUNE donnée de démonstration.
 *
 * Usage (variables d'environnement) :
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... [ADMIN_FIRSTNAME=...] [ADMIN_LASTNAME=...] [ADMIN_PHONE=...] \
 *     node --experimental-strip-types prisma/create-admin.ts
 * ou : npm run db:create-admin
 */
import { PrismaClient } from "../lib/generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const firstName = process.env.ADMIN_FIRSTNAME ?? "Administrateur";
const lastName = process.env.ADMIN_LASTNAME ?? "SOS Nounous";
const phone = process.env.ADMIN_PHONE ?? "+2250000000000";

if (!email || !password || password.length < 8) {
  console.error("Erreur : définir ADMIN_EMAIL et ADMIN_PASSWORD (au moins 8 caractères).");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);
const now = new Date();

const user = await prisma.user.upsert({
  where: { email: email.toLowerCase() },
  update: { passwordHash, role: "ADMIN", status: "ACTIVE" },
  create: {
    email: email.toLowerCase(),
    passwordHash,
    role: "ADMIN",
    status: "ACTIVE",
    firstName,
    lastName,
    phone,
    commune: "Abidjan",
    emailVerifiedAt: now,
    consentAt: now,
  },
});

console.log(`✓ Compte administrateur prêt : ${user.email}`);
await prisma.$disconnect();
