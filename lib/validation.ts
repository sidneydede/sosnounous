/**
 * Validation des formulaires — partagée client/serveur.
 * La validation serveur est la source de vérité (sécurité — CDC §4.3).
 */

export type FieldErrors = Record<string, string>;

export interface ContactInput {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
  /** Champ pot-de-miel anti-spam (doit rester vide). */
  company?: string;
}

export interface DevisInput {
  service: string;
  frequency: string;
  city: string;
  details: string;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
  company?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Numéros locaux (CI) et internationaux : chiffres, espaces, +, -, ()
const PHONE_RE = /^[+]?[\d\s().-]{8,20}$/;

function require(errors: FieldErrors, field: string, value: string, label: string) {
  if (!value || value.trim().length === 0) errors[field] = `${label} est requis.`;
}

export function validateContact(data: ContactInput): FieldErrors {
  const e: FieldErrors = {};
  require(e, "name", data.name, "Le nom");
  require(e, "subject", data.subject, "Le sujet");
  if (!data.message || data.message.trim().length < 10)
    e.message = "Merci de détailler votre message (10 caractères minimum).";
  if (!EMAIL_RE.test(data.email ?? "")) e.email = "Adresse e-mail invalide.";
  if (!PHONE_RE.test(data.phone ?? "")) e.phone = "Numéro de téléphone invalide.";
  if (!data.consent)
    e.consent = "Vous devez accepter la politique de confidentialité.";
  return e;
}

export function validateDevis(data: DevisInput): FieldErrors {
  const e: FieldErrors = {};
  require(e, "service", data.service, "Le service");
  require(e, "frequency", data.frequency, "La fréquence");
  require(e, "city", data.city, "La commune");
  require(e, "name", data.name, "Le nom");
  if (!EMAIL_RE.test(data.email ?? "")) e.email = "Adresse e-mail invalide.";
  if (!PHONE_RE.test(data.phone ?? "")) e.phone = "Numéro de téléphone invalide.";
  if (!data.consent)
    e.consent = "Vous devez accepter la politique de confidentialité.";
  return e;
}

/** Détecte un remplissage du pot-de-miel (bot probable). */
export function isHoneypotFilled(company?: string): boolean {
  return Boolean(company && company.trim().length > 0);
}
