import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ServiceCard } from "@/components/ServiceCard";
import { MethodSteps } from "@/components/MethodSteps";
import { CtaBanner } from "@/components/CtaBanner";
import { services } from "@/lib/data/services";
import { familySteps, trustCommitments } from "@/lib/data/method";
import { valuePillars, site } from "@/lib/data/site";
import { getPublishedTestimonials } from "@/lib/reviews";

// Témoignages issus des avis publiés — page régénérée périodiquement (ISR).
export const revalidate = 3600;

export default async function HomePage() {
  const testimonials = await getPublishedTestimonials(3);
  return (
    <>
      {/* ── HERO : double entrée (CDC §1.5, §5.4) ── */}
      <section className="relative overflow-hidden bg-brand-900">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(60rem 30rem at 80% -10%, #c29a5a 0%, transparent 60%), radial-gradient(40rem 24rem at 0% 110%, #de7f5c 0%, transparent 55%)",
          }}
          aria-hidden
        />
        <Container className="relative grid gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col justify-center">
            <Badge tone="accent" className="w-fit bg-white/10 text-accent-200">
              Agence de confiance · Abidjan, Côte d&apos;Ivoire
            </Badge>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Le bon profil pour votre foyer,{" "}
              <span className="text-accent-400">en toute confiance.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-100">
              SOS Nounous &amp; Services met en relation les familles et des
              personnels domestiques sélectionnés, vérifiés, formés et accompagnés :
              nounous, aides ménagères, cuisiniers, chauffeurs et gardiens.
            </p>

            {/* Double call-to-action */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href="/trouver-un-intervenant"
                className="group rounded-2xl bg-white p-5 text-left shadow-card transition-transform hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-brand-700">
                  <Icon name="search" className="h-5 w-5 text-accent-500" /> Je cherche un intervenant
                </span>
                <span className="mt-1.5 block text-sm text-ink-soft">
                  Décrivez votre besoin, recevez des profils vérifiés.
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-600">
                  Déposer une demande
                  <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <Link
                href="/devenir-intervenant"
                className="group rounded-2xl bg-accent-500 p-5 text-left shadow-card transition-transform hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Icon name="profile" className="h-5 w-5" /> Je propose mes services
                </span>
                <span className="mt-1.5 block text-sm text-white/90">
                  Rejoignez notre base de profils et trouvez des missions.
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white">
                  Devenir intervenant
                  <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>

            <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-brand-200">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check-circle" className="h-4 w-4 text-accent-300" /> Profils vérifiés
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check-circle" className="h-4 w-4 text-accent-300" /> Références contrôlées
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check-circle" className="h-4 w-4 text-accent-300" /> Accompagnement dédié
              </span>
            </p>
          </div>

          {/* Carte de réassurance latérale */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl bg-white/95 p-7 shadow-card backdrop-blur">
              <h2 className="text-lg font-semibold text-brand-900">
                Pourquoi nous faire confiance ?
              </h2>
              <ul className="mt-5 space-y-4">
                {valuePillars.map((p) => (
                  <li key={p.title} className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon name={p.icon as IconName} className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-brand-900">{p.title}</p>
                      <p className="text-sm text-ink-soft">{p.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* ── STATISTIQUES (réassurance) — valeurs indicatives à confirmer par l'agence ── */}
      <section className="border-b border-brand-100 bg-white">
        <Container className="grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
          {[
            { value: "100%", label: "Profils vérifiés" },
            { value: "48h", label: "Première réponse" },
            { value: "1 200+", label: "Familles accompagnées" },
            { value: "4,9/5", label: "Satisfaction" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-brand-900 sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-ink-soft">{s.label}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* ── SERVICES ── */}
      <Section>
        <SectionHeading
          eyebrow="Nos services"
          title="Tous les personnels de maison, une seule agence de confiance"
          description="De la garde d'enfants au gardiennage, nous couvrons l'ensemble des services domestiques, en ponctuel, en régulier ou à temps plein."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
        <div className="mt-8">
          <ButtonLink href="/services" variant="outline">
            Voir tous les services
          </ButtonLink>
        </div>
      </Section>

      {/* ── MÉTHODE ── */}
      <Section className="bg-white">
        <SectionHeading
          eyebrow="Notre méthode"
          title="Un parcours simple, guidé et rassurant"
          description="L'agence reste au centre de la mise en relation : nous présélectionnons et vous proposons des profils vérifiés."
          centered
        />
        <div className="mt-12">
          <MethodSteps steps={familySteps} />
        </div>
        <div className="mt-10 text-center">
          <ButtonLink href="/notre-methode" variant="primary">
            Découvrir notre méthode
          </ButtonLink>
        </div>
      </Section>

      {/* ── RÉASSURANCE / ENGAGEMENTS ── */}
      <Section>
        <SectionHeading
          eyebrow="Nos engagements"
          title="La confiance au cœur de chaque mise en relation"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trustCommitments.map((c) => (
            <div key={c.title} className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
              <Icon name="check-circle" className="h-7 w-7 text-accent-500" />
              <h3 className="mt-3 text-base font-semibold text-brand-900">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{c.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── TÉMOIGNAGES ── */}
      <Section className="bg-brand-900">
        <SectionHeading
          eyebrow="Ils nous font confiance"
          title="La parole aux familles et aux intervenants"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.author} className="flex flex-col rounded-2xl bg-white p-6 shadow-card">
              <div className="flex gap-0.5" aria-label={`Note : ${t.rating} sur 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    className={i < t.rating ? "h-5 w-5 text-accent-500" : "h-5 w-5 text-brand-100"}
                    strokeWidth={i < t.rating ? 1 : 1.7}
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink">
                « {t.quote} »
              </blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold text-brand-900">{t.author}</span>
                <span className="block text-ink-muted">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-brand-300">
          Témoignages illustratifs — exemples de démonstration.
        </p>
      </Section>

      {/* ── CTA ── */}
      <CtaBanner />

      {/* Mention zone */}
      <Container className="pb-10">
        <p className="text-center text-sm text-ink-muted">
          {site.name} — {site.contact.city}. {site.signature}
        </p>
      </Container>
    </>
  );
}
