import { prisma } from "@/lib/db";
import { faqItems, type FaqItem } from "@/lib/data/faq";
import { services as staticServices, type Service, type Frequency } from "@/lib/data/services";
import { parseList } from "@/lib/profiles";

/**
 * Lecture des contenus éditoriaux & paramétrage (M9 — RG-41/42).
 * Les pages publiques lisent la base ; repli sur les données initiales si vide,
 * afin que le site reste alimenté avant toute saisie dans le back-office.
 */

/** FAQ publiée (CMS — RG-42), avec repli sur la FAQ initiale. */
export async function getPublicFaq(): Promise<FaqItem[]> {
  let rows;
  try {
    rows = await prisma.faqEntry.findMany({
      where: { published: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });
  } catch {
    return faqItems;
  }
  if (rows.length === 0) return faqItems;
  return rows.map((r) => ({
    question: r.question,
    answer: r.answer,
    category: r.category as FaqItem["category"],
  }));
}

/** Catalogue de services publié (CMS — RG-42), avec repli sur le catalogue statique. */
export async function getServices(): Promise<Service[]> {
  let rows;
  try {
    rows = await prisma.service.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return staticServices;
  }
  if (rows.length === 0) return staticServices;
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    shortName: r.shortName,
    tagline: r.tagline ?? "",
    description: r.description,
    longDescription: r.longDescription ?? "",
    tasks: parseList(r.tasks),
    frequencies: parseList(r.frequencies) as Frequency[],
    useCases: parseList(r.useCases),
    icon: r.icon,
  }));
}

/** Un service par slug (DB publié, sinon repli statique). */
export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  const all = await getServices();
  return all.find((s) => s.slug === slug);
}

/** Communes d'intervention par défaut (repli si aucune zone paramétrée). */
export const DEFAULT_ZONES = [
  "Cocody", "Plateau", "Marcory", "Yopougon", "Treichville", "Abobo",
  "Adjamé", "Riviera", "Koumassi", "Port-Bouët", "Attécoubé", "Bingerville",
];

/** Zones actives (paramétrage — RG-41), avec repli sur la liste par défaut. */
export async function getActiveZoneNames(): Promise<string[]> {
  try {
    const rows = await prisma.zone.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.length > 0 ? rows.map((z) => z.name) : DEFAULT_ZONES;
  } catch {
    return DEFAULT_ZONES;
  }
}

export interface PublicTarif {
  service: string;
  label: string;
  amount: string;
  unit: string | null;
  note: string | null;
}

/** Barèmes indicatifs publiés (paramétrage — RG-41). */
export async function getPublicTarifs(): Promise<PublicTarif[]> {
  let rows;
  try {
    rows = await prisma.tarif.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
  return rows.map((r) => ({
    service: r.service,
    label: r.label,
    amount: r.amount,
    unit: r.unit,
    note: r.note,
  }));
}
