import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/Prose";
import { site, legal } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Mentions légales",
  description: "Mentions légales du site SOS Nounous & Services.",
  path: "/mentions-legales",
});

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHero title="Mentions légales" breadcrumbs={[{ label: "Mentions légales" }]} />
      <Section>
        <Prose>
          <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm">
            <strong>À finaliser par l&apos;agence</strong> avant la mise en production : les champs
            « à préciser » doivent être renseignés (raison sociale, forme juridique, RCCM, siège,
            hébergeur). Ils sont centralisés dans la configuration du site pour une saisie unique.
          </p>

          <h2>Éditeur du site</h2>
          <ul>
            <li>Raison sociale : {legal.legalName}</li>
            <li>Forme juridique : {legal.legalForm}</li>
            <li>RCCM / identifiant : {legal.rccm}</li>
            <li>Capital social : {legal.capital}</li>
            <li>Siège social : {legal.headOffice}</li>
            <li>Téléphone : {site.contact.phone}</li>
            <li>E-mail : <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></li>
            <li>Directrice de la publication : {legal.publicationDirector}</li>
          </ul>

          <h2>Hébergement</h2>
          <p>Le site est hébergé par :</p>
          <ul>
            <li>Hébergeur : {legal.host.name}</li>
            <li>Adresse : {legal.host.address}</li>
            <li>Contact : {legal.host.contact}</li>
          </ul>

          <h2>Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus présents sur ce site (textes, logos, éléments graphiques)
            est la propriété de {legal.legalName}, sauf mention contraire. Toute reproduction sans
            autorisation préalable est interdite.
          </p>

          <h2>Données personnelles & cookies</h2>
          <p>
            Le traitement des données personnelles est décrit dans notre{" "}
            <a href="/politique-de-confidentialite">politique de confidentialité</a>. Vous pouvez
            gérer votre consentement aux cookies via la page{" "}
            <a href="/cookies">gestion des cookies</a>.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute question, contactez-nous à{" "}
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
          </p>
        </Prose>
      </Section>
    </>
  );
}
