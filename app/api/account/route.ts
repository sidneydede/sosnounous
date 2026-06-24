import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, destroySession } from "@/lib/auth/session";

/**
 * Suppression du compte par l'utilisateur connecté (CDC §3.1 ; droit RGPD §4.4).
 * Les données liées (sessions, codes, jetons) sont supprimées en cascade.
 */
export async function DELETE() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });

  await prisma.user.delete({ where: { id: me.id } });
  await destroySession();

  return NextResponse.json({ ok: true });
}
