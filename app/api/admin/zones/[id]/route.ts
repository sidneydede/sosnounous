import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

async function ensureAdmin() {
  const me = await getSessionUser();
  return me && me.role === ROLES.ADMIN;
}

/** Mise à jour d'une zone (paramétrage — RG-41). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const { id } = await params;
  let b: { name?: string; sortOrder?: number; active?: boolean };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof b.name === "string" && b.name.trim()) data.name = b.name.trim();
  if (Number.isFinite(b.sortOrder)) data.sortOrder = Number(b.sortOrder);
  if (typeof b.active === "boolean") data.active = b.active;

  try {
    await prisma.zone.update({ where: { id }, data });
  } catch {
    return NextResponse.json({ ok: false, error: "Zone introuvable." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

/** Suppression d'une zone. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.zone.delete({ where: { id } });
  } catch {
    return NextResponse.json({ ok: false, error: "Zone introuvable." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
