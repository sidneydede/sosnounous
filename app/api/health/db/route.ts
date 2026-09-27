import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Sonde applicative approfondie (readiness) — CDC §4.5.
 * Vérifie l'accès à la base : 200 si opérationnelle, 503 sinon.
 * À brancher sur le monitoring/alerting — PAS sur le health check de
 * l'orchestrateur (voir `/api/health`).
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
