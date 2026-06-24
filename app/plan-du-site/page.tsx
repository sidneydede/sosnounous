import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { mainNav, footerLegalNav } from "@/lib/data/site";
import { services } from "@/lib/data/services";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Plan du site",
  description: "Toutes les pages du site SOS Nounous & Services.",
  path: "/plan-du-site",
});

const linkClass = "text-brand-700 hover:text-accent-600 hover:underline";

export default function PlanDuSitePage() {
  return (
    <>
      <PageHero title="Plan du site" breadcrumbs={[{ label: "Plan du site" }]} />
      <Section>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-base font-semibold text-brand-900">Pages principales</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/" className={linkClass}>
                  Accueil
                </Link>
              </li>
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-brand-900">Services</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className={linkClass}>
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-brand-900">Espaces & compte</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/connexion" className={linkClass}>
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/inscription" className={linkClass}>
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link href="/mot-de-passe-oublie" className={linkClass}>
                  Mot de passe oublié
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-brand-900">Informations légales</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {footerLegalNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
