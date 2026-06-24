import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ProfileFilters } from "@/components/ProfileFilters";
import { ProfileCard } from "@/components/ProfileCard";
import { MethodSteps } from "@/components/MethodSteps";
import { CtaBanner } from "@/components/CtaBanner";
import { familySteps } from "@/lib/data/method";
import { searchProfiles, getSearchFacets, type SearchCriteria } from "@/lib/matching";
import { getServices, getActiveZoneNames } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = buildMetadata({
  title: "Trouver un intervenant",
  description:
    "Consultez des profils vérifiés et anonymisés, puis déposez votre demande. L'agence présélectionne le bon profil pour votre foyer.",
  path: "/trouver-un-intervenant",
});

// Données dynamiques (recherche en base) — pas de pré-rendu statique.
export const dynamic = "force-dynamic";

export default async function TrouverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const criteria: SearchCriteria = {
    metier: sp.metier,
    zone: sp.zone,
    frequency: sp.frequency,
    language: sp.language,
    sort: (sp.sort as SearchCriteria["sort"]) ?? "relevance",
  };

  const [results, facets, services, zones] = await Promise.all([
    searchProfiles(criteria),
    getSearchFacets(),
    getServices(),
    getActiveZoneNames(),
  ]);

  return (
    <>
      <PageHero
        title="Trouver un intervenant"
        description="Consultez nos profils vérifiés, puis déposez votre demande. Conformément à notre engagement de confiance, les coordonnées restent masquées : l'agence valide chaque mise en relation."
        breadcrumbs={[{ label: "Trouver un intervenant" }]}
      />

      {/* Note confidentialité (RG-09/15) */}
      <Section className="!py-8">
        <div className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-5">
          <Icon name="lock" className="mt-0.5 h-6 w-6 shrink-0 text-brand-700" />
          <div>
            <h2 className="text-base font-semibold text-brand-900">
              Profils vérifiés &amp; mise en relation encadrée
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Seuls les profils vérifiés par l&apos;agence apparaissent, de façon anonymisée
              (prénom et initiale). Les coordonnées ne sont communiquées qu&apos;après validation
              de la mise en relation par l&apos;agence.
            </p>
          </div>
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHeading
          title="Explorez nos profils vérifiés"
          description="Filtrez par service, zone, fréquence et langue. Le classement par pertinence s'appuie sur notre moteur de matching."
        />

        <div className="mt-8">
          <ProfileFilters facets={facets} current={criteria} services={services} zones={zones} />
        </div>

        <p className="mt-6 text-sm text-ink-soft" role="status" aria-live="polite">
          {results.length} profil{results.length > 1 ? "s" : ""} vérifié
          {results.length > 1 ? "s" : ""} correspondant à votre recherche.
        </p>

        {results.length > 0 ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50 p-8 text-center">
            <Icon name="search" className="mx-auto h-8 w-8 text-brand-400" />
            <p className="mt-2 text-sm text-ink-soft">
              Aucun profil ne correspond à ces critères pour le moment. Déposez une demande :
              l&apos;agence recherchera le bon profil pour vous.
            </p>
          </div>
        )}

        <div className="mt-10 rounded-2xl bg-brand-900 p-8 text-center">
          <h2 className="text-xl font-bold text-white">Vous préférez être accompagné(e) ?</h2>
          <p className="mx-auto mt-2 max-w-xl text-brand-200">
            Décrivez votre besoin en quelques étapes : un conseiller vous proposera 2 à 3 profils
            adaptés et vérifiés.
          </p>
          <div className="mt-6">
            <ButtonLink href="/tarifs" variant="accent" size="lg">
              Déposer ma demande
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section className="bg-white">
        <SectionHeading eyebrow="Comment ça marche" title="Votre parcours en 5 étapes" centered />
        <div className="mt-12">
          <MethodSteps steps={familySteps} />
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
