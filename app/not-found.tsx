import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Section className="text-center">
      <p className="font-display text-6xl font-bold text-brand-200">404</p>
      <h1 className="mt-4 text-2xl font-bold text-brand-900">Page introuvable</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-soft">
        Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <ButtonLink href="/" variant="accent">
          Retour à l&apos;accueil
        </ButtonLink>
        <ButtonLink href="/contact" variant="outline">
          Nous contacter
        </ButtonLink>
      </div>
    </Section>
  );
}
