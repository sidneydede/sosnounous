import Link from "next/link";
import { footerLegalNav, mainNav, site } from "@/lib/data/site";
import { services } from "@/lib/data/services";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-brand-100 bg-brand-900 text-brand-100">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Marque */}
        <div>
          <Logo tone="onDark" />
          <p className="mt-4 text-sm leading-relaxed text-brand-200">
            {site.baseline}
          </p>
          <p className="mt-4 font-display text-base font-semibold text-accent-300">
            {site.signature}
          </p>
        </div>

        {/* Navigation */}
        <nav aria-label="Navigation du pied de page">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
            Navigation
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-brand-200 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Services */}
        <nav aria-label="Nos services">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
            Nos services
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-brand-200 hover:text-white"
                >
                  {s.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
            Contact
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Icon name="phone" className="h-4 w-4 text-accent-300" />
              <a
                href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                className="text-brand-200 hover:text-white"
              >
                {site.contact.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Icon name="mail" className="h-4 w-4 text-accent-300" />
              <a
                href={`mailto:${site.contact.email}`}
                className="text-brand-200 hover:text-white"
              >
                {site.contact.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Icon name="location" className="h-4 w-4 text-accent-300" />
              <span className="text-brand-200">{site.contact.city}</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon name="clock" className="h-4 w-4 text-accent-300" />
              <span className="text-brand-200">{site.contact.hours}</span>
            </li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <a href={site.social.facebook} aria-label="Facebook" className="text-brand-200 hover:text-white">
              <Icon name="facebook" className="h-5 w-5" />
            </a>
            <a href={site.social.instagram} aria-label="Instagram" className="text-brand-200 hover:text-white">
              <Icon name="instagram" className="h-5 w-5" />
            </a>
            <a href={site.social.linkedin} aria-label="LinkedIn" className="text-brand-200 hover:text-white">
              <Icon name="linkedin" className="h-5 w-5" />
            </a>
          </div>
        </div>
      </Container>

      {/* Barre légale */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-xs text-brand-300 sm:flex-row">
          <p>
            © {new Date().getFullYear()} SOS Nounous &amp; Services. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {footerLegalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
