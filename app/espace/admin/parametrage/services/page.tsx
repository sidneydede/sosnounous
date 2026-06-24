import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { parseList } from "@/lib/profiles";
import { ServiceManager } from "@/components/account/ServiceManager";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Back-office — Services", description: "Gestion des services." });

export default async function AdminServicesPage() {
  await requireRole([ROLES.ADMIN], "/espace/admin/parametrage/services");
  const rows = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <Link href="/espace/admin/parametrage" className="text-sm font-medium text-brand-700 hover:underline">
        ← Paramétrage
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-900">Services</h1>
      <p className="mt-2 text-ink-soft">
        Gérez le catalogue de services (pages publiques, recherche et formulaires). Sans entrée,
        le catalogue par défaut est utilisé.
      </p>
      <div className="mt-6">
        <ServiceManager
          services={rows.map((s) => ({
            id: s.id,
            slug: s.slug,
            name: s.name,
            shortName: s.shortName,
            tagline: s.tagline ?? "",
            description: s.description,
            longDescription: s.longDescription ?? "",
            icon: s.icon,
            tasks: parseList(s.tasks),
            frequencies: parseList(s.frequencies),
            useCases: parseList(s.useCases),
            sortOrder: s.sortOrder,
            published: s.published,
          }))}
        />
      </div>
    </div>
  );
}
