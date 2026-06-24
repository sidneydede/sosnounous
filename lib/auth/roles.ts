/**
 * Rôles et statuts de compte (CDC §2.2, RG-01, RG-03).
 * Valeurs contrôlées au niveau applicatif (schéma portable SQLite/PostgreSQL).
 */

export const ROLES = {
  FAMILY: "FAMILY",
  INTERVENANT: "INTERVENANT",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ACCOUNT_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;

export type AccountStatus = (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

/** Rôles auto-inscriptibles via le site public (l'admin est créé en interne). */
export const PUBLIC_SIGNUP_ROLES: Role[] = [ROLES.FAMILY, ROLES.INTERVENANT];

export function isRole(value: string): value is Role {
  return value === ROLES.FAMILY || value === ROLES.INTERVENANT || value === ROLES.ADMIN;
}

export const roleLabels: Record<Role, string> = {
  FAMILY: "Famille",
  INTERVENANT: "Intervenant",
  ADMIN: "Administrateur",
};
