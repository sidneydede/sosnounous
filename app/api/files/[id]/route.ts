import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { readDecrypted } from "@/lib/storage";

/**
 * Téléchargement d'une pièce justificative (CDC §4.4 — accès restreint).
 * Autorisé uniquement à l'intervenant propriétaire et à l'agence. Jamais public,
 * jamais accessible aux familles. Le contenu est déchiffré à la volée.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });

  const { id } = await params;
  const file = await prisma.intervenantFile.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  });
  if (!file) return NextResponse.json({ ok: false, error: "Fichier introuvable." }, { status: 404 });

  const isOwner = me.role === ROLES.INTERVENANT && file.profile.userId === me.id;
  const isAgency = me.role === ROLES.ADMIN;
  if (!isOwner && !isAgency) {
    return NextResponse.json({ ok: false, error: "Accès refusé." }, { status: 403 });
  }

  let data: Buffer;
  try {
    data = await readDecrypted(file.storageKey);
  } catch {
    return NextResponse.json({ ok: false, error: "Fichier illisible." }, { status: 500 });
  }

  // Téléchargement forcé + anti-sniffing (sécurité)
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.originalName)}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
