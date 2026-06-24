import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { ZoneManager } from "@/components/account/ZoneManager";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Back-office — Zones", description: "Gestion des zones." });

export default async function AdminZonesPage() {
  await requireRole([ROLES.ADMIN], "/espace/admin/parametrage/zones");
  const rows = await prisma.zone.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <Link href="/espace/admin/parametrage" className="text-sm font-medium text-brand-700 hover:underline">
        ← Paramétrage
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-900">Zones d&apos;intervention</h1>
      <p className="mt-2 text-ink-soft">
        Les zones actives alimentent la recherche et les formulaires de demande. Sans zone,
        une liste de communes par défaut est utilisée.
      </p>
      <div className="mt-6">
        <ZoneManager zones={rows} />
      </div>
    </div>
  );
}
