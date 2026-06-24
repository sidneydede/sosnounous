/**
 * Constantes & types des pièces justificatives — sans dépendance Node,
 * importables côté client comme côté serveur.
 * (La logique de chiffrement/stockage est dans `lib/storage.ts`, serveur uniquement.)
 */

export const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

export const FILE_TYPES = ["IDENTITY", "PHOTO", "REFERENCE", "OTHER"] as const;
export type FileType = (typeof FILE_TYPES)[number];

export const fileTypeLabels: Record<FileType, string> = {
  IDENTITY: "Pièce d'identité",
  PHOTO: "Photo",
  REFERENCE: "Justificatif de référence",
  OTHER: "Autre document",
};

export function isFileType(value: string): value is FileType {
  return (FILE_TYPES as readonly string[]).includes(value);
}

export function isAllowedMime(mime: string): boolean {
  return (ALLOWED_MIME as readonly string[]).includes(mime);
}
