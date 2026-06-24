import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { CtaBanner } from "@/components/CtaBanner";
import { Icon, type IconName } from "@/components/ui/Icon";
import { site, valuePillars } from "@/lib/data/site";
import { getPublishedTestimonials } from "@/lib/reviews";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "À propos",
  description:
    "L'histoire de SOS Nounous & Services, sa vision, sa mission et le mot de sa promotrice Marcelle Kouakou.",
  path: "/a-propos",
});

export const revalidate = 3600;

export default async function AProposPage() {
  const testimonials = await getPublishedTestimonials(3);
  return (
    <>
      <PageHero
        title="À propos de SOS Nounous & Services"
        description="D'une agence de babysitting créée en 2022 à une référence de la mise en relation entre familles et personnels domestiques en Côte d'Ivoire."
        breadcrumbs={[{ label: "À propos" }]}
      />

      {/* Histoire */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold">Notre histoire</h2>
            <div className="mt-4 space-y-4 text-ink-soft">
              <p>
                SOS Nounous a été créée en 2022 sous la forme d&apos;une agence spécialisée dans le
                babysitting et la garde d&apos;enfants. Forte de l&apos;expérience acquise sur le terrain
                et d&apos;une connaissance fine des attentes des familles, l&apos;agence engage aujourd&apos;hui
                une nouvelle étape de développement sous la marque <strong>SOS Nounous &amp; Services</strong>,
                avec un positionnement élargi, plus structuré et plus professionnel.
              </p>
              <p>
                Le projet vise à structurer une activité de mise en relation entre les foyers et différents
                profils de personnels domestiques : nounous, baby-sitters, aides ménagères, employés de
                maison, cuisiniers, chauffeurs et gardiens. Au-delà du simple placement, l&apos;agence ambitionne
                de devenir une référence de confiance dans la sélection, la vérification, l&apos;orientation,
                la formation et l&apos;accompagnement des personnels domestiques.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
            <h2 className="text-lg font-semibold text-brand-900">En bref</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-soft">
              <li className="flex items-center gap-2">
                <Icon name="heart" className="h-5 w-5 text-accent-500" /> Créée en 2022
              </li>
              <li className="flex items-center gap-2">
                <Icon name="location" className="h-5 w-5 text-accent-500" /> {site.contact.city}
              </li>
              <li className="flex items-center gap-2">
                <Icon name="users" className="h-5 w-5 text-accent-500" /> 5 familles de métiers domestiques
              </li>
              <li className="flex items-center gap-2">
                <Icon name="shield" className="h-5 w-5 text-accent-500" /> Profils vérifiés &amp; accompagnés
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Vision & mission */}
      <Section className="bg-white">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-brand-100 bg-white p-7 shadow-soft">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Icon name="bolt" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-brand-900">Notre vision</h2>
            <p className="mt-2 text-ink-soft">{site.vision}</p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white p-7 shadow-soft">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-50 text-accent-600">
              <Icon name="heart" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-brand-900">Notre mission</h2>
            <p className="mt-2 text-ink-soft">{site.mission}</p>
          </div>
        </div>
      </Section>

      {/* Proposition de valeur */}
      <Section>
        <SectionHeading eyebrow="Ce qui nous distingue" title="Notre proposition de valeur" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {valuePillars.map((p) => (
            <div key={p.title} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icon name={p.icon as IconName} />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-brand-900">{p.title}</h3>
              <p className="mt-1.5 text-xs text-ink-soft">{p.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* La promotrice + Mot de la promotrice (contenu fourni — conservé fidèlement) */}
      <Section className="bg-brand-900">
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white font-display text-2xl font-bold text-brand-900">
                MK
              </span>
              <h2 className="mt-4 text-xl font-bold text-white">Marcelle Kouakou</h2>
              <p className="text-sm text-accent-300">Promotrice &amp; fondatrice</p>
              <p className="mt-4 text-sm leading-relaxed text-brand-200">
                Forte de plus de 30 années de gestion d&apos;un foyer, Marcelle Kouakou a développé
                une compréhension fine des besoins réels des familles et de l&apos;importance d&apos;un
                environnement harmonieux, structuré et serein au quotidien. C&apos;est de cette
                expérience qu&apos;est née sa motivation : contribuer à professionnaliser le secteur
                du service à domicile.
              </p>
            </div>
          </div>
          <figure className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent-400">
              Le mot de la promotrice
            </p>
            <blockquote className="mt-4 space-y-4 text-lg leading-relaxed text-brand-100">
              <p>
                « À travers SOS Nounous &amp; Services, j&apos;ai souhaité porter une vision simple mais
                essentielle : celle d&apos;un foyer où le bien-être, le respect et la qualité du service
                vont de pair. Mon expérience de la vie familiale m&apos;a appris qu&apos;un personnel de
                maison ne se limite pas à l&apos;exécution de tâches ; il participe aussi, par son
                comportement, son attitude et son sens du devoir, à l&apos;équilibre du cadre de vie.
                C&apos;est pourquoi j&apos;ai voulu bâtir une agence fondée sur la confiance, le sérieux et
                la recherche du bon profil pour chaque famille.
              </p>
              <p>
                Mon ambition est de contribuer à faire évoluer les standards du service à domicile en
                mettant l&apos;accent sur la qualité humaine, la formation, le respect des règles de
                savoir-vivre et l&apos;accompagnement des profils placés. À long terme, je souhaite que
                SOS Nounous &amp; Services soit reconnu non seulement comme une agence de mise en
                relation fiable, mais aussi comme un acteur de professionnalisation et de valorisation
                des métiers du foyer. Mon engagement est de proposer aux familles des solutions
                sérieuses, adaptées et durables, au service d&apos;un mieux-vivre au quotidien. »
              </p>
            </blockquote>
            <figcaption className="mt-5 font-display text-base font-semibold text-accent-300">
              {site.signature}
            </figcaption>
          </figure>
        </div>
      </Section>

      {/* Témoignages */}
      <Section>
        <SectionHeading eyebrow="Témoignages" title="Ce qu'ils disent de nous" />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.author} className="flex flex-col rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
              <div className="flex gap-0.5" aria-label={`Note : ${t.rating} sur 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="star" className={i < t.rating ? "h-5 w-5 text-accent-500" : "h-5 w-5 text-brand-100"} strokeWidth={i < t.rating ? 1 : 1.7} />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink">« {t.quote} »</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold text-brand-900">{t.author}</span>
                <span className="block text-ink-muted">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 text-xs text-ink-muted">Témoignages illustratifs — exemples de démonstration.</p>
      </Section>

      <CtaBanner />
    </>
  );
}
