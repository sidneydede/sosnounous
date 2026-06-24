import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { serializeList } from "@/lib/profiles";

/** Création d'un service (CMS — RG-42). Réservé à l'agence. */
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me || me.role !== ROLES.ADMIN)
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  let b: {
    slug?: string; name?: string; shortName?: string; tagline?: string;
    description?: string; longDescription?: string; icon?: string;
    tasks?: string[]; frequencies?: string[]; useCases?: string[]; sortOrder?: number;
  };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  const slug = (b.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  if (!slug) errors.slug = "Le slug est requis.";
  if (!b.name?.trim()) errors.name = "Le nom est requis.";
  if (!b.shortName?.trim()) errors.shortName = "Le nom court est requis.";
  if (!b.description?.trim()) errors.description = "La description est requise.";
  if (Object.keys(errors).length > 0) return NextResponse.json({ ok: false, errors }, { status: 422 });

  try {
    await prisma.service.create({
      data: {
        slug,
        name: b.name!.trim(),
        shortName: b.shortName!.trim(),
        tagline: b.tagline?.trim() || null,
        description: b.description!.trim(),
        longDescription: b.longDescription?.trim() || null,
        icon: b.icon?.trim() || "home",
        tasks: serializeList(b.tasks ?? []),
        frequencies: serializeList(b.frequencies ?? []),
        useCases: serializeList(b.useCases ?? []),
        sortOrder: Number.isFinite(b.sortOrder) ? Number(b.sortOrder) : 0,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, errors: { slug: "Ce slug existe déjà." } }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
