import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

async function ensureAdmin() {
  const me = await getSessionUser();
  return me && me.role === ROLES.ADMIN;
}

/** Mise à jour d'une entrée de FAQ (CMS — RG-42). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const { id } = await params;
  let body: { question?: string; answer?: string; category?: string; sortOrder?: number; published?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.question === "string") data.question = body.question.trim();
  if (typeof body.answer === "string") data.answer = body.answer.trim();
  if (typeof body.category === "string") data.category = body.category.trim();
  if (Number.isFinite(body.sortOrder)) data.sortOrder = Number(body.sortOrder);
  if (typeof body.published === "boolean") data.published = body.published;

  try {
    await prisma.faqEntry.update({ where: { id }, data });
  } catch {
    return NextResponse.json({ ok: false, error: "Entrée introuvable." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

/** Suppression d'une entrée de FAQ. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.faqEntry.delete({ where: { id } });
  } catch {
    return NextResponse.json({ ok: false, error: "Entrée introuvable." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
