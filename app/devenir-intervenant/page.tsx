import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { MethodSteps } from "@/components/MethodSteps";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { interventantSteps } from "@/lib/data/method";
import { services } from "@/lib/data/services";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Devenir intervenant",
  description:
    "Nounou, aide ménagère, cuisinier, chauffeur, gardien : rejoignez SOS Nounous & Services, trouvez des missions près de chez vous et bénéficiez d'un accompagnement.",
  path: "/devenir-intervenant",
});

const benefits = [
  {
    icon: "search" as IconName,
    title: "Des missions adaptées",
    description: "Recevez des offres compatibles avec votre métier, votre zone et vos disponibilités.",
  },
  {
    icon: "shield" as IconName,
    title: "Un cadre sécurisant",
    description: "Des relations de travail formalisées et une charte éthique qui vous protègent.",
  },
  {
    icon: "heart" as IconName,
    title: "De la valorisation",
    description: "Vos références et votre sérieux sont mis en avant via des badges de confiance.",
  },
  {
    icon: "graduation" as IconName,
    title: "De la formation",
    description: "Accédez à des conseils et à des modules de formation pour monter en compétences.",
  },
];

export default function DevenirIntervenantPage() {
  return (
    <>
      <PageHero
        title="Proposez vos services"
        description="Rejoignez la base de profils vérifiés de SOS Nounous & Services. Trouvez des missions près de chez vous, dans un cadre professionnel et respectueux."
        breadcrumbs={[{ label: "Devenir intervenant" }]}
      />

      {/* Avantages */}
      <Section>
        <SectionHeading
          eyebrow="Pourquoi nous rejoindre"
          title="Vos avantages en tant qu'intervenant"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-50 text-accent-600">
                <Icon name={b.icon} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-brand-900">{b.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{b.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Métiers recherchés */}
      <Section className="bg-white">
        <SectionHeading title="Les métiers que nous recherchons" />
        <div className="mt-8 flex flex-wrap gap-3">
          {services.map((s) => (
            <span
              key={s.slug}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-900 shadow-soft"
            >
              <Icon name={s.icon as IconName} className="h-5 w-5 text-brand-600" />
              {s.shortName}
            </span>
          ))}
        </div>
      </Section>

      {/* Parcours candidat */}
      <Section>
        <SectionHeading
          eyebrow="Comment candidater"
          title="Votre parcours en 5 étapes"
          centered
        />
        <div className="mt-12">
          <MethodSteps steps={interventantSteps} />
        </div>
      </Section>

      {/* CTA candidature */}
      <Section className="!pt-0">
        <div className="rounded-3xl bg-brand-900 px-6 py-12 text-center sm:px-12">
          <h2 className="mx-auto max-w-2xl text-2xl font-bold text-white sm:text-3xl">
            Prêt(e) à rejoindre l&apos;aventure ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-200">
            Créez votre compte intervenant dès maintenant. Vous pourrez compléter votre profil,
            vos disponibilités et vos pièces justificatives dans votre espace personnel.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/inscription?role=INTERVENANT" variant="accent" size="lg">
              Créer mon compte intervenant
            </ButtonLink>
            <ButtonLink
              href="/notre-methode"
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10"
            >
              Découvrir notre méthode
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
