import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

/** Retourne l'utilisateur courant (pour l'affichage de l'état connecté côté client). */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      firstName: user.firstName,
      role: user.role,
    },
  });
}
