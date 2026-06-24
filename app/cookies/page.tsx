import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { CookiePreferences } from "@/components/CookiePreferences";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Gestion des cookies",
  description: "Gérez votre consentement aux cookies et traceurs de SOS Nounous & Services.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <>
      <PageHero
        title="Gestion des cookies"
        description="Choisissez les cookies que vous acceptez. Vous pouvez modifier vos préférences à tout moment."
        breadcrumbs={[{ label: "Gestion des cookies" }]}
      />
      <Section>
        <div className="max-w-3xl">
          <CookiePreferences />
        </div>
      </Section>
    </>
  );
}
