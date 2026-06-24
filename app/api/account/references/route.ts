import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getOrCreateProfile, serializeList } from "@/lib/profiles";

/** Ajout d'une référence par l'intervenant (M3 — RG-33). */
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.INTERVENANT)
    return NextResponse.json({ ok: false, error: "Réservé aux intervenants." }, { status: 403 });

  let body: { employerName?: string; contact?: string; relationship?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const employerName = (body.employerName ?? "").trim();
  if (!employerName) {
    return NextResponse.json(
      { ok: false, errors: { employerName: "Le nom de l'employeur est requis." } },
      { status: 422 },
    );
  }

  const profile = await getOrCreateProfile({
    id: me.id,
    metiers: serializeList(me.metiers),
    commune: me.commune,
  });

  await prisma.reference.create({
    data: {
      profileId: profile.id,
      employerName,
      contact: body.contact?.trim() || null,
      relationship: body.relationship?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true });
}
