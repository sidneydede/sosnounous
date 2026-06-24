import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Sonde de santé pour la supervision / les sondes d'orchestrateur (CDC §4.5).
 * Vérifie l'accès à la base de données. Renvoie 200 si tout est opérationnel,
 * 503 sinon. Non mis en cache.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok", db: "up", time: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { status: "error", db: "down" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
