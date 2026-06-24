import type { FieldErrors } from "@/lib/validation";
import { checkPasswordStrength } from "@/lib/auth/password";
import { PUBLIC_SIGNUP_ROLES, ROLES, type Role } from "@/lib/auth/roles";

/**
 * Validation des entrées d'authentification (source de vérité côté serveur).
 * Réutilise les mêmes règles côté client pour un retour immédiat.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s().-]{8,20}$/;

export interface RegisterInput {
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  commune: string;
  metiers?: string[];
  consent: boolean;
  company?: string; // pot-de-miel
}

export interface LoginInput {
  identifier: string; // e-mail ou téléphone
  password: string;
  company?: string;
}

export interface ForgotInput {
  email: string;
  company?: string;
}

export interface ResetInput {
  token: string;
  password: string;
}

function req(e: FieldErrors, field: string, value: string, label: string) {
  if (!value || value.trim().length === 0) e[field] = `${label} est requis.`;
}

export function validateRegister(data: RegisterInput): FieldErrors {
  const e: FieldErrors = {};

  if (!data.role || !PUBLIC_SIGNUP_ROLES.includes(data.role as Role)) {
    e.role = "Type de compte invalide.";
  }
  req(e, "firstName", data.firstName, "Le prénom");
  req(e, "lastName", data.lastName, "Le nom");
  req(e, "commune", data.commune, "La commune");
  if (!EMAIL_RE.test(data.email ?? "")) e.email = "Adresse e-mail invalide.";
  if (!PHONE_RE.test(data.phone ?? "")) e.phone = "Numéro de téléphone invalide.";

  const pwdError = checkPasswordStrength(data.password ?? "");
  if (pwdError) e.password = pwdError;

  // RG-01 / champ adapté au rôle : métier(s) requis pour les intervenants
  if (data.role === ROLES.INTERVENANT) {
    if (!data.metiers || data.metiers.filter(Boolean).length === 0) {
      e.metiers = "Sélectionnez au moins un métier proposé.";
    }
  }

  // RG-04 : consentement obligatoire
  if (!data.consent) e.consent = "Vous devez accepter la politique de confidentialité.";

  return e;
}

export function validateLogin(data: LoginInput): FieldErrors {
  const e: FieldErrors = {};
  req(e, "identifier", data.identifier, "L'e-mail ou le téléphone");
  req(e, "password", data.password, "Le mot de passe");
  return e;
}

export function validateForgot(data: ForgotInput): FieldErrors {
  const e: FieldErrors = {};
  if (!EMAIL_RE.test(data.email ?? "")) e.email = "Adresse e-mail invalide.";
  return e;
}

export function validateReset(data: ResetInput): FieldErrors {
  const e: FieldErrors = {};
  req(e, "token", data.token, "Le jeton");
  const pwdError = checkPasswordStrength(data.password ?? "");
  if (pwdError) e.password = pwdError;
  return e;
}

export { EMAIL_RE, PHONE_RE };
