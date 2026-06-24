import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getOrCreateProfile, serializeList } from "@/lib/profiles";
import { encryptAndStore, generateStorageKey } from "@/lib/storage";
import { isAllowedMime, isFileType, MAX_FILE_SIZE } from "@/lib/fileTypes";
import { rateLimit, clientKey } from "@/lib/rateLimit";

/**
 * Dépôt d'une pièce justificative par l'intervenant (CDC §4.4).
 * Le fichier est validé, chiffré et stocké hors web ; seules les métadonnées
 * sont conservées en base.
 */
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  if (me.role !== ROLES.INTERVENANT)
    return NextResponse.json({ ok: false, error: "Réservé aux intervenants." }, { status: 403 });

  const limit = rateLimit(clientKey(req, `upload:${me.id}`), { max: 20, windowMs: 60_000 });
  if (!limit.allowed)
    return NextResponse.json({ ok: false, error: "Trop d'envois. Patientez un instant." }, { status: 429 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const file = form.get("file");
  const type = String(form.get("type") ?? "OTHER");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Fichier manquant." }, { status: 422 });
  }
  if (!isFileType(type)) {
    return NextResponse.json({ ok: false, error: "Type de document invalide." }, { status: 422 });
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { ok: false, error: "Fichier vide ou trop volumineux (5 Mo maximum)." },
      { status: 422 },
    );
  }
  if (!isAllowedMime(file.type)) {
    return NextResponse.json(
      { ok: false, error: "Format non autorisé (JPEG, PNG, WEBP ou PDF)." },
      { status: 422 },
    );
  }

  const profile = await getOrCreateProfile({
    id: me.id,
    metiers: serializeList(me.metiers),
    commune: me.commune,
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const storageKey = generateStorageKey();

  try {
    await encryptAndStore(storageKey, buffer);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Stockage indisponible (configuration de chiffrement)." },
      { status: 500 },
    );
  }

  await prisma.intervenantFile.create({
    data: {
      profileId: profile.id,
      type,
      originalName: file.name.slice(0, 255),
      mimeType: file.type,
      size: file.size,
      storageKey,
    },
  });

  return NextResponse.json({ ok: true });
}
