import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { deleteStored } from "@/lib/storage";

/** Suppression d'une pièce justificative par son propriétaire (CDC §4.4). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.INTERVENANT)
    return NextResponse.json({ ok: false, error: "Réservé aux intervenants." }, { status: 403 });

  const { id } = await params;
  const file = await prisma.intervenantFile.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  });
  if (!file || file.profile.userId !== me.id) {
    return NextResponse.json({ ok: false, error: "Fichier introuvable." }, { status: 404 });
  }

  await deleteStored(file.storageKey);
  await prisma.intervenantFile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
