import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { serializeList } from "@/lib/profiles";

async function ensureAdmin() {
  const me = await getSessionUser();
  return me && me.role === ROLES.ADMIN;
}

/** Mise à jour d'un service (CMS — RG-42). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const { id } = await params;
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof b.name === "string") data.name = b.name.trim();
  if (typeof b.shortName === "string") data.shortName = b.shortName.trim();
  if (typeof b.tagline === "string") data.tagline = b.tagline.trim() || null;
  if (typeof b.description === "string") data.description = b.description.trim();
  if (typeof b.longDescription === "string") data.longDescription = b.longDescription.trim() || null;
  if (typeof b.icon === "string") data.icon = b.icon.trim() || "home";
  if (Array.isArray(b.tasks)) data.tasks = serializeList(b.tasks as string[]);
  if (Array.isArray(b.frequencies)) data.frequencies = serializeList(b.frequencies as string[]);
  if (Array.isArray(b.useCases)) data.useCases = serializeList(b.useCases as string[]);
  if (Number.isFinite(b.sortOrder)) data.sortOrder = Number(b.sortOrder);
  if (typeof b.published === "boolean") data.published = b.published;

  try {
    await prisma.service.update({ where: { id }, data });
  } catch {
    return NextResponse.json({ ok: false, error: "Service introuvable." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

/** Suppression d'un service. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.service.delete({ where: { id } });
  } catch {
    return NextResponse.json({ ok: false, error: "Service introuvable." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
