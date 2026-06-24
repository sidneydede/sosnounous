import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { getAdminStats, concludedShare } from "@/lib/reporting";
import { demandeStatusLabels, type DemandeStatus } from "@/lib/demandes";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Back-office — Reporting", description: "Indicateurs de pilotage." });

function Kpi({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: IconName }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-soft">{label}</span>
        <Icon name={icon} className="h-5 w-5 text-brand-400" />
      </div>
      <p className="mt-2 text-3xl font-bold text-brand-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}

export default async function ReportingPage() {
  await requireRole([ROLES.ADMIN], "/espace/admin/reporting");
  const stats = await getAdminStats();
  const events = await prisma.activityEvent.findMany({ orderBy: { createdAt: "desc" }, take: 12 });

  const maxStatus = Math.max(1, ...Object.values(stats.demandesByStatus));

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Reporting & pilotage</h1>
      <p className="mt-2 text-ink-soft">Vue d&apos;ensemble de l&apos;activité de l&apos;agence.</p>

      {/* Exports CSV (RG-39) */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { href: "/api/admin/export/demandes", label: "Exporter les demandes" },
          { href: "/api/admin/export/intervenants", label: "Exporter les intervenants" },
          { href: "/api/admin/export/avis", label: "Exporter les avis" },
        ].map((x) => (
          <a
            key={x.href}
            href={x.href}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:border-brand-300"
          >
            <Icon name="arrow-right" className="h-4 w-4" /> {x.label} (CSV)
          </a>
        ))}
      </div>

      {/* KPIs principaux */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Demandes" value={String(stats.demandesTotal)} sub={`${stats.placements} placement(s)`} icon="edit" />
        <Kpi label="Taux de transformation" value={`${stats.conversionRate}%`} sub={`${concludedShare(stats)}% conclues`} icon="bolt" />
        <Kpi label="Profils vérifiés" value={`${stats.profilesVerified}/${stats.profilesTotal}`} sub={`${stats.verifiedRate}% de la base`} icon="shield" />
        <Kpi label="Délai 1ʳᵉ proposition" value={stats.avgFirstProposalDays != null ? `${stats.avgFirstProposalDays} j` : "—"} sub="moyenne" icon="clock" />
        <Kpi label="Familles" value={String(stats.families)} icon="users" />
        <Kpi label="Intervenants" value={String(stats.intervenants)} sub={`${stats.profilesPendingReview} en vérification`} icon="profile" />
        <Kpi label="Satisfaction" value={stats.avgRating != null ? `${stats.avgRating.toFixed(1)}/5` : "—"} sub={`${stats.reviewsApproved} avis publiés`} icon="star" />
        <Kpi label="Avis à modérer" value={String(stats.reviewsPending)} icon="check-circle" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Répartition des demandes par statut */}
        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-brand-900">Demandes par statut</h2>
          {stats.demandesTotal > 0 ? (
            <ul className="mt-4 space-y-3">
              {Object.entries(stats.demandesByStatus)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <li key={status}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-soft">{demandeStatusLabels[status as DemandeStatus] ?? status}</span>
                      <span className="font-medium text-brand-900">{count}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-brand-50">
                      <div
                        className={cn("h-full rounded-full", status === "CONCLUDED" ? "bg-emerald-500" : "bg-brand-500")}
                        style={{ width: `${Math.round((count / maxStatus) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">Aucune demande enregistrée.</p>
          )}
        </section>

        {/* Activité récente (supervision — RG-40) */}
        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-brand-900">Activité récente</h2>
          {events.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm">
              {events.map((e) => (
                <li key={e.id} className="flex items-start gap-2">
                  <Icon name="check-circle" className="mt-0.5 h-4 w-4 text-brand-400" />
                  <span className="text-ink-soft">
                    {e.message}
                    <span className="block text-xs text-ink-muted">{new Date(e.createdAt).toLocaleString("fr-FR")}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">Aucune activité récente.</p>
          )}
        </section>
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        Indicateurs calculés en temps réel. Les exports et le suivi par conseiller seront ajoutés
        avec le paramétrage avancé du back-office.
      </p>
    </div>
  );
}
