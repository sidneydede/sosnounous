import { prisma } from "@/lib/db";

/**
 * Helpers des modules Demande (M5) et Mise en relation (M6).
 */

/** Cycle de vie d'une demande (RG-17). */
export const DEMANDE_STATUS = {
  DRAFT: "DRAFT",
  NEW: "NEW",
  QUALIFIED: "QUALIFIED",
  PRESELECTION: "PRESELECTION",
  PROPOSED: "PROPOSED",
  IN_PROGRESS: "IN_PROGRESS",
  CONCLUDED: "CONCLUDED",
  ABANDONED: "ABANDONED",
} as const;

export type DemandeStatus = (typeof DEMANDE_STATUS)[keyof typeof DEMANDE_STATUS];

export const demandeStatusLabels: Record<DemandeStatus, string> = {
  DRAFT: "Brouillon",
  NEW: "Nouvelle",
  QUALIFIED: "Qualifiée",
  PRESELECTION: "En présélection",
  PROPOSED: "Profils proposés",
  IN_PROGRESS: "En cours",
  CONCLUDED: "Conclue",
  ABANDONED: "Abandonnée",
};

/** Statuts de candidature / proposition (RG-21). */
export const PROPOSITION_STATUS = {
  RECEIVED: "RECEIVED",
  IN_VERIFICATION: "IN_VERIFICATION",
  PROPOSED: "PROPOSED",
  RETAINED: "RETAINED",
  MEETING_PLANNED: "MEETING_PLANNED",
  PLACED: "PLACED",
  REJECTED: "REJECTED",
} as const;

export type PropositionStatus = (typeof PROPOSITION_STATUS)[keyof typeof PROPOSITION_STATUS];

export const propositionStatusLabels: Record<PropositionStatus, string> = {
  RECEIVED: "Reçue",
  IN_VERIFICATION: "En vérification",
  PROPOSED: "Proposée",
  RETAINED: "Retenue",
  MEETING_PLANNED: "Rencontre planifiée",
  PLACED: "Placée",
  REJECTED: "Écartée",
};

export const FAMILY_INTEREST = { INTERESTED: "INTERESTED", DECLINED: "DECLINED" } as const;
export const INTERVENANT_RESPONSE = { ACCEPTED: "ACCEPTED", REFUSED: "REFUSED" } as const;

/** Statuts admissibles pour une transition de demande (contrôle applicatif). */
export const SETTABLE_DEMANDE_STATUSES: DemandeStatus[] = [
  DEMANDE_STATUS.NEW,
  DEMANDE_STATUS.QUALIFIED,
  DEMANDE_STATUS.PRESELECTION,
  DEMANDE_STATUS.PROPOSED,
  DEMANDE_STATUS.IN_PROGRESS,
  DEMANDE_STATUS.CONCLUDED,
  DEMANDE_STATUS.ABANDONED,
];

/** Enregistre un événement d'activité horodaté (RG-23). */
export async function logActivity(input: {
  demandeId?: string;
  propositionId?: string;
  kind: string;
  message: string;
  performedById?: string;
}): Promise<void> {
  await prisma.activityEvent.create({ data: input });
}
