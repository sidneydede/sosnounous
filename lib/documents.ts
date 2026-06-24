/** Types de documents mis à disposition des familles (RG-26). */
export const DOCUMENT_TYPES = ["DEVIS", "CONTRAT", "ATTESTATION", "FACTURE", "AUTRE"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const documentTypeLabels: Record<DocumentType, string> = {
  DEVIS: "Devis",
  CONTRAT: "Contrat",
  ATTESTATION: "Attestation",
  FACTURE: "Facture",
  AUTRE: "Autre",
};

export function isDocumentType(value: string): value is DocumentType {
  return (DOCUMENT_TYPES as readonly string[]).includes(value);
}

/** Jours de la semaine (calendrier de disponibilités — RG-30). */
export const WEEKDAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;
