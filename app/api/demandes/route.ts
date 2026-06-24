import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { validateDevis, isHoneypotFilled, type DevisInput } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { sendNotification } from "@/lib/notifications";
import { logActivity, DEMANDE_STATUS } from "@/lib/demandes";
import { site } from "@/lib/data/site";

/**
 * Dépôt d'une demande de garde / de personnel (M5 — US-08/09, RG-16/19).
 * Accessible aux visiteurs (invité) comme aux familles connectées.
 * Génère un accusé de réception (e-mail + SMS) et notifie le back-office.
 */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "demande"), { max: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Trop de tentatives. Merci de réessayer dans un instant." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let data: DevisInput;
  try {
    data = (await req.json()) as DevisInput;
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  if (isHoneypotFilled(data.company)) return NextResponse.json({ ok: true });

  const errors = validateDevis(data);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  // RG-16 : rattachement à la famille si connectée
  const me = await getSessionUser();
  const familyId = me?.role === "FAMILY" ? me.id : null;

  const demande = await prisma.demande.create({
    data: {
      familyId,
      contactName: data.name.trim(),
      contactEmail: data.email.trim().toLowerCase(),
      contactPhone: data.phone.trim(),
      serviceType: data.service.trim(),
      frequency: data.frequency.trim(),
      commune: data.city.trim(),
      details: data.details?.trim() || null,
      status: DEMANDE_STATUS.NEW,
    },
    select: { id: true },
  });

  await logActivity({
    demandeId: demande.id,
    kind: "STATUS",
    message: "Demande déposée",
    performedById: familyId ?? undefined,
  });

  // RG-19 : accusé de réception + notification agence
  await sendNotification({
    channel: "email",
    to: site.contact.email,
    subject: `Nouvelle demande — ${data.service} (${data.frequency})`,
    message: `Demande de ${data.name} (${data.email}, ${data.phone}) à ${data.city}. Détails : ${data.details ?? "—"}`,
    event: "demande_recue",
  });
  await sendNotification({
    channel: "email",
    to: data.email,
    subject: "Votre demande a bien été reçue",
    message:
      "Merci pour votre demande. Un conseiller SOS Nounous & Services l'analyse et vous proposera des profils vérifiés adaptés.",
    event: "demande_accuse",
    userId: familyId ?? undefined,
  });
  await sendNotification({
    channel: "sms",
    to: data.phone,
    message: "SOS Nounous & Services : votre demande est bien reçue. Nous vous recontactons très vite.",
    event: "demande_accuse_sms",
    userId: familyId ?? undefined,
  });

  return NextResponse.json({ ok: true, id: demande.id });
}
