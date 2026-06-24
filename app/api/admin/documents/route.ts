import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { isDocumentType } from "@/lib/documents";

/**
 * Ajout d'un document pour une famille (M7 — RG-26).
 * Réservé à l'agence ; la famille y accède ensuite en lecture seule.
 * Le document est référencé par URL (le dépôt binaire chiffré est un incrément
 * ultérieur — données sensibles, §4.4).
 */
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.ADMIN)
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  let body: { demandeId?: string; type?: string; title?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  if (!body.title?.trim()) errors.title = "Le titre est requis.";
  if (!body.url?.trim() || !/^https?:\/\//.test(body.url.trim()))
    errors.url = "URL invalide (http/https).";
  if (!body.type || !isDocumentType(body.type)) errors.type = "Type invalide.";
  if (Object.keys(errors).length > 0)
    return NextResponse.json({ ok: false, errors }, { status: 422 });

  // Le document est rattaché à la famille de la demande
  const demande = await prisma.demande.findUnique({
    where: { id: body.demandeId ?? "" },
    select: { id: true, familyId: true },
  });
  if (!demande || !demande.familyId) {
    return NextResponse.json(
      { ok: false, error: "Demande sans famille rattachée." },
      { status: 422 },
    );
  }

  await prisma.document.create({
    data: {
      familyId: demande.familyId,
      demandeId: demande.id,
      type: body.type!,
      title: body.title!.trim(),
      url: body.url!.trim(),
      createdById: me.id,
    },
  });

  return NextResponse.json({ ok: true });
}
