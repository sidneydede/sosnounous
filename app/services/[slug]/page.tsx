import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { services as staticServices, frequencyLabels } from "@/lib/data/services";
import { getServices, getServiceBySlug } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";

// Pré-rend les services du catalogue de base ; les services ajoutés en base
// sont rendus à la demande (perf/SEO — CDC §4.6).
export function generateStaticParams() {
  return staticServices.map((s) => ({ slug: s.slug }));
}
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return buildMetadata({ title: "Service introuvable", description: "" });
  return buildMetadata({
    title: service.name,
    description: service.description,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const others = (await getServices()).filter((s) => s.slug !== service.slug);

  return (
    <>
      <PageHero
        title={service.name}
        description={service.tagline}
        breadcrumbs={[{ label: "Services", href: "/services" }, { label: service.shortName }]}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <Icon name={service.icon as IconName} className="h-7 w-7" />
            </span>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              {service.longDescription}
            </p>

            <h2 className="mt-10 text-xl font-bold">Ce que nos intervenants peuvent assurer</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {service.tasks.map((task) => (
                <li key={task} className="flex items-start gap-2 text-ink">
                  <Icon name="check-circle" className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
                  <span className="text-sm">{task}</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-xl font-bold">Cas d&apos;usage fréquents</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {service.useCases.map((u) => (
                <Badge key={u} tone="neutral">
                  {u}
                </Badge>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/trouver-un-intervenant" variant="accent" size="lg">
                Déposer une demande
              </ButtonLink>
              <ButtonLink href="/tarifs" variant="outline" size="lg">
                Demander un devis
              </ButtonLink>
            </div>
          </div>

          {/* Encadré latéral */}
          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
              <h2 className="text-base font-semibold text-brand-900">Fréquences disponibles</h2>
              <ul className="mt-3 space-y-2">
                {service.frequencies.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-ink-soft">
                    <Icon name="clock" className="h-4 w-4 text-brand-500" />
                    <span>
                      <span className="font-medium text-brand-900">{f}</span> — {frequencyLabels[f]}
                    </span>
                  </li>
                ))}
              </ul>
              <hr className="my-5 border-brand-100" />
              <h2 className="text-base font-semibold text-brand-900">Nos garanties</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                <li className="flex items-center gap-2">
                  <Icon name="check-circle" className="h-4 w-4 text-accent-500" /> Profils vérifiés
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="check-circle" className="h-4 w-4 text-accent-500" /> Références contrôlées
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="check-circle" className="h-4 w-4 text-accent-500" /> Suivi & médiation
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>

      {/* Autres services */}
      <Section className="bg-white">
        <h2 className="text-2xl font-bold">Autres services</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-4 shadow-soft hover:border-brand-200"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <Icon name={s.icon as IconName} className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-brand-900">{s.shortName}</span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
