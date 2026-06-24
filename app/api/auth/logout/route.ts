import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

/** Déconnexion (CDC §2.5). Détruit la session et le cookie. */
export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
