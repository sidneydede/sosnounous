import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Faq } from "@/components/Faq";
import { CtaBanner } from "@/components/CtaBanner";
import { faqCategories } from "@/lib/data/faq";
import { getPublicFaq } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Questions fréquentes",
  description:
    "Familles, intervenants, sécurité, confidentialité, tarifs : retrouvez les réponses aux questions les plus fréquentes sur SOS Nounous & Services.",
  path: "/faq",
});

export default async function FaqPage() {
  // FAQ administrable via le back-office (repli sur la FAQ par défaut si vide).
  const faqItems = await getPublicFaq();

  // Données structurées FAQ (SEO — rich results)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <PageHero
        title="Questions fréquentes"
        description="Vous trouverez ici les réponses aux questions les plus courantes. Une autre question ? Contactez-nous, nous sommes là pour vous accompagner."
        breadcrumbs={[{ label: "FAQ" }]}
      />

      <Section>
        <div className="space-y-12">
          {faqCategories.map((cat) => {
            const items = faqItems.filter((f) => f.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <h2 className="mb-4 text-xl font-bold text-brand-900">{cat}</h2>
                <Faq items={items} />
              </div>
            );
          })}
        </div>
      </Section>

      <CtaBanner />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
