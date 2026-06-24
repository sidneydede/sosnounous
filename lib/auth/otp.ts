import { prisma } from "@/lib/db";
import { generateOtp, hashToken } from "@/lib/auth/tokens";
import { sendNotification } from "@/lib/notifications";

/**
 * Vérification de compte par code OTP (RG-03).
 * Le code est haché en base ; seul l'utilisateur reçoit le code en clair
 * (e-mail / SMS — mocké en développement).
 */

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/** Crée un code de vérification, l'« envoie » et renvoie le code (dev/tests). */
export async function issueVerificationCode(
  userId: string,
  channel: "email" | "sms",
  destination: string,
): Promise<void> {
  // Invalide les codes précédents non consommés pour cet usage.
  await prisma.verificationCode.updateMany({
    where: { userId, purpose: "ACCOUNT_VERIFICATION", consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const code = generateOtp(6);
  await prisma.verificationCode.create({
    data: {
      userId,
      codeHash: hashToken(code),
      channel,
      purpose: "ACCOUNT_VERIFICATION",
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  await sendNotification({
    channel,
    to: destination,
    subject: "Votre code de vérification SOS Nounous & Services",
    message: `Votre code de vérification est : ${code}. Il expire dans 10 minutes.`,
    event: "otp_verification",
    userId,
    critical: true, // RG-36 : envoi critique, toujours émis
  });
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "too_many_attempts" | "not_found" };

/** Vérifie un code OTP et active le compte le cas échéant. */
export async function verifyAccountCode(userId: string, code: string): Promise<VerifyResult> {
  const record = await prisma.verificationCode.findFirst({
    where: { userId, purpose: "ACCOUNT_VERIFICATION", consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { ok: false, reason: "not_found" };
  if (record.expiresAt < new Date()) return { ok: false, reason: "expired" };
  if (record.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };

  if (record.codeHash !== hashToken(code)) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "invalid" };
  }

  // Code valide : consommation + activation du compte (RG-03)
  await prisma.$transaction([
    prisma.verificationCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        emailVerifiedAt: record.channel === "email" ? new Date() : undefined,
        phoneVerifiedAt: record.channel === "sms" ? new Date() : undefined,
      },
    }),
  ]);

  return { ok: true };
}
