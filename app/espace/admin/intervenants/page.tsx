import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import {
  profileStatusLabels,
  parseList,
  PROFILE_STATUS,
  type ProfileStatus,
} from "@/lib/profiles";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Back-office — Intervenants", description: "Gestion des profils." });

const STATUS_TABS: (ProfileStatus | "ALL")[] = [
  "ALL",
  PROFILE_STATUS.SUBMITTED,
  PROFILE_STATUS.IN_REVIEW,
  PROFILE_STATUS.VERIFIED,
  PROFILE_STATUS.ACTIVE,
  PROFILE_STATUS.SUSPENDED,
];

export default async function AdminIntervenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole([ROLES.ADMIN], "/espace/admin/intervenants");
  const { status } = await searchParams;
  const filter = status && status !== "ALL" ? { status } : {};

  const profiles = await prisma.intervenantProfile.findMany({
    where: filter,
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Base de candidats</h1>
        <a href="/api/admin/export/intervenants" className="rounded-full border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:border-brand-300">
          Exporter (CSV)
        </a>
      </div>
      <p className="mt-2 text-ink-soft">
        Vérifiez, qualifiez et gérez le cycle de vie des profils intervenants.
      </p>

      {/* Filtres par statut */}
      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => {
          const active = (status ?? "ALL") === s;
          const href = s === "ALL" ? "/espace/admin/intervenants" : `/espace/admin/intervenants?status=${s}`;
          return (
            <Link
              key={s}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium",
                active ? "border-brand-700 bg-brand-700 text-white" : "border-brand-200 text-ink-soft hover:border-brand-300",
              )}
            >
              {s === "ALL" ? "Tous" : profileStatusLabels[s as ProfileStatus]}
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-ink-muted">{profiles.length} profil(s)</p>

      {profiles.length > 0 ? (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-brand-100">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Nom</th>
                <th className="px-4 py-3 font-semibold">Métiers</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Badges</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-brand-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-900">
                      {p.user.firstName} {p.user.lastName}
                    </p>
                    <p className="text-xs text-ink-muted">{p.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {parseList(p.metiers).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={p.status === "VERIFIED" || p.status === "ACTIVE" ? "success" : "neutral"}>
                      {profileStatusLabels[p.status as ProfileStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.identityVerified && <Icon name="check-circle" className="h-4 w-4 text-emerald-600" title="Identité vérifiée" />}
                      {p.referencesVerified && <Icon name="users" className="h-4 w-4 text-brand-600" title="Références vérifiées" />}
                      {p.trained && <Icon name="graduation" className="h-4 w-4 text-accent-600" title="Formé" />}
                      {p.blacklisted && <Icon name="lock" className="h-4 w-4 text-red-600" title="Blacklisté" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/espace/admin/intervenants/${p.id}`} className="font-medium text-brand-700 hover:underline">
                      Gérer →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50 p-8 text-center text-sm text-ink-soft">
          Aucun profil pour ce filtre.
        </p>
      )}
    </div>
  );
}
