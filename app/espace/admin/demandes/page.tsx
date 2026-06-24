import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { demandeStatusLabels, DEMANDE_STATUS, type DemandeStatus } from "@/lib/demandes";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Back-office — Demandes", description: "Gestion des demandes." });

const TABS: (DemandeStatus | "ALL")[] = [
  "ALL",
  DEMANDE_STATUS.NEW,
  DEMANDE_STATUS.QUALIFIED,
  DEMANDE_STATUS.PRESELECTION,
  DEMANDE_STATUS.PROPOSED,
  DEMANDE_STATUS.IN_PROGRESS,
  DEMANDE_STATUS.CONCLUDED,
];

export default async function AdminDemandesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole([ROLES.ADMIN], "/espace/admin/demandes");
  const { status } = await searchParams;
  const where = status && status !== "ALL" ? { status } : {};

  const demandes = await prisma.demande.findMany({
    where,
    include: { _count: { select: { propositions: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Demandes</h1>
        <a href="/api/admin/export/demandes" className="rounded-full border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:border-brand-300">
          Exporter (CSV)
        </a>
      </div>
      <p className="mt-2 text-ink-soft">Qualifiez, présélectionnez et suivez les demandes des familles.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((s) => {
          const active = (status ?? "ALL") === s;
          const href = s === "ALL" ? "/espace/admin/demandes" : `/espace/admin/demandes?status=${s}`;
          return (
            <Link
              key={s}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium",
                active ? "border-brand-700 bg-brand-700 text-white" : "border-brand-200 text-ink-soft hover:border-brand-300",
              )}
            >
              {s === "ALL" ? "Toutes" : demandeStatusLabels[s as DemandeStatus]}
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-ink-muted">{demandes.length} demande(s)</p>

      {demandes.length > 0 ? (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-brand-100">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Famille</th>
                <th className="px-4 py-3 font-semibold">Besoin</th>
                <th className="px-4 py-3 font-semibold">Profils</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {demandes.map((d) => (
                <tr key={d.id} className="hover:bg-brand-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-900">{d.contactName}</p>
                    <p className="text-xs text-ink-muted">{d.commune}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {d.serviceType} · {d.frequency}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{d._count.propositions}</td>
                  <td className="px-4 py-3">
                    <Badge tone={d.status === "CONCLUDED" ? "success" : "brand"}>
                      {demandeStatusLabels[d.status as DemandeStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/espace/admin/demandes/${d.id}`} className="font-medium text-brand-700 hover:underline">
                      Traiter →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50 p-8 text-center text-sm text-ink-soft">
          Aucune demande pour ce filtre.
        </p>
      )}
    </div>
  );
}
