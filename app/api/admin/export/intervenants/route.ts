import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { toCsv, csvResponse } from "@/lib/csv";
import { parseList, profileStatusLabels, type ProfileStatus } from "@/lib/profiles";

/** Export CSV de la base de candidats (reporting — RG-39). Réservé à l'agence. */
export async function GET() {
  const me = await getSessionUser();
  if (!me || me.role !== ROLES.ADMIN)
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });

  const profiles = await prisma.intervenantProfile.findMany({
    include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, commune: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const headers = ["Nom", "Prénom", "E-mail", "Téléphone", "Commune", "Métiers", "Zones", "Expérience", "Statut", "Identité vérifiée", "Réf. vérifiées", "Formé", "Blacklist", "Note"];
  const rows = profiles.map((p) => [
    p.user.lastName,
    p.user.firstName,
    p.user.email,
    p.user.phone,
    p.user.commune,
    parseList(p.metiers).join(" / "),
    parseList(p.zones).join(" / "),
    p.experienceYears,
    profileStatusLabels[p.status as ProfileStatus] ?? p.status,
    p.identityVerified ? "Oui" : "Non",
    p.referencesVerified ? "Oui" : "Non",
    p.trained ? "Oui" : "Non",
    p.blacklisted ? "Oui" : "Non",
    p.rating != null ? p.rating.toFixed(1) : "",
  ]);

  return csvResponse("intervenants.csv", toCsv(headers, rows));
}
