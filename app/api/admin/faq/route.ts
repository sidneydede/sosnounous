import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

/** Création d'une entrée de FAQ (CMS — RG-42). Réservé à l'agence. */
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me || me.role !== ROLES.ADMIN)
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  let body: { question?: string; answer?: string; category?: string; sortOrder?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  if (!body.question?.trim()) errors.question = "La question est requise.";
  if (!body.answer?.trim()) errors.answer = "La réponse est requise.";
  if (!body.category?.trim()) errors.category = "La catégorie est requise.";
  if (Object.keys(errors).length > 0) return NextResponse.json({ ok: false, errors }, { status: 422 });

  await prisma.faqEntry.create({
    data: {
      question: body.question!.trim(),
      answer: body.answer!.trim(),
      category: body.category!.trim(),
      sortOrder: Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : 0,
    },
  });
  return NextResponse.json({ ok: true });
}
