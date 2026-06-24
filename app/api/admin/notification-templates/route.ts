import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { NOTIFICATION_EVENTS } from "@/lib/notificationEvents";

/** Création/mise à jour d'un modèle de notification (paramétrage — RG-41). */
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me || me.role !== ROLES.ADMIN)
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  let b: { event?: string; subject?: string; body?: string; enabled?: boolean };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const event = b.event ?? "";
  if (!NOTIFICATION_EVENTS[event]) {
    return NextResponse.json({ ok: false, error: "Événement inconnu." }, { status: 422 });
  }

  const data = {
    subject: b.subject?.trim() || null,
    body: b.body?.trim() || null,
    enabled: typeof b.enabled === "boolean" ? b.enabled : true,
  };

  await prisma.notificationTemplate.upsert({
    where: { event },
    update: data,
    create: { event, ...data },
  });

  return NextResponse.json({ ok: true });
}
