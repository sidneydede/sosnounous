import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { demandeStatusLabels, type DemandeStatus } from "@/lib/demandes";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Mes demandes", description: "Suivi de vos demandes." });

export default async function MesDemandesPage() {
  const me = await requireRole([ROLES.FAMILY], "/espace/demandes");
  const demandes = await prisma.demande.findMany({
    where: { familyId: me.id },
    include: { _count: { select: { propositions: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Mes demandes</h1>
        <ButtonLink href="/tarifs" variant="accent" size="sm">
          Nouvelle demande
        </ButtonLink>
      </div>
      <p className="mt-2 text-ink-soft">Suivez l&apos;avancement de vos demandes et les profils proposés.</p>

      {demandes.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {demandes.map((d) => (
            <li key={d.id}>
              <Link
                href={`/espace/demandes/${d.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-soft transition-colors hover:border-brand-200"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-brand-900">
                    {d.serviceType} · {d.frequency}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {d.commune} · {d._count.propositions} profil(s) proposé(s) ·{" "}
                    {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge tone={d.status === "CONCLUDED" ? "success" : "brand"}>
                    {demandeStatusLabels[d.status as DemandeStatus]}
                  </Badge>
                  <Icon name="arrow-right" className="h-5 w-5 text-brand-400" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50 p-8 text-center">
          <Icon name="edit" className="mx-auto h-8 w-8 text-brand-400" />
          <p className="mt-2 text-sm text-ink-soft">
            Vous n&apos;avez pas encore de demande. Décrivez votre besoin pour recevoir des profils.
          </p>
          <div className="mt-4">
            <ButtonLink href="/tarifs" variant="accent">
              Déposer une demande
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
