"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { type Role } from "@/lib/auth/roles";
import { cn } from "@/lib/cn";

interface NavLink {
  href: string;
  label: string;
  icon: IconName;
}

const commonLinks: NavLink[] = [
  { href: "/espace", label: "Tableau de bord", icon: "home" },
];

const roleLinks: Record<Role, NavLink[]> = {
  FAMILY: [
    { href: "/espace/demandes", label: "Mes demandes", icon: "edit" },
    { href: "/espace/documents", label: "Mes documents", icon: "lock" },
  ],
  INTERVENANT: [
    { href: "/espace/intervenant", label: "Mon profil pro", icon: "profile" },
    { href: "/espace/missions", label: "Mes propositions", icon: "handshake" },
    { href: "/espace/disponibilites", label: "Mes disponibilités", icon: "clock" },
  ],
  ADMIN: [
    { href: "/espace/admin/reporting", label: "Reporting", icon: "bolt" },
    { href: "/espace/admin/demandes", label: "Demandes", icon: "edit" },
    { href: "/espace/admin/intervenants", label: "Base de candidats", icon: "users" },
    { href: "/espace/admin/avis", label: "Avis", icon: "star" },
    { href: "/espace/admin/notifications", label: "Notifications", icon: "mail" },
    { href: "/espace/admin/parametrage", label: "Paramétrage", icon: "edit" },
  ],
};

const accountLinks: NavLink[] = [
  { href: "/espace/profil", label: "Mon compte", icon: "profile" },
  { href: "/espace/securite", label: "Sécurité", icon: "lock" },
];

export function AccountNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = [...commonLinks, ...(roleLinks[role] ?? []), ...accountLinks];

  return (
    <nav aria-label="Navigation de l'espace" className="space-y-1">
      {links.map((l) => {
        const active = pathname === l.href || (l.href !== "/espace" && pathname.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-brand-50 text-brand-800" : "text-ink-soft hover:bg-brand-50",
            )}
          >
            <Icon name={l.icon} className="h-5 w-5" />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
