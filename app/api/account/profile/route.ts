import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

/**
 * Mise à jour du profil de l'utilisateur connecté (CDC §3.1).
 * NB : l'e-mail et le téléphone (identifiants vérifiés) ne sont pas modifiables
 * ici — leur changement impliquera une revérification (incrément ultérieur).
 */
export async function PATCH(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });

  let body: { firstName?: string; lastName?: string; commune?: string; metiers?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  const firstName = (body.firstName ?? "").trim();
  const lastName = (body.lastName ?? "").trim();
  const commune = (body.commune ?? "").trim();
  if (!firstName) errors.firstName = "Le prénom est requis.";
  if (!lastName) errors.lastName = "Le nom est requis.";
  if (!commune) errors.commune = "La commune est requise.";

  let metiers: string | undefined;
  if (me.role === ROLES.INTERVENANT) {
    const list = (body.metiers ?? []).filter(Boolean);
    if (list.length === 0) errors.metiers = "Sélectionnez au moins un métier.";
    else metiers = JSON.stringify(list);
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  await prisma.user.update({
    where: { id: me.id },
    data: { firstName, lastName, commune, ...(metiers !== undefined ? { metiers } : {}) },
  });

  return NextResponse.json({ ok: true });
}
