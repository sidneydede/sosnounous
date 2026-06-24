import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { searchProfiles } from "@/lib/matching";
import {
  demandeStatusLabels,
  propositionStatusLabels,
  type DemandeStatus,
  type PropositionStatus,
} from "@/lib/demandes";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { AdminDemandeActions } from "@/components/account/AdminDemandeActions";
import { AdminPropositionActions } from "@/components/account/AdminPropositionActions";
import { AddPropositionButton } from "@/components/account/AddPropositionButton";
import { Conversation } from "@/components/account/Conversation";
import { AddDocumentForm } from "@/components/account/AddDocumentForm";
import { AdminDeleteDocButton } from "@/components/account/AdminDeleteDocButton";
import { documentTypeLabels, type DocumentType } from "@/lib/documents";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Back-office — Demande", description: "Traitement de la demande." });

export default async function AdminDemandeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireRole([ROLES.ADMIN], "/espace/admin/demandes");
  const { id } = await params;

  const demande = await prisma.demande.findUnique({
    where: { id },
    include: {
      propositions: {
        include: { profile: { include: { user: { select: { firstName: true, lastName: true } } } } },
        orderBy: { createdAt: "asc" },
      },
      events: { orderBy: { createdAt: "desc" } },
      messages: {
        include: { sender: { select: { firstName: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!demande) notFound();

  const documents = await prisma.document.findMany({
    where: { demandeId: id },
    orderBy: { createdAt: "desc" },
  });

  const status = demande.status as DemandeStatus;
  const proposedIds = new Set(demande.propositions.map((p) => p.profileId));

  // Présélection assistée par le moteur de matching (RG-13)
  const suggestions = (
    await searchProfiles({
      metier: demande.serviceType,
      zone: demande.commune,
      frequency: demande.frequency,
    })
  )
    .filter((p) => !proposedIds.has(p.id))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <Link href="/espace/admin/demandes" className="text-sm font-medium text-brand-700 hover:underline">
        ← Demandes
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-brand-900">{demande.contactName}</h1>
        <Badge tone={status === "CONCLUDED" ? "success" : "brand"}>{demandeStatusLabels[status]}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coordonnées & besoin */}
        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-brand-900">Demande</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex gap-2"><dt className="w-28 text-ink-muted">Contact</dt><dd className="text-brand-900">{demande.contactEmail} · {demande.contactPhone}</dd></div>
            <div className="flex gap-2"><dt className="w-28 text-ink-muted">Service</dt><dd className="text-brand-900">{demande.serviceType} · {demande.frequency}</dd></div>
            <div className="flex gap-2"><dt className="w-28 text-ink-muted">Commune</dt><dd className="text-brand-900">{demande.commune}</dd></div>
            {demande.details && <div className="flex gap-2"><dt className="w-28 shrink-0 text-ink-muted">Détails</dt><dd className="text-brand-900">{demande.details}</dd></div>}
            <div className="flex gap-2"><dt className="w-28 text-ink-muted">Compte</dt><dd className="text-brand-900">{demande.familyId ? "Famille inscrite" : "Invité"}</dd></div>
          </dl>
        </section>

        {/* Actions */}
        <section className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
          <h2 className="text-lg font-semibold text-brand-900">Traitement</h2>
          <div className="mt-4">
            <AdminDemandeActions
              demandeId={demande.id}
              status={status}
              assigned={Boolean(demande.assignedToId)}
              quoteAmount={demande.quoteAmount ?? ""}
              quoteNote={demande.quoteNote ?? ""}
              notes={demande.internalNotes ?? ""}
            />
          </div>
        </section>
      </div>

      {/* Propositions en cours */}
      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-brand-900">Profils proposés</h2>
        {demande.propositions.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {demande.propositions.map((p) => (
              <li key={p.id} className="rounded-xl border border-brand-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-brand-900">
                    {p.profile.user.firstName} {p.profile.user.lastName}
                  </p>
                  <Badge tone={p.status === "PLACED" ? "success" : "neutral"}>
                    {propositionStatusLabels[p.status as PropositionStatus]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  Intérêt famille : {p.familyInterest ?? "—"} · Réponse intervenant : {p.intervenantResponse ?? "—"}
                  {p.coordinatesReleased ? " · Coordonnées communiquées" : ""}
                </p>
                <div className="mt-3">
                  <AdminPropositionActions
                    propositionId={p.id}
                    coordinatesReleased={p.coordinatesReleased}
                    status={p.status}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">Aucun profil proposé. Sélectionnez ci-dessous.</p>
        )}
      </section>

      {/* Présélection assistée (matching) */}
      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-brand-900">Présélection suggérée</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Profils vérifiés classés par pertinence selon le besoin (service, zone, fréquence).
        </p>
        {suggestions.length > 0 ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {suggestions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-brand-100 p-4">
                <div className="min-w-0">
                  <p className="font-medium text-brand-900">{s.displayName}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {s.metiers.join(", ")} · {s.zones.join(", ")} · score {s.score}
                  </p>
                </div>
                <AddPropositionButton demandeId={demande.id} profileId={s.id} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">Aucun profil vérifié supplémentaire ne correspond.</p>
        )}
      </section>

      {/* Documents mis à disposition (RG-26) */}
      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-brand-900">Documents de la famille</h2>
        {!demande.familyId && (
          <p className="mt-2 text-sm text-ink-muted">
            Demande sans compte famille rattaché : la mise à disposition de documents nécessite un compte.
          </p>
        )}
        {documents.length > 0 && (
          <ul className="mt-3 divide-y divide-brand-100">
            {documents.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="truncate font-medium text-brand-700 hover:underline">
                    {d.title}
                  </a>
                  <p className="text-xs text-ink-muted">{documentTypeLabels[d.type as DocumentType] ?? d.type}</p>
                </div>
                <AdminDeleteDocButton id={d.id} />
              </li>
            ))}
          </ul>
        )}
        {demande.familyId && (
          <div className="mt-4">
            <AddDocumentForm demandeId={demande.id} />
          </div>
        )}
      </section>

      {/* Messagerie avec la famille (RG-25) */}
      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-brand-900">Messagerie</h2>
        <div className="mt-4">
          <Conversation
            demandeId={demande.id}
            currentUserId={admin.id}
            messages={demande.messages.map((m) => ({
              id: m.id,
              body: m.body,
              senderId: m.senderId,
              senderName: m.sender.firstName,
              senderRole: m.senderRole,
              createdAt: m.createdAt.toISOString(),
            }))}
          />
        </div>
      </section>

      {/* Journal d'activité (RG-23) */}
      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-brand-900">Journal d&apos;activité</h2>
        {demande.events.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm">
            {demande.events.map((e) => (
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
          <p className="mt-3 text-sm text-ink-muted">Aucune activité.</p>
        )}
      </section>
    </div>
  );
}
