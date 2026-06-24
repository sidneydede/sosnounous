import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

/** Création d'une zone d'intervention (paramétrage — RG-41). */
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me || me.role !== ROLES.ADMIN)
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  let b: { name?: string; sortOrder?: number };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const name = (b.name ?? "").trim();
  if (!name) return NextResponse.json({ ok: false, errors: { name: "Le nom est requis." } }, { status: 422 });

  try {
    await prisma.zone.create({
      data: { name, sortOrder: Number.isFinite(b.sortOrder) ? Number(b.sortOrder) : 0 },
    });
  } catch {
    return NextResponse.json({ ok: false, errors: { name: "Cette zone existe déjà." } }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
