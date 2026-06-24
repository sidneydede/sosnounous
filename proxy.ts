import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

/**
 * Première barrière d'accès aux zones authentifiées (CDC §4.1 — séparation des espaces).
 * Contrôle léger de présence du cookie de session ; la validation réelle (et le RBAC)
 * est assurée côté serveur par requireUser/requireRole dans les layouts/pages.
 *
 * (Convention « proxy » de Next.js 16, remplaçante de « middleware ».)
 */
export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/espace/:path*"],
};
