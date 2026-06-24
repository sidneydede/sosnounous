import { Container } from "@/components/ui/Container";
import { AccountNav } from "@/components/account/AccountNav";
import { LogoutButton } from "@/components/account/LogoutButton";
import { requireUser } from "@/lib/auth/guard";
import { roleLabels } from "@/lib/auth/roles";

/**
 * Layout de l'espace personnel (zone authentifiée).
 * Protégé par requireUser : tout accès non authentifié est redirigé (RBAC).
 */
export default async function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <Container className="py-10 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-600">
              {roleLabels[user.role]}
            </p>
            <p className="mt-1 truncate font-semibold text-brand-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-sm text-ink-muted">{user.email}</p>
          </div>
          <div className="mt-4">
            <AccountNav role={user.role} />
          </div>
          <div className="mt-4 border-t border-brand-100 pt-4">
            <LogoutButton />
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
