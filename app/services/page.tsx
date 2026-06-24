import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { ServiceCard } from "@/components/ServiceCard";
import { CtaBanner } from "@/components/CtaBanner";
import { frequencyLabels } from "@/lib/data/services";
import { getServices } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";
import { Icon } from "@/components/ui/Icon";

export const metadata = buildMetadata({
  title: "Nos services domestiques",
  description:
    "Garde d'enfants, aide ménagère, cuisine, chauffeur, gardiennage — en ponctuel, régulier ou temps plein. Des profils vérifiés à Abidjan.",
  path: "/services",
});

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero
        title="Nos services"
        description="SOS Nounous & Services couvre l'ensemble des personnels domestiques, avec une priorité sur la garde d'enfants, notre cœur de métier depuis 2022."
        breadcrumbs={[{ label: "Services" }]}
      />

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </Section>

      {/* Par fréquence (CDC §5.2 — offre par fréquence) */}
      <Section className="bg-white">
        <h2 className="text-2xl font-bold sm:text-3xl">Selon votre fréquence</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Que votre besoin soit ponctuel ou permanent, nous adaptons la proposition de profils.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {(Object.keys(frequencyLabels) as Array<keyof typeof frequencyLabels>).map((f) => (
            <div key={f} className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
              <Icon name="clock" className="h-7 w-7 text-accent-500" />
              <h3 className="mt-3 text-lg font-semibold text-brand-900">{f}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{frequencyLabels[f]}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
