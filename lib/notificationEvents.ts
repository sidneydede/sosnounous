/**
 * Catalogue des événements de notification (CDC §3.9 — matrice des notifications).
 * Centralise canal par défaut et caractère critique (RG-35/36).
 * Les envois « critiques » (OTP, sécurité) sont toujours émis, indépendamment
 * des préférences utilisateur (RG-37).
 */
export interface NotificationEvent {
  label: string;
  critical: boolean;
}

export const NOTIFICATION_EVENTS: Record<string, NotificationEvent> = {
  otp_verification: { label: "Code de vérification (OTP)", critical: true },
  password_reset: { label: "Réinitialisation de mot de passe", critical: true },
  contact_recu: { label: "Message de contact reçu (agence)", critical: false },
  contact_accuse: { label: "Accusé de message de contact", critical: false },
  demande_recue: { label: "Nouvelle demande (agence)", critical: false },
  demande_accuse: { label: "Accusé de demande", critical: false },
  demande_accuse_sms: { label: "Accusé de demande (SMS)", critical: false },
  profils_proposes: { label: "Profils proposés", critical: false },
  rencontre: { label: "Rencontre planifiée", critical: false },
  placement: { label: "Placement confirmé", critical: false },
  remplacement: { label: "Demande de remplacement (agence)", critical: false },
};

export function eventLabel(event?: string | null): string {
  if (!event) return "—";
  return NOTIFICATION_EVENTS[event]?.label ?? event;
}
