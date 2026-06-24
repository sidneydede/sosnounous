import { prisma } from "@/lib/db";
import { site } from "@/lib/data/site";

/**
 * Couche d'abstraction des notifications transactionnelles (CDC §3.9, §4.10).
 *
 * - Mode "mock" (défaut) : journalisation en console, aucun envoi réel.
 * - Mode "live" : envoi via API HTTP (e-mail & SMS), configuré par variables d'env.
 *
 * RG-35 : événement clé → notification. RG-36 : SMS pour le critique.
 * RG-37 : respect des préférences utilisateur (sauf envois critiques).
 * RG-38 : chaque envoi est journalisé (statut).
 */

type Channel = "email" | "sms";
type SendStatus = "SENT" | "FAILED" | "SKIPPED" | "MOCKED";

export interface NotificationPayload {
  channel: Channel;
  to: string;
  subject?: string;
  message: string;
  /** Identifiant d'événement métier (ex. "demande_recue"). */
  event?: string;
  /** Destinataire identifié (pour le respect des préférences — RG-37). */
  userId?: string;
  /** Envoi critique (OTP, sécurité) : toujours émis, ignore les préférences. */
  critical?: boolean;
}

export interface NotificationResult {
  ok: boolean;
  channel: Channel;
  status: SendStatus;
  error?: string;
}

const MODE = process.env.NOTIFICATIONS_MODE ?? "mock";

/** Journalise l'envoi (RG-38). Best-effort : n'interrompt jamais le flux métier. */
async function logSend(payload: NotificationPayload, status: SendStatus, error?: string) {
  try {
    await prisma.notificationLog.create({
      data: {
        channel: payload.channel,
        recipient: payload.to,
        event: payload.event ?? null,
        status,
        error: error ?? null,
        userId: payload.userId ?? null,
      },
    });
  } catch {
    // La journalisation ne doit pas faire échouer l'action métier.
  }
}

/**
 * Applique le modèle de notification éditable (RG-41) : surcharge de l'objet,
 * habillage du corps (marqueur {message}), ou suppression de l'envoi.
 * Renvoie `suppressed: true` si l'agence a désactivé l'événement (hors critique).
 */
async function applyTemplate(
  payload: NotificationPayload,
): Promise<{ suppressed: boolean }> {
  if (!payload.event) return { suppressed: false };
  const tpl = await prisma.notificationTemplate.findUnique({
    where: { event: payload.event },
  });
  if (!tpl) return { suppressed: false };

  if (!tpl.enabled && !payload.critical) return { suppressed: true };

  if (tpl.subject && tpl.subject.trim()) payload.subject = tpl.subject;
  if (tpl.body && tpl.body.trim()) {
    payload.message = tpl.body.includes("{message}")
      ? tpl.body.split("{message}").join(payload.message).split("{site}").join(site.name)
      : `${tpl.body}\n\n${payload.message}`;
  }
  return { suppressed: false };
}

/** Vérifie les préférences utilisateur (RG-37). Renvoie true si l'envoi est autorisé. */
async function isAllowedByPreferences(payload: NotificationPayload): Promise<boolean> {
  if (payload.critical || !payload.userId) return true;
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { notifyEmail: true, notifySms: true },
  });
  if (!user) return true;
  if (payload.channel === "email") return user.notifyEmail;
  if (payload.channel === "sms") return user.notifySms;
  return true;
}

/** Envoi e-mail réel via API HTTP transactionnelle (style Resend). */
async function deliverEmail(payload: NotificationPayload): Promise<void> {
  const apiKey = process.env.EMAIL_API_KEY;
  const endpoint = process.env.EMAIL_API_URL ?? "https://api.resend.com/emails";
  const from = process.env.EMAIL_FROM ?? "SOS Nounous & Services <no-reply@sosnounous.ci>";
  if (!apiKey) throw new Error("EMAIL_API_KEY manquant");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: payload.to, subject: payload.subject ?? "Notification", text: payload.message }),
  });
  if (!res.ok) throw new Error(`E-mail provider HTTP ${res.status}`);
}

/** Envoi SMS réel via passerelle HTTP générique (configurable). */
async function deliverSms(payload: NotificationPayload): Promise<void> {
  const apiKey = process.env.SMS_API_KEY;
  const endpoint = process.env.SMS_API_URL;
  const sender = process.env.SMS_SENDER ?? "SOSNounous";
  if (!apiKey || !endpoint) throw new Error("Configuration SMS manquante");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ to: payload.to, from: sender, message: payload.message }),
  });
  if (!res.ok) throw new Error(`SMS gateway HTTP ${res.status}`);
}

/**
 * Point d'entrée unique d'envoi de notification.
 */
export async function sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
  // RG-37 : respect des préférences (hors envois critiques)
  if (!(await isAllowedByPreferences(payload))) {
    await logSend(payload, "SKIPPED");
    return { ok: true, channel: payload.channel, status: "SKIPPED" };
  }

  // RG-41 : application du modèle éditable (surcharge / suppression)
  const { suppressed } = await applyTemplate(payload);
  if (suppressed) {
    await logSend(payload, "SKIPPED");
    return { ok: true, channel: payload.channel, status: "SKIPPED" };
  }

  // Mode démonstration : journalisation console + journal en base, aucun envoi réel.
  if (MODE !== "live") {
    console.info(
      `[notification:mock] ${payload.channel.toUpperCase()} -> ${payload.to}` +
        (payload.event ? ` (${payload.event})` : "") +
        (payload.subject ? ` | ${payload.subject}` : "") +
        `\n   ↳ ${payload.message}`,
    );
    await logSend(payload, "MOCKED");
    return { ok: true, channel: payload.channel, status: "MOCKED" };
  }

  // Mode production : envoi réel via le fournisseur configuré.
  try {
    if (payload.channel === "email") await deliverEmail(payload);
    else await deliverSms(payload);
    await logSend(payload, "SENT");
    return { ok: true, channel: payload.channel, status: "SENT" };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Erreur d'envoi";
    await logSend(payload, "FAILED", error);
    return { ok: false, channel: payload.channel, status: "FAILED", error };
  }
}
