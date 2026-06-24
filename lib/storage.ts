import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";

/**
 * Stockage sécurisé des pièces justificatives — SERVEUR uniquement (CDC §4.4).
 * - Chiffrement au repos (AES-256-GCM).
 * - Fichiers hors du répertoire public (jamais servis statiquement).
 * - Accès contrôlé exclusivement par les routes serveur authentifiées.
 *
 * Le format du fichier sur disque est : [IV(12o)][authTag(16o)][données chiffrées].
 * (Les constantes/types client-safe sont dans `lib/fileTypes.ts`.)
 */

const IV_LEN = 12;
const TAG_LEN = 16;

function getKey(): Buffer {
  const raw = process.env.FILE_ENCRYPTION_KEY;
  if (!raw || raw.length < 16) {
    throw new Error("FILE_ENCRYPTION_KEY manquant (au moins 16 caractères ; idéalement 64 hex).");
  }
  // Clé hex de 32 octets utilisée telle quelle ; sinon dérivation SHA-256 (32 octets)
  // pour accepter un secret généré par l'hébergeur (ex. Render).
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");
  return createHash("sha256").update(raw).digest();
}

function storageDir(): string {
  return process.env.FILE_STORAGE_DIR ?? path.join(process.cwd(), "storage", "uploads");
}

/** Génère une clé de stockage opaque (nom de fichier sur disque). */
export function generateStorageKey(): string {
  return `${randomBytes(24).toString("hex")}.enc`;
}

/** Chiffre et écrit un fichier sur disque. */
export async function encryptAndStore(storageKey: string, data: Buffer): Promise<void> {
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const dir = storageDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, storageKey), Buffer.concat([iv, authTag, encrypted]));
}

/** Lit et déchiffre un fichier. */
export async function readDecrypted(storageKey: string): Promise<Buffer> {
  const key = getKey();
  const raw = await readFile(path.join(storageDir(), storageKey));
  const iv = raw.subarray(0, IV_LEN);
  const authTag = raw.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const data = raw.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

/** Supprime un fichier du disque (best-effort). */
export async function deleteStored(storageKey: string): Promise<void> {
  await unlink(path.join(storageDir(), storageKey)).catch(() => undefined);
}
