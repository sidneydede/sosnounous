import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { ROLES, roleLabels } from "@/lib/auth/roles";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Mon espace", description: "Votre tableau de bord." });

interface ActionCard {
  href: string;
  title: string;
  description: string;
  icon: IconName;
  soon?: boolean;
}

const cardsByRole: Record<string, ActionCard[]> = {
  [ROLES.FAMILY]: [
    { href: "/tarifs", title: "Déposer une demande", description: "Décrivez votre besoin et recevez des profils vérifiés.", icon: "edit" },
    { href: "/espace/demandes", title: "Suivi de mes demandes", description: "Statut de vos demandes et profils proposés.", icon: "users" },
    { href: "/trouver-un-intervenant", title: "Consulter les profils", description: "Parcourez les profils vérifiés et anonymisés.", icon: "search" },
    { href: "/espace/documents", title: "Mes documents", description: "Devis, contrats et attestations.", icon: "lock" },
  ],
  [ROLES.INTERVENANT]: [
    { href: "/espace/intervenant", title: "Mon profil professionnel", description: "Métiers, zones, expérience, disponibilités et références.", icon: "profile" },
    { href: "/espace/missions", title: "Mes propositions", description: "Acceptez ou refusez les missions proposées.", icon: "handshake" },
    { href: "/espace/disponibilites", title: "Mes disponibilités", description: "Gérez votre calendrier de disponibilités.", icon: "clock" },
  ],
  [ROLES.ADMIN]: [
    { href: "/espace/admin/demandes", title: "Demandes & mise en relation", description: "Qualifier, présélectionner et proposer des profils.", icon: "edit" },
    { href: "/espace/admin/intervenants", title: "Base de candidats", description: "Vérifier les profils, gérer les statuts et la base.", icon: "users" },
    { href: "/espace/admin/avis", title: "Modération des avis", description: "Valider, masquer et répondre aux avis.", icon: "star" },
    { href: "/espace/admin/reporting", title: "Reporting", description: "Volumes, taux de placement, satisfaction.", icon: "bolt" },
    { href: "/espace/admin/parametrage", title: "Paramétrage & contenus", description: "FAQ, barèmes : éditer sans intervention technique.", icon: "edit" },
  ],
};

export default async function EspacePage() {
  // L'utilisateur est garanti par le layout (requireUser).
  const user = (await getSessionUser())!;
  const cards = cardsByRole[user.role] ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900 sm:text-3xl">
        Bonjour {user.firstName} 👋
      </h1>
      <p className="mt-2 text-ink-soft">
        Bienvenue dans votre espace {roleLabels[user.role].toLowerCase()}.
      </p>

      {/* Bandeau intervenant : complétude */}
      {user.role === ROLES.INTERVENANT && (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Icon name="profile" className="mt-0.5 h-6 w-6 text-accent-600" />
            <div>
              <p className="font-semibold text-brand-900">Complétez votre profil</p>
              <p className="text-sm text-ink-soft">
                Un profil complet et vérifié est davantage proposé aux familles.
              </p>
            </div>
          </div>
          <ButtonLink href="/espace/intervenant" variant="accent" size="sm">
            Compléter
          </ButtonLink>
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {cards.map((card, i) => {
          const content = (
            <>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icon name={card.icon} />
              </span>
              <div className="mt-4 flex items-center gap-2">
                <h2 className="text-base font-semibold text-brand-900">{card.title}</h2>
                {card.soon && (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-brand-700">
                    Bientôt
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-ink-soft">{card.description}</p>
            </>
          );

          return card.soon ? (
            <div key={i} className="rounded-2xl border border-brand-100 bg-white p-6 opacity-70 shadow-soft">
              {content}
            </div>
          ) : (
            <Link
              key={i}
              href={card.href}
              className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
