import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

async function ensureAdmin() {
  const me = await getSessionUser();
  return me && me.role === ROLES.ADMIN;
}

/** Mise à jour d'un barème (paramétrage — RG-41). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const { id } = await params;
  let body: { service?: string; label?: string; amount?: string; unit?: string; note?: string; sortOrder?: number; published?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.service === "string") data.service = body.service.trim() || "Tous";
  if (typeof body.label === "string") data.label = body.label.trim();
  if (typeof body.amount === "string") data.amount = body.amount.trim();
  if (typeof body.unit === "string") data.unit = body.unit.trim() || null;
  if (typeof body.note === "string") data.note = body.note.trim() || null;
  if (Number.isFinite(body.sortOrder)) data.sortOrder = Number(body.sortOrder);
  if (typeof body.published === "boolean") data.published = body.published;

  try {
    await prisma.tarif.update({ where: { id }, data });
  } catch {
    return NextResponse.json({ ok: false, error: "Barème introuvable." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

/** Suppression d'un barème. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.tarif.delete({ where: { id } });
  } catch {
    return NextResponse.json({ ok: false, error: "Barème introuvable." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
