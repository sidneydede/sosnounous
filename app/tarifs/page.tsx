import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { DevisForm } from "@/components/forms/DevisForm";
import { Icon } from "@/components/ui/Icon";
import { getPublicTarifs, getServices, getActiveZoneNames } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tarifs & demande de devis",
  description:
    "Obtenez une estimation gratuite et sans engagement. Décrivez votre besoin, nous vous proposons un devis adapté.",
  path: "/tarifs",
});

const principles = [
  {
    title: "Selon le service",
    description: "Garde d'enfants, ménage, cuisine, conduite, gardiennage : chaque métier a ses spécificités.",
  },
  {
    title: "Selon la fréquence",
    description: "Ponctuel, régulier ou temps plein : le tarif s'adapte à votre rythme.",
  },
  {
    title: "Selon vos besoins",
    description: "Horaires, nombre d'enfants, tâches attendues et contraintes sont pris en compte.",
  },
];

export default async function TarifsPage() {
  const [tarifs, services, zones] = await Promise.all([
    getPublicTarifs(),
    getServices(),
    getActiveZoneNames(),
  ]);
  return (
    <>
      <PageHero
        title="Tarifs & devis"
        description="Nos tarifs dépendent de votre besoin réel. Demandez un devis gratuit : nous vous transmettons une estimation claire et sans engagement."
        breadcrumbs={[{ label: "Tarifs & devis" }]}
      />

      {/* Grille indicative (administrable — RG-41) */}
      {tarifs.length > 0 && (
        <Section className="!pb-0">
          <SectionHeading eyebrow="Grille indicative" title="Nos tarifs indicatifs" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tarifs.map((t, i) => (
              <div key={i} className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-600">{t.service}</p>
                <h3 className="mt-1 text-base font-semibold text-brand-900">{t.label}</h3>
                <p className="mt-2 text-xl font-bold text-brand-900">
                  {t.amount}
                  {t.unit && <span className="text-sm font-normal text-ink-soft"> {t.unit}</span>}
                </p>
                {t.note && <p className="mt-1 text-sm text-ink-soft">{t.note}</p>}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-muted">
            Tarifs indicatifs, susceptibles d&apos;ajustement selon le besoin réel. Devis personnalisé gratuit.
          </p>
        </Section>
      )}

      {/* Principes tarifaires */}
      <Section>
        <SectionHeading
          eyebrow="Nos principes tarifaires"
          title="Une estimation transparente, adaptée à votre situation"
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {principles.map((p) => (
            <div key={p.title} className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
              <Icon name="check-circle" className="h-7 w-7 text-accent-500" />
              <h3 className="mt-3 text-base font-semibold text-brand-900">{p.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{p.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-soft">
          <Icon name="check-circle" className="mr-1.5 inline h-4 w-4 text-accent-500" />
          La demande de devis et l&apos;estimation sont <strong>gratuites et sans engagement</strong>.
          {" "}Les grilles tarifaires détaillées seront communiquées par l&apos;agence.
        </p>
      </Section>

      {/* Formulaire de devis */}
      <Section className="bg-white" id="devis">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Demande de devis"
              title="Recevez votre estimation personnalisée"
              description="Quelques étapes suffisent. Un conseiller vous recontacte rapidement avec une proposition adaptée et des profils vérifiés."
            />
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              <li className="flex items-center gap-2">
                <Icon name="bolt" className="h-5 w-5 text-accent-500" /> Réponse rapide d&apos;un conseiller dédié
              </li>
              <li className="flex items-center gap-2">
                <Icon name="shield" className="h-5 w-5 text-accent-500" /> Profils vérifiés et présélectionnés
              </li>
              <li className="flex items-center gap-2">
                <Icon name="lock" className="h-5 w-5 text-accent-500" /> Vos données traitées en toute confidentialité
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card sm:p-8">
            <DevisForm services={services} zones={zones} />
          </div>
        </div>
      </Section>
    </>
  );
}
