import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/Prose";
import { site } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Conditions générales d'utilisation",
  description: "Conditions générales d'utilisation du site et de la plateforme SOS Nounous & Services.",
  path: "/cgu",
});

export default function CguPage() {
  return (
    <>
      <PageHero
        title="Conditions générales d'utilisation"
        breadcrumbs={[{ label: "CGU" }]}
      />
      <Section>
        <Prose>
          <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm">
            <strong>Modèle à valider juridiquement.</strong> Ces conditions devront être complétées
            et adaptées (notamment les conditions commerciales, la responsabilité et le droit
            applicable) avant la mise en production.
          </p>

          <h2>1. Objet</h2>
          <p>
            Les présentes conditions régissent l&apos;utilisation du site et de la plateforme{" "}
            {site.name}, service de mise en relation entre familles et personnels domestiques.
          </p>

          <h2>2. Modèle de mise en relation</h2>
          <p>
            {site.name} fonctionne selon un modèle hybride : l&apos;agence présélectionne et propose
            des profils vérifiés. La mise en relation et la divulgation des coordonnées sont soumises
            à la validation de l&apos;agence.
          </p>

          <h2>3. Comptes utilisateurs</h2>
          <p>
            La création d&apos;un compte requiert des informations exactes et à jour. L&apos;utilisateur
            est responsable de la confidentialité de ses identifiants.
          </p>

          <h2>4. Engagements des utilisateurs</h2>
          <ul>
            <li>Fournir des informations sincères et véridiques.</li>
            <li>Respecter la législation applicable et les présentes conditions.</li>
            <li>Ne pas contourner le rôle d&apos;intermédiation de l&apos;agence.</li>
          </ul>

          <h2>5. Avis et contenus</h2>
          <p>
            Les avis sont modérés avant publication. Tout contenu abusif, diffamatoire ou non
            conforme pourra être refusé ou retiré.
          </p>

          <h2>6. Responsabilité</h2>
          <p>
            {site.name} met en œuvre les moyens nécessaires à la qualité et à la sécurité du service.
            Les conditions précises de responsabilité seront détaillées dans la version finale.
          </p>

          <h2>7. Données personnelles</h2>
          <p>
            Le traitement des données est décrit dans la{" "}
            <a href="/politique-de-confidentialite">politique de confidentialité</a>.
          </p>

          <h2>8. Droit applicable</h2>
          <p>
            Les présentes conditions sont régies par le droit ivoirien. <em>(Juridiction compétente
            à préciser.)</em>
          </p>
        </Prose>
      </Section>
    </>
  );
}
