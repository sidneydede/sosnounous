import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { MethodSteps } from "@/components/MethodSteps";
import { CtaBanner } from "@/components/CtaBanner";
import { Icon } from "@/components/ui/Icon";
import { familySteps, interventantSteps, trustCommitments } from "@/lib/data/method";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Notre méthode & notre sélection",
  description:
    "Processus de sélection et de vérification, accompagnement avant/pendant/après et charte éthique : découvrez comment SOS Nounous & Services bâtit la confiance.",
  path: "/notre-methode",
});

export default function NotreMethodePage() {
  return (
    <>
      <PageHero
        title="Notre méthode & notre sélection"
        description="La confiance ne se décrète pas, elle se construit. Voici comment nous sélectionnons, vérifions et accompagnons, à chaque étape."
        breadcrumbs={[{ label: "Notre méthode" }]}
      />

      {/* Modèle hybride */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Le modèle hybride"
              title="L'agence reste au cœur de la mise en relation"
            />
            <p className="mt-4 text-ink-soft">
              Contrairement à une simple petite annonce, SOS Nounous &amp; Services présélectionne
              et vous propose des profils déjà vérifiés. Nous restons votre interlocuteur tout au
              long de la relation, garants de la vérification, de la confidentialité et de la qualité.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Vérification d'identité et de références avant toute proposition",
                "Coordonnées masquées jusqu'à validation de la mise en relation",
                "Accompagnement et médiation en cas de besoin",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-ink">
                  <Icon name="check-circle" className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-brand-100 bg-brand-50 p-8">
            <h2 className="text-lg font-semibold text-brand-900">Nos engagements de confiance</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {trustCommitments.map((c) => (
                <li key={c.title}>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-900">
                    <Icon name="shield" className="h-4 w-4 text-brand-600" />
                    {c.title}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">{c.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Parcours Famille */}
      <Section className="bg-white">
        <SectionHeading eyebrow="Côté famille" title="Votre parcours, étape par étape" centered />
        <div className="mt-12">
          <MethodSteps steps={familySteps} />
        </div>
      </Section>

      {/* Parcours Intervenant */}
      <Section>
        <SectionHeading eyebrow="Côté intervenant" title="Le parcours des intervenants" centered />
        <div className="mt-12">
          <MethodSteps steps={interventantSteps} />
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
