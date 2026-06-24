import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/Prose";
import { site, legal } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Politique de confidentialité",
  description:
    "Comment SOS Nounous & Services collecte, utilise et protège vos données personnelles, conformément à la loi ivoirienne n°2013-450 (ARTCI) et aux principes du RGPD.",
  path: "/politique-de-confidentialite",
});

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <PageHero
        title="Politique de confidentialité"
        description="Protection de vos données personnelles — loi ivoirienne n°2013-450 (autorité ARTCI) et alignement RGPD."
        breadcrumbs={[{ label: "Politique de confidentialité" }]}
      />
      <Section>
        <Prose>
          <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm">
            <strong>À valider</strong> avec l&apos;agence et un conseil juridique avant la mise en
            production (durées de conservation exactes, liste des sous-traitants, coordonnées).
          </p>

          <h2>1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement est {legal.legalName}, dont le siège est situé à{" "}
            {legal.headOffice}. Pour toute question relative à vos données, écrivez à{" "}
            <a href={`mailto:${legal.dataContactEmail}`}>{legal.dataContactEmail}</a>.
          </p>

          <h2>2. Cadre légal</h2>
          <p>
            Nous traitons vos données conformément à la loi ivoirienne n°2013-450 relative à la
            protection des données à caractère personnel (autorité de contrôle : {legal.authority})
            et en alignement avec les principes du Règlement Général sur la Protection des Données
            (RGPD).
          </p>

          <h2>3. Données collectées</h2>
          <ul>
            <li><strong>Familles</strong> : nom, prénom, e-mail, téléphone, commune, détails de la demande (type de service, fréquence, et le cas échéant nombre et âge des enfants).</li>
            <li><strong>Intervenants</strong> : identité, coordonnées, métier(s), expérience, disponibilités, références et pièces justificatives.</li>
            <li><strong>Navigation</strong> : données techniques et de mesure d&apos;audience, sous réserve de votre consentement (voir §8).</li>
          </ul>

          <h2>4. Finalités</h2>
          <ul>
            <li>Traiter les demandes des familles et les candidatures des intervenants.</li>
            <li>Réaliser la présélection, le matching et le suivi de la mise en relation.</li>
            <li>Vous adresser des notifications transactionnelles (e-mail / SMS).</li>
            <li>Assurer la sécurité, prévenir la fraude et respecter nos obligations légales.</li>
          </ul>

          <h2>5. Base légale & consentement</h2>
          <p>
            Les traitements reposent sur l&apos;exécution du service demandé, nos obligations
            légales et, lorsque la loi l&apos;exige, votre <strong>consentement explicite et
            horodaté</strong> (recueilli à l&apos;inscription et via le bandeau cookies). Vous
            pouvez retirer votre consentement à tout moment.
          </p>

          <h2>6. Protection des données sensibles</h2>
          <p>
            Une attention renforcée est portée aux données relatives aux enfants et aux pièces
            d&apos;identité : accès restreint au strict besoin, chiffrement et minimisation de la
            collecte (privacy by design).
          </p>

          <h2>7. Durée de conservation</h2>
          <p>
            Les données sont conservées pour la durée nécessaire aux finalités décrites, puis
            supprimées ou anonymisées. <em>(Durées précises à définir avec l&apos;agence.)</em>
          </p>

          <h2>8. Cookies & traceurs</h2>
          <p>
            Le site utilise des cookies strictement nécessaires (session, sécurité) et, avec votre
            accord, des cookies de mesure d&apos;audience. Vous pouvez accepter, refuser ou modifier
            vos choix à tout moment depuis la page{" "}
            <a href="/cookies">gestion des cookies</a>. Votre choix est horodaté et conservé.
          </p>

          <h2>9. Destinataires et sous-traitants</h2>
          <p>
            Vos données peuvent être traitées par des prestataires techniques encadrés
            contractuellement (hébergement, envoi d&apos;e-mails et de SMS), tenus à la
            confidentialité et à la sécurité.
          </p>

          <h2>10. Vos droits</h2>
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression,
            d&apos;opposition et de portabilité. Vous pouvez supprimer votre compte directement
            depuis votre espace (rubrique Sécurité). Pour exercer vos autres droits, écrivez à{" "}
            <a href={`mailto:${legal.dataContactEmail}`}>{legal.dataContactEmail}</a>. Vous pouvez
            également saisir l&apos;{legal.authority}.
          </p>

          <p className="mt-8 text-sm text-ink-muted">
            Dernière mise à jour : {legal.lastUpdated}.
          </p>
        </Prose>
      </Section>
    </>
  );
}
