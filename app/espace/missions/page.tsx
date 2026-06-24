import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { propositionStatusLabels, type PropositionStatus } from "@/lib/demandes";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { IntervenantPropositionActions } from "@/components/account/IntervenantPropositionActions";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Mes propositions", description: "Vos propositions de mission." });

export default async function MissionsPage() {
  const me = await requireRole([ROLES.INTERVENANT], "/espace/missions");

  const profile = await prisma.intervenantProfile.findUnique({ where: { userId: me.id } });
  const propositions = profile
    ? await prisma.proposition.findMany({
        where: { profileId: profile.id },
        include: { demande: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Mes propositions</h1>
      <p className="mt-2 text-ink-soft">
        Les missions pour lesquelles l&apos;agence vous a proposé(e). Acceptez ou refusez chaque proposition.
      </p>

      {propositions.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {propositions.map((p) => (
            <li key={p.id} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-brand-900">
                    {p.demande.serviceType} · {p.demande.frequency}
                  </h2>
                  <p className="text-sm text-ink-soft">{p.demande.commune}</p>
                </div>
                <Badge tone={p.status === "PLACED" ? "success" : "neutral"}>
                  {propositionStatusLabels[p.status as PropositionStatus]}
                </Badge>
              </div>

              {p.demande.details && <p className="mt-2 text-sm text-ink-soft">{p.demande.details}</p>}

              {p.meetingAt && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-800">
                  <Icon name="clock" className="h-4 w-4" /> Rencontre : {new Date(p.meetingAt).toLocaleString("fr-FR")}
                </p>
              )}

              {/* RG-22 : coordonnées famille seulement après validation */}
              {p.coordinatesReleased ? (
                <div className="mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <p className="font-semibold">Coordonnées de la famille</p>
                  <p>{p.demande.contactName} · {p.demande.contactPhone} · {p.demande.contactEmail}</p>
                </div>
              ) : (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-brand-700">
                  <Icon name="lock" className="h-4 w-4" /> Coordonnées communiquées après validation de l&apos;agence.
                </p>
              )}

              {p.status !== "REJECTED" && (
                <div className="mt-4">
                  <IntervenantPropositionActions propositionId={p.id} current={p.intervenantResponse} />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50 p-8 text-center">
          <Icon name="search" className="mx-auto h-8 w-8 text-brand-400" />
          <p className="mt-2 text-sm text-ink-soft">
            Aucune proposition pour le moment. Veillez à compléter et faire vérifier votre profil
            pour recevoir des offres adaptées.
          </p>
        </div>
      )}
    </div>
  );
}
