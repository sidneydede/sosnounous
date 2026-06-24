"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { readConsent, writeConsent } from "@/lib/cookies";

/**
 * Bandeau de consentement aux cookies (CDC §4.4).
 * S'affiche tant qu'aucun choix n'a été exprimé. Les cookies de session
 * (strictement nécessaires) ne sont pas concernés par ce consentement.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Lecture côté client uniquement (le cookie est absent au rendu serveur) ;
    // affichage si aucun consentement n'a encore été exprimé.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!readConsent()) setVisible(true);
  }, []);

  function choose(analytics: boolean) {
    writeConsent(analytics, new Date().toISOString());
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-brand-200 bg-white shadow-[0_-4px_20px_rgba(13,47,56,0.1)]"
    >
      <Container className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-ink-soft">
          Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre accord,
          des cookies de mesure d&apos;audience. Vous pouvez accepter, refuser ou en savoir plus
          dans notre{" "}
          <Link href="/politique-de-confidentialite" className="font-medium text-brand-700 underline">
            politique de confidentialité
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link href="/cookies" className="px-3 py-2 text-sm font-medium text-brand-700 hover:underline">
            Personnaliser
          </Link>
          <Button type="button" variant="outline" size="sm" onClick={() => choose(false)}>
            Refuser
          </Button>
          <Button type="button" variant="accent" size="sm" onClick={() => choose(true)}>
            Tout accepter
          </Button>
        </div>
      </Container>
    </div>
  );
}
