import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import {
  parseList,
  profileStatusLabels,
  type ProfileStatus,
} from "@/lib/profiles";
import { AdminProfileActions } from "@/components/account/AdminProfileActions";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { fileTypeLabels, type FileType } from "@/lib/fileTypes";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Back-office — Profil", description: "Détail du profil." });

const eventTypeLabel: Record<string, string> = {
  IDENTITY: "Identité",
  REFERENCES: "Références",
  APTITUDE: "Aptitude",
};

export default async function AdminProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole([ROLES.ADMIN], "/espace/admin/intervenants");
  const { id } = await params;

  const profile = await prisma.intervenantProfile.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, commune: true } },
      references: { orderBy: { createdAt: "asc" } },
      verifications: { orderBy: { performedAt: "desc" } },
      files: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!profile) notFound();

  const status = profile.status as ProfileStatus;

  return (
    <div className="space-y-6">
      <Link href="/espace/admin/intervenants" className="text-sm font-medium text-brand-700 hover:underline">
        ← Retour à la liste
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-brand-900">
          {profile.user.firstName} {profile.user.lastName}
        </h1>
        <Badge tone={status === "VERIFIED" || status === "ACTIVE" ? "success" : "neutral"}>
          {profileStatusLabels[status]}
        </Badge>
        {profile.blacklisted && <Badge tone="accent">Blacklisté</Badge>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coordonnées (admin uniquement) */}
        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-brand-900">Coordonnées</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex gap-2"><dt className="w-28 text-ink-muted">E-mail</dt><dd className="text-brand-900">{profile.user.email}</dd></div>
            <div className="flex gap-2"><dt className="w-28 text-ink-muted">Téléphone</dt><dd className="text-brand-900">{profile.user.phone}</dd></div>
            <div className="flex gap-2"><dt className="w-28 text-ink-muted">Commune</dt><dd className="text-brand-900">{profile.user.commune}</dd></div>
          </dl>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
            <Icon name="lock" className="h-4 w-4" /> Coordonnées visibles par l&apos;agence uniquement.
          </p>
        </section>

        {/* Profil professionnel */}
        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-brand-900">Profil professionnel</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex gap-2"><dt className="w-28 text-ink-muted">Métiers</dt><dd className="text-brand-900">{parseList(profile.metiers).join(", ") || "—"}</dd></div>
            <div className="flex gap-2"><dt className="w-28 text-ink-muted">Zones</dt><dd className="text-brand-900">{parseList(profile.zones).join(", ") || "—"}</dd></div>
            <div className="flex gap-2"><dt className="w-28 text-ink-muted">Expérience</dt><dd className="text-brand-900">{profile.experienceYears} ans</dd></div>
            <div className="flex gap-2"><dt className="w-28 text-ink-muted">Langues</dt><dd className="text-brand-900">{parseList(profile.languages).join(", ") || "—"}</dd></div>
            <div className="flex gap-2"><dt className="w-28 text-ink-muted">Missions</dt><dd className="text-brand-900">{parseList(profile.missionTypes).join(", ") || "—"}</dd></div>
            <div className="flex gap-2"><dt className="w-28 text-ink-muted">Permis</dt><dd className="text-brand-900">{profile.hasDrivingLicense ? "Oui" : "Non"}</dd></div>
          </dl>
          {profile.headline && <p className="mt-3 text-sm italic text-ink-soft">« {profile.headline} »</p>}
        </section>

        {/* Références */}
        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-brand-900">Références</h2>
          {profile.references.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {profile.references.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <span className="text-brand-900">
                    {r.employerName}
                    {r.relationship ? ` — ${r.relationship}` : ""}
                    {r.contact ? ` (${r.contact})` : ""}
                  </span>
                  <Badge tone={r.status === "VERIFIED" ? "success" : "neutral"}>{r.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">Aucune référence.</p>
          )}
        </section>

        {/* Historique des vérifications (RG-10) */}
        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-brand-900">Historique de vérification</h2>
          {profile.verifications.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {profile.verifications.map((v) => (
                <li key={v.id} className="flex items-start gap-2">
                  <Icon name="check-circle" className={v.result === "PASS" ? "mt-0.5 h-4 w-4 text-emerald-600" : "mt-0.5 h-4 w-4 text-ink-muted"} />
                  <span className="text-ink-soft">
                    <span className="font-medium text-brand-900">{eventTypeLabel[v.type] ?? v.type}</span> · {v.result}
                    {v.note ? ` — ${v.note}` : ""}
                    <span className="block text-xs text-ink-muted">
                      {new Date(v.performedAt).toLocaleString("fr-FR")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">Aucune action enregistrée.</p>
          )}
        </section>
      </div>

      {/* Pièces justificatives (CDC §4.4 — accès agence pour vérification) */}
      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-brand-900">Pièces justificatives</h2>
        {profile.files.length > 0 ? (
          <ul className="mt-3 divide-y divide-brand-100">
            {profile.files.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-brand-900">{f.originalName}</p>
                  <p className="text-xs text-ink-muted">{fileTypeLabels[f.type as FileType] ?? f.type}</p>
                </div>
                <a href={`/api/files/${f.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                  <Icon name="arrow-right" className="h-4 w-4" /> Télécharger
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">Aucune pièce déposée par l&apos;intervenant.</p>
        )}
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
          <Icon name="lock" className="h-4 w-4" /> Documents chiffrés, accès réservé à l&apos;agence.
        </p>
      </section>

      {/* Actions agence */}
      <section className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
        <h2 className="text-lg font-semibold text-brand-900">Actions</h2>
        <div className="mt-4">
          <AdminProfileActions
            profileId={profile.id}
            status={status}
            identityVerified={profile.identityVerified}
            referencesVerified={profile.referencesVerified}
            trained={profile.trained}
            blacklisted={profile.blacklisted}
            notes={profile.internalNotes ?? ""}
          />
        </div>
      </section>
    </div>
  );
}
