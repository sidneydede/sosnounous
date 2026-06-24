import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/forms/ContactForm";
import { Icon } from "@/components/ui/Icon";
import { site } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Contactez SOS Nounous & Services : formulaire, téléphone, e-mail et horaires. Nous vous répondons rapidement.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contactez-nous"
        description="Une question, un projet, un besoin urgent ? Notre équipe vous répond rapidement et vous accompagne."
        breadcrumbs={[{ label: "Contact" }]}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Coordonnées */}
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-xl font-bold">Nos coordonnées</h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon name="phone" className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-brand-900">Téléphone</p>
                  <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="text-ink-soft hover:text-brand-700">
                    {site.contact.phone}
                  </a>
                  <p className="mt-1 text-xs text-ink-muted">Option « être rappelé » disponible sur demande.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon name="mail" className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-brand-900">E-mail</p>
                  <a href={`mailto:${site.contact.email}`} className="text-ink-soft hover:text-brand-700">
                    {site.contact.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon name="clock" className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-brand-900">Horaires</p>
                  <p className="text-ink-soft">{site.contact.hours}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon name="location" className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-brand-900">Zone</p>
                  <p className="text-ink-soft">{site.contact.city}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card sm:p-8">
              <h2 className="text-xl font-bold">Écrivez-nous</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Tous les champs marqués d&apos;un astérisque (<span className="text-accent-600">*</span>) sont obligatoires.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
