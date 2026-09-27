import { NextResponse } from "next/server";

/**
 * Sonde de vivacité (liveness) — CDC §4.5.
 * Ne teste QUE le processus applicatif. Une base momentanément injoignable ne
 * doit pas faire échouer le health check de l'orchestrateur : celui-ci
 * redémarrerait le conteneur en boucle jusqu'à suspension automatique du
 * service. L'état de la base est exposé séparément par `/api/health/db`.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { status: "ok", time: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
