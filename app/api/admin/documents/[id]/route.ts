import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

/** Suppression d'un document par l'agence (M7). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.ADMIN)
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id }, select: { id: true } });
  if (!doc) return NextResponse.json({ ok: false, error: "Document introuvable." }, { status: 404 });

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
