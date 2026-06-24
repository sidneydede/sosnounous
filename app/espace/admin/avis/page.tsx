import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { REVIEW_STATUS, reviewStatusLabels, type ReviewStatus } from "@/lib/reviews";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { AdminReviewActions } from "@/components/account/AdminReviewActions";
import { cn } from "@/lib/cn";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Back-office — Avis", description: "Modération des avis." });

const TABS: (ReviewStatus | "ALL")[] = [
  "ALL",
  REVIEW_STATUS.PENDING,
  REVIEW_STATUS.APPROVED,
  REVIEW_STATUS.REJECTED,
  REVIEW_STATUS.HIDDEN,
];

export default async function AdminAvisPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole([ROLES.ADMIN], "/espace/admin/avis");
  const { status } = await searchParams;
  const where = status && status !== "ALL" ? { status } : {};

  const reviews = await prisma.review.findMany({
    where,
    include: {
      author: { select: { firstName: true, lastName: true } },
      profile: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Modération des avis</h1>
        <a href="/api/admin/export/avis" className="rounded-full border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:border-brand-300">
          Exporter (CSV)
        </a>
      </div>
      <p className="mt-2 text-ink-soft">Validez, rejetez ou masquez les avis, et répondez publiquement.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((s) => {
          const active = (status ?? "ALL") === s;
          const href = s === "ALL" ? "/espace/admin/avis" : `/espace/admin/avis?status=${s}`;
          return (
            <Link
              key={s}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium",
                active ? "border-brand-700 bg-brand-700 text-white" : "border-brand-200 text-ink-soft hover:border-brand-300",
              )}
            >
              {s === "ALL" ? "Tous" : reviewStatusLabels[s as ReviewStatus]}
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-ink-muted">{reviews.length} avis</p>

      {reviews.length > 0 ? (
        <ul className="mt-3 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex gap-0.5" aria-label={`Note ${r.rating} sur 5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon key={i} name="star" className={i < r.rating ? "h-4 w-4 text-accent-500" : "h-4 w-4 text-brand-200"} strokeWidth={i < r.rating ? 1 : 1.7} />
                    ))}
                  </span>
                  <Badge tone={r.status === "APPROVED" ? "success" : "neutral"}>
                    {reviewStatusLabels[r.status as ReviewStatus]}
                  </Badge>
                </div>
                <span className="text-xs text-ink-muted">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</span>
              </div>

              <p className="mt-3 text-sm text-ink">« {r.comment} »</p>
              <p className="mt-2 text-xs text-ink-muted">
                Par {r.author.firstName} {r.author.lastName?.charAt(0)}. · concerne {r.profile.user.firstName} {r.profile.user.lastName}
              </p>

              {r.agencyReply && (
                <p className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
                  <span className="font-semibold">Réponse publiée :</span> {r.agencyReply}
                </p>
              )}

              <div className="mt-4 border-t border-brand-100 pt-4">
                <AdminReviewActions reviewId={r.id} status={r.status} reply={r.agencyReply ?? ""} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50 p-8 text-center text-sm text-ink-soft">
          Aucun avis pour ce filtre.
        </p>
      )}
    </div>
  );
}
