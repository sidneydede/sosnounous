import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";

/** Bandeau d'appel à l'action de fin de page (CDC §5.1 — orientation action). */
export function CtaBanner() {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="overflow-hidden rounded-3xl bg-brand-900 px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="mx-auto max-w-2xl text-2xl font-bold text-white sm:text-3xl">
            Trouvons ensemble le bon profil pour votre foyer
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-200">
            Décrivez votre besoin en quelques minutes. Un conseiller vous propose
            des profils vérifiés, en toute confiance.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/trouver-un-intervenant" variant="accent" size="lg">
              Déposer une demande
            </ButtonLink>
            <ButtonLink href="/tarifs" variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10">
              Demander un devis gratuit
            </ButtonLink>
          </div>
          <a
            href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-100 hover:text-white"
          >
            <Icon name="phone" className="h-4 w-4" /> Ou appelez-nous : {site.contact.phone}
          </a>
        </div>
      </Container>
    </section>
  );
}
