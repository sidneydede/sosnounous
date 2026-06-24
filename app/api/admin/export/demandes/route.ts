import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { toCsv, csvResponse } from "@/lib/csv";
import { demandeStatusLabels, type DemandeStatus } from "@/lib/demandes";

/** Export CSV des demandes (reporting — RG-39). Réservé à l'agence. */
export async function GET() {
  const me = await getSessionUser();
  if (!me || me.role !== ROLES.ADMIN)
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const demandes = await prisma.demande.findMany({
    include: { _count: { select: { propositions: true } } },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["Date", "Nom", "E-mail", "Téléphone", "Service", "Fréquence", "Commune", "Statut", "Profils proposés", "Devis"];
  const rows = demandes.map((d) => [
    new Date(d.createdAt).toLocaleString("fr-FR"),
    d.contactName,
    d.contactEmail,
    d.contactPhone,
    d.serviceType,
    d.frequency,
    d.commune,
    demandeStatusLabels[d.status as DemandeStatus] ?? d.status,
    d._count.propositions,
    d.quoteAmount ?? "",
  ]);

  return csvResponse("demandes.csv", toCsv(headers, rows));
}
