"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav, site } from "@/lib/data/site";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";

export function Header() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const pathname = usePathname();

  // État de connexion (n'altère pas la génération statique des pages publiques)
  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (active) setAuthed(Boolean(d.user));
      })
      .catch(() => {
        if (active) setAuthed(false);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Bandeau de réassurance : téléphone visible en permanence (CDC §5.3) */}
      <div className="hidden bg-brand-900 text-white md:block">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-1.5 text-sm sm:px-6 lg:px-8">
          <span className="text-brand-100">{site.signature}</span>
          <div className="flex items-center gap-5">
            <a
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 hover:text-accent-300"
            >
              <Icon name="phone" className="h-4 w-4" /> {site.contact.phone}
            </a>
            <span className="inline-flex items-center gap-1.5 text-brand-200">
              <Icon name="clock" className="h-4 w-4" /> {site.contact.hours}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo / marque */}
        <Logo className="shrink-0" />

        {/* Navigation desktop — séparateurs verticaux pleine hauteur pour délimiter chaque item */}
        <nav aria-label="Navigation principale" className="hidden h-16 items-stretch min-[1360px]:flex">
          {mainNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center border-l border-brand-100 px-4 text-[0.92rem] leading-none tracking-tight transition-colors first:border-l-0",
                  active
                    ? "font-semibold text-accent-600"
                    : "font-medium text-brand-800 hover:bg-cream hover:text-accent-600",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA desktop */}
        <div className="hidden items-center gap-2 min-[1360px]:flex">
          <ButtonLink href={authed ? "/espace" : "/connexion"} variant="ghost" size="sm">
            {authed ? "Mon espace" : "Espace client"}
          </ButtonLink>
          <ButtonLink href="/trouver-un-intervenant" variant="accent" size="sm">
            Déposer une demande
          </ButtonLink>
        </div>

        {/* Bouton menu mobile */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-brand-900 min-[1360px]:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <div id="mobile-menu" className="border-t border-brand-100 bg-white min-[1360px]:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-base font-medium",
                  isActive(item.href)
                    ? "bg-accent-50 text-accent-700"
                    : "text-ink-soft hover:bg-brand-50",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <ButtonLink
                href={authed ? "/espace" : "/connexion"}
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {authed ? "Mon espace" : "Espace client"}
              </ButtonLink>
              <ButtonLink
                href="/trouver-un-intervenant"
                variant="accent"
                onClick={() => setOpen(false)}
              >
                Déposer une demande
              </ButtonLink>
              <a
                href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                className="mt-1 inline-flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-brand-800"
              >
                <Icon name="phone" className="h-4 w-4" /> {site.contact.phone}
              </a>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
