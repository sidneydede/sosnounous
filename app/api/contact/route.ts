import { NextResponse } from "next/server";
import { validateContact, isHoneypotFilled, type ContactInput } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { sendNotification } from "@/lib/notifications";
import { site } from "@/lib/data/site";

/**
 * Réception du formulaire de contact (CDC §2.14).
 * - validation serveur (source de vérité),
 * - anti-spam (pot-de-miel + rate limiting),
 * - accusé de réception automatique + notification agence (RG-19 / matrice §3.9).
 */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "contact"), { max: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Trop de tentatives. Merci de réessayer dans un instant." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let data: ContactInput;
  try {
    data = (await req.json()) as ContactInput;
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  // Pot-de-miel : on répond OK silencieusement pour ne pas informer le bot.
  if (isHoneypotFilled(data.company)) {
    return NextResponse.json({ ok: true });
  }

  const errors = validateContact(data);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  // Notification agence + accusé de réception (mock en dev — branchable en prod)
  await sendNotification({
    channel: "email",
    to: site.contact.email,
    subject: `Nouveau message de contact — ${data.subject}`,
    message: `De ${data.name} (${data.email}, ${data.phone}) : ${data.message}`,
    event: "contact_recu",
  });
  await sendNotification({
    channel: "email",
    to: data.email,
    subject: "Nous avons bien reçu votre message",
    message:
      "Merci de nous avoir contactés. Un conseiller SOS Nounous & Services vous répondra dans les meilleurs délais.",
    event: "contact_accuse",
  });

  return NextResponse.json({ ok: true });
}
