import Link from "next/link";
import { requireRole } from "@/lib/auth/guard";
import { ROLES } from "@/lib/auth/roles";
import { Icon, type IconName } from "@/components/ui/Icon";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Back-office — Paramétrage", description: "Paramétrage & contenus." });

const sections: { href: string; title: string; description: string; icon: IconName }[] = [
  { href: "/espace/admin/parametrage/services", title: "Services", description: "Gérer le catalogue de services (pages, recherche, formulaires).", icon: "home" },
  { href: "/espace/admin/parametrage/zones", title: "Zones d'intervention", description: "Gérer les communes proposées dans la recherche et les demandes.", icon: "location" },
  { href: "/espace/admin/parametrage/faq", title: "FAQ", description: "Créer et modifier les questions fréquentes (contenu public).", icon: "edit" },
  { href: "/espace/admin/parametrage/tarifs", title: "Barèmes & tarifs", description: "Gérer la grille tarifaire indicative affichée publiquement.", icon: "bolt" },
  { href: "/espace/admin/parametrage/notifications-modeles", title: "Modèles de notifications", description: "Personnaliser l'objet et le corps des notifications e-mail / SMS.", icon: "mail" },
];

export default async function ParametragePage() {
  await requireRole([ROLES.ADMIN], "/espace/admin/parametrage");
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Paramétrage &amp; contenus</h1>
      <p className="mt-2 text-ink-soft">
        Modifiez les contenus et réglages du site sans intervention technique (RG-41/42).
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Icon name={s.icon} />
            </span>
            <h2 className="mt-4 text-base font-semibold text-brand-900">{s.title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
