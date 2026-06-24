import { PrismaClient } from "@/lib/generated/prisma";

/**
 * Client Prisma en singleton (évite l'épuisement du pool de connexions en
 * développement avec le hot-reload de Next.js).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
