import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";

/** Mise à jour des préférences de notification de l'utilisateur (RG-37). */
export async function PATCH(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });

  let body: { notifyEmail?: boolean; notifySms?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: me.id },
    data: {
      notifyEmail: Boolean(body.notifyEmail),
      notifySms: Boolean(body.notifySms),
    },
  });

  return NextResponse.json({ ok: true });
}
