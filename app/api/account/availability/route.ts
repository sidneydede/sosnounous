import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getOrCreateProfile, serializeList } from "@/lib/profiles";
import { WEEKDAYS } from "@/lib/documents";

/** Ajout d'un créneau de disponibilité par l'intervenant (M8 — RG-30). */
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.INTERVENANT)
    return NextResponse.json({ ok: false, error: "Réservé aux intervenants." }, { status: 403 });

  let body: { weekday?: string; startTime?: string; endTime?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
  const errors: Record<string, string> = {};
  if (!body.weekday || !(WEEKDAYS as readonly string[]).includes(body.weekday))
    errors.weekday = "Jour invalide.";
  if (!body.startTime || !timeRe.test(body.startTime)) errors.startTime = "Heure de début invalide.";
  if (!body.endTime || !timeRe.test(body.endTime)) errors.endTime = "Heure de fin invalide.";
  if (!errors.startTime && !errors.endTime && body.startTime! >= body.endTime!)
    errors.endTime = "La fin doit être après le début.";
  if (Object.keys(errors).length > 0)
    return NextResponse.json({ ok: false, errors }, { status: 422 });

  const profile = await getOrCreateProfile({
    id: me.id,
    metiers: serializeList(me.metiers),
    commune: me.commune,
  });

  await prisma.availabilitySlot.create({
    data: { profileId: profile.id, weekday: body.weekday!, startTime: body.startTime!, endTime: body.endTime! },
  });

  return NextResponse.json({ ok: true });
}
