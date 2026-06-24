import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { toPublicProfile } from "@/lib/profiles";
import {
  demandeStatusLabels,
  propositionStatusLabels,
  type DemandeStatus,
  type PropositionStatus,
} from "@/lib/demandes";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { PropositionInterestButtons } from "@/components/account/PropositionInterestButtons";
import { ReplacementButton } from "@/components/account/ReplacementButton";
import { Conversation } from "@/components/account/Conversation";
import { ReviewForm } from "@/components/account/ReviewForm";
import { documentTypeLabels, type DocumentType } from "@/lib/documents";
import { reviewStatusLabels, type ReviewStatus } from "@/lib/reviews";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Détail de la demande", description: "Suivi de la demande." });

const FAMILY_VISIBLE: PropositionStatus[] = [
  "PROPOSED",
  "RETAINED",
  "MEETING_PLANNED",
  "PLACED",
  "REJECTED",
];

export default async function DemandeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me) redirect("/connexion?next=/espace/demandes");
  if (me.role !== ROLES.FAMILY) redirect("/espace");

  const { id } = await params;
  const demande = await prisma.demande.findUnique({
    where: { id },
    include: {
      propositions: {
        include: {
          profile: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, commune: true } } } },
          review: true,
        },
        orderBy: { createdAt: "asc" },
      },
      messages: {
        include: { sender: { select: { firstName: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!demande || demande.familyId !== me.id) notFound();

  const documents = await prisma.document.findMany({
    where: { demandeId: id, familyId: me.id },
    orderBy: { createdAt: "desc" },
  });

  const status = demande.status as DemandeStatus;
  const visible = demande.propositions.filter((p) =>
    FAMILY_VISIBLE.includes(p.status as PropositionStatus),
  );

  return (
    <div className="space-y-6">
      <Link href="/espace/demandes" className="text-sm font-medium text-brand-700 hover:underline">
        ← Mes demandes
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-brand-900">
          {demande.serviceType} · {demande.frequency}
        </h1>
        <Badge tone={status === "CONCLUDED" ? "success" : "brand"}>{demandeStatusLabels[status]}</Badge>
      </div>

      {/* Récapitulatif */}
      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-brand-900">Votre besoin</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex gap-2"><dt className="w-28 text-ink-muted">Service</dt><dd className="text-brand-900">{demande.serviceType}</dd></div>
          <div className="flex gap-2"><dt className="w-28 text-ink-muted">Fréquence</dt><dd className="text-brand-900">{demande.frequency}</dd></div>
          <div className="flex gap-2"><dt className="w-28 text-ink-muted">Commune</dt><dd className="text-brand-900">{demande.commune}</dd></div>
          {demande.details && <div className="flex gap-2 sm:col-span-2"><dt className="w-28 shrink-0 text-ink-muted">Détails</dt><dd className="text-brand-900">{demande.details}</dd></div>}
        </dl>
      </section>

      {/* Devis (si établi) */}
      {demande.quoteAmount && (
        <section className="rounded-2xl border border-accent-200 bg-accent-50 p-6">
          <h2 className="text-lg font-semibold text-brand-900">Estimation de l&apos;agence</h2>
          <p className="mt-2 text-2xl font-bold text-brand-900">{demande.quoteAmount}</p>
          {demande.quoteNote && <p className="mt-1 text-sm text-ink-soft">{demande.quoteNote}</p>}
        </section>
      )}

      {/* Profils proposés */}
      <section>
        <h2 className="text-lg font-semibold text-brand-900">Profils proposés</h2>
        {visible.length > 0 ? (
          <div className="mt-4 space-y-4">
            {visible.map((p) => {
              const pub = toPublicProfile(p.profile);
              const released = p.coordinatesReleased;
              return (
                <article key={p.id} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-brand-900">{pub.displayName}</h3>
                      <p className="text-sm text-ink-soft">{pub.metiers.join(" · ")}</p>
                    </div>
                    <Badge tone={p.status === "PLACED" ? "success" : "neutral"}>
                      {propositionStatusLabels[p.status as PropositionStatus]}
                    </Badge>
                  </div>

                  <dl className="mt-3 space-y-1 text-sm text-ink-soft">
                    {pub.zones.length > 0 && <div>Zones : {pub.zones.join(", ")}</div>}
                    {pub.experienceYears > 0 && <div>{pub.experienceYears} ans d&apos;expérience</div>}
                    {pub.languages.length > 0 && <div>Langues : {pub.languages.join(", ")}</div>}
                  </dl>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pub.identityVerified && <Badge tone="success"><Icon name="check-circle" className="h-3.5 w-3.5" /> Vérifié</Badge>}
                    {pub.referencesVerified && <Badge tone="brand">Références vérifiées</Badge>}
                    {pub.trained && <Badge tone="accent">Formé(e)</Badge>}
                  </div>

                  {/* RG-22 : coordonnées seulement après validation agence */}
                  {released ? (
                    <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      <p className="font-semibold">Coordonnées communiquées</p>
                      <p>Téléphone : {p.profile.user.phone}</p>
                      <p>E-mail : {p.profile.user.email}</p>
                    </div>
                  ) : (
                    <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
                      <Icon name="lock" className="h-4 w-4 shrink-0" />
                      Coordonnées communiquées après validation de la mise en relation par l&apos;agence.
                    </p>
                  )}

                  {p.status !== "REJECTED" && (
                    <div className="mt-4">
                      <PropositionInterestButtons propositionId={p.id} current={p.familyInterest} />
                    </div>
                  )}

                  {/* Avis après prestation réalisée (RG-24/27) */}
                  {p.status === "PLACED" && (
                    <div className="mt-4 border-t border-brand-100 pt-4">
                      <h4 className="text-sm font-semibold text-brand-900">Votre avis</h4>
                      {p.review ? (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <span className="flex gap-0.5" aria-label={`Note ${p.review.rating} sur 5`}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Icon key={i} name="star" className={i < p.review!.rating ? "h-4 w-4 text-accent-500" : "h-4 w-4 text-brand-200"} strokeWidth={i < p.review!.rating ? 1 : 1.7} />
                              ))}
                            </span>
                            <Badge tone={p.review.status === "APPROVED" ? "success" : "neutral"}>
                              {reviewStatusLabels[p.review.status as ReviewStatus]}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-ink-soft">« {p.review.comment} »</p>
                          {p.review.agencyReply && (
                            <p className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
                              <span className="font-semibold">Réponse de l&apos;agence :</span> {p.review.agencyReply}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3">
                          <ReviewForm propositionId={p.id} />
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50 p-6 text-sm text-ink-soft">
            Aucun profil proposé pour le moment. Notre conseiller analyse votre demande et vous
            proposera bientôt des profils vérifiés.
          </p>
        )}
      </section>

      {/* Documents (RG-26 : lecture seule, téléchargeables) */}
      {documents.length > 0 && (
        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-brand-900">Mes documents</h2>
          <ul className="mt-3 divide-y divide-brand-100">
            {documents.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-brand-900">{d.title}</p>
                  <p className="text-xs text-ink-muted">{documentTypeLabels[d.type as DocumentType] ?? d.type}</p>
                </div>
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                  <Icon name="arrow-right" className="h-4 w-4" /> Télécharger
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Messagerie avec le conseiller (RG-25) */}
      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-brand-900">Échanger avec mon conseiller</h2>
        <div className="mt-4">
          <Conversation
            demandeId={demande.id}
            currentUserId={me.id}
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

      {/* Remplacement (après placement) */}
      {status === "CONCLUDED" && (
        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-brand-900">Besoin d&apos;un remplacement ?</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Signalez une indisponibilité : l&apos;agence vous proposera rapidement un remplacement.
          </p>
          <div className="mt-4">
            <ReplacementButton demandeId={demande.id} />
          </div>
        </section>
      )}
    </div>
  );
}
