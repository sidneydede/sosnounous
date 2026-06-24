import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/Logo";

/** Mise en page centrée pour les écrans d'authentification. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-bold text-brand-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
      </div>
    </Container>
  );
}
