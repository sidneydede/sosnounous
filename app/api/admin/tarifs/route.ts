import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

/** Création d'un barème / tarif indicatif (paramétrage — RG-41). */
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me || me.role !== ROLES.ADMIN)
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  let body: { service?: string; label?: string; amount?: string; unit?: string; note?: string; sortOrder?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  if (!body.label?.trim()) errors.label = "Le libellé est requis.";
  if (!body.amount?.trim()) errors.amount = "Le montant est requis.";
  if (Object.keys(errors).length > 0) return NextResponse.json({ ok: false, errors }, { status: 422 });

  await prisma.tarif.create({
    data: {
      service: body.service?.trim() || "Tous",
      label: body.label!.trim(),
      amount: body.amount!.trim(),
      unit: body.unit?.trim() || null,
      note: body.note?.trim() || null,
      sortOrder: Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : 0,
    },
  });
  return NextResponse.json({ ok: true });
}
