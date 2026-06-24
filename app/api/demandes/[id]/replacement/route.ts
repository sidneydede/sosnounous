import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { logActivity, DEMANDE_STATUS } from "@/lib/demandes";
import { sendNotification } from "@/lib/notifications";
import { site } from "@/lib/data/site";

/** Demande de remplacement par la famille (M6 — US-11). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.FAMILY)
    return NextResponse.json({ ok: false, error: "Réservé aux familles." }, { status: 403 });

  const { id } = await params;
  let body: { reason?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const demande = await prisma.demande.findUnique({ where: { id }, select: { familyId: true } });
  if (!demande || demande.familyId !== me.id) {
    return NextResponse.json({ ok: false, error: "Demande introuvable." }, { status: 404 });
  }

  await prisma.demande.update({ where: { id }, data: { status: DEMANDE_STATUS.PRESELECTION } });
  await logActivity({
    demandeId: id,
    kind: "REPLACEMENT",
    message: `Demande de remplacement${body.reason ? ` : ${body.reason.trim()}` : ""}`,
    performedById: me.id,
  });
  await sendNotification({
    channel: "email",
    to: site.contact.email,
    subject: "Demande de remplacement",
    message: `La famille ${me.firstName} ${me.lastName} demande un remplacement (demande ${id}).`,
    event: "remplacement",
  });

  return NextResponse.json({ ok: true });
}
