import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

interface Crumb {
  label: string;
  href?: string;
}

/** En-tête de page intérieure avec fil d'Ariane (CDC §5.3). */
export function PageHero({
  title,
  description,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
}) {
  return (
    <section className="border-b border-brand-100 bg-white">
      <Container className="py-10 sm:py-14">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Fil d'Ariane" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-soft">
              <li>
                <Link href="/" className="hover:text-brand-700">
                  Accueil
                </Link>
              </li>
              {breadcrumbs.map((c) => (
                <li key={c.label} className="flex items-center gap-1.5">
                  <Icon name="arrow-right" className="h-3.5 w-3.5 text-ink-muted" />
                  {c.href ? (
                    <Link href={c.href} className="hover:text-brand-700">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-brand-900" aria-current="page">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="max-w-3xl text-3xl font-bold sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
