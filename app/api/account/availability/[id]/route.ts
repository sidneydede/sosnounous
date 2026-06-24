import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

/** Suppression d'un créneau de disponibilité par son propriétaire (M8 — RG-30). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.INTERVENANT)
    return NextResponse.json({ ok: false, error: "Réservé aux intervenants." }, { status: 403 });

  const { id } = await params;
  const slot = await prisma.availabilitySlot.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  });
  if (!slot || slot.profile.userId !== me.id) {
    return NextResponse.json({ ok: false, error: "Créneau introuvable." }, { status: 404 });
  }

  await prisma.availabilitySlot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
