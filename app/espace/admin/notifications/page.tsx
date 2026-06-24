import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { eventLabel } from "@/lib/notificationEvents";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Back-office — Notifications", description: "Journal des envois." });

const STATUS_TABS = ["ALL", "SENT", "MOCKED", "SKIPPED", "FAILED"] as const;
const statusTone: Record<string, "success" | "neutral" | "accent"> = {
  SENT: "success",
  MOCKED: "neutral",
  SKIPPED: "neutral",
  FAILED: "accent",
};
const statusLabel: Record<string, string> = {
  SENT: "Envoyé",
  MOCKED: "Simulé",
  SKIPPED: "Ignoré (préférence)",
  FAILED: "Échec",
};

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole([ROLES.ADMIN], "/espace/admin/notifications");
  const { status } = await searchParams;
  const where = status && status !== "ALL" ? { status } : {};

  const logs = await prisma.notificationLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Journal des notifications</h1>
      <p className="mt-2 text-ink-soft">
        Traçabilité des envois e-mail / SMS (RG-38). 100 entrées les plus récentes.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => {
          const active = (status ?? "ALL") === s;
          const href = s === "ALL" ? "/espace/admin/notifications" : `/espace/admin/notifications?status=${s}`;
          return (
            <Link
              key={s}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium",
                active ? "border-brand-700 bg-brand-700 text-white" : "border-brand-200 text-ink-soft hover:border-brand-300",
              )}
            >
              {s === "ALL" ? "Tous" : statusLabel[s] ?? s}
            </Link>
          );
        })}
      </div>

      {logs.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-100">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Canal</th>
                <th className="px-4 py-3 font-semibold">Événement</th>
                <th className="px-4 py-3 font-semibold">Destinataire</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-brand-50/50">
                  <td className="px-4 py-3 text-ink-muted">{new Date(l.createdAt).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3 uppercase text-ink-soft">{l.channel}</td>
                  <td className="px-4 py-3 text-ink-soft">{eventLabel(l.event)}</td>
                  <td className="px-4 py-3 text-ink-soft">{l.recipient}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[l.status] ?? "neutral"}>{statusLabel[l.status] ?? l.status}</Badge>
                    {l.error && <p className="mt-1 text-xs text-red-600">{l.error}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50 p-8 text-center text-sm text-ink-soft">
          Aucun envoi enregistré pour ce filtre.
        </p>
      )}
    </div>
  );
}
