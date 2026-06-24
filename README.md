# SOS Nounous & Services — Site web & plateforme

Site vitrine et fondations de la plateforme de mise en relation entre familles et
personnels domestiques en Côte d'Ivoire.

> Réf. cahier des charges : **GBC-SOSN-CDC-2026-001** (GrowthBridge Consulting — AMOA).
> Signature : _« Le bon profil. »_

## État d'avancement

- **Incrément 1 — Site vitrine complet** ✅
- **Incrément 2 — Comptes & Authentification (Module M2)** ✅
- **Incrément 3 — Profils vérifiés & Recherche/Matching (Modules M3, M4)** ✅
- **Incrément 4 — Demande & Mise en relation (Modules M5, M6)** ✅
- **Incrément 5 — Espaces enrichis (Modules M7, M8)** ✅
- **Incrément 6 — Avis & recommandations (Module M11)** ✅
- **Incrément 7 — Reporting & pilotage (Module M9, partiel)** ✅
- **Incrément 8 — Finalisation RGPD & mentions légales** ✅
- **Incrément 9 — Notifications réelles & préférences (Module M10)** ✅
- **Incrément 10 — Paramétrage & CMS (Module M9 suite)** ✅
- **Incrément 11 — Dépôt sécurisé de fichiers (CDC §4.4)** ✅
- **Refonte UI — Nouvelle charte graphique officielle** ✅
- **Préparation à la mise en production** ✅ (voir [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md))

Les éléments suivants (CMS étendu : services/zones/modèles de notifications, paiement)
seront livrés aux incréments ultérieurs.

### Préparation à la mise en production (CDC §4.5–4.8, §8.4)
- **Guide de déploiement** complet : `docs/DEPLOIEMENT.md` (bascule PostgreSQL, env, TLS,
  sauvegardes/RPO-RTO, supervision, sécurité, RGPD, smoke tests, rollback).
- **Sonde de santé** `GET /api/health` (vérifie la base) pour la supervision.
- **Durcissement** : en-têtes de sécurité + **HSTS** en production.
- **Conteneur** : `Dockerfile` + `docker-entrypoint.sh` (migrations au démarrage) + `.dockerignore`.
- Script `npm run db:deploy` (= `prisma migrate deploy`).
- ⚠️ Le déploiement réel (PostgreSQL, hébergement, domaine, clés providers) est à réaliser
  par l'agence/l'hébergeur en suivant le guide.

### Refonte UI — Charte graphique « SOS Nounous & Services »
Application de la charte officielle (Logo & système, UX/UI) :
- **Palette** : bleu profond `#15324B` (`brand`), corail chaud `#DE7F5C` (`accent`),
  or discret `#C29A5A` (`gold`), ivoire `#FAF7F1` (`cream`).
- **Typographie** : **Jost** (Light/Medium/Bold) sur tout le site.
- **Logo** officiel (symbole foyer + cœur, signature « SOS » corail / « Nounous » navy)
  en composant réutilisable (`components/Logo.tsx`) — header, footer, écrans d'auth + favicon.
- **Fond ivoire**, cartes blanches, héros navy, ligne de statistiques, CTA corail.
- Re-thème propagé via les **tokens sémantiques** Tailwind (impact minimal sur les composants).

### Incrément 11 — Dépôt sécurisé de pièces justificatives (CDC §4.4)
- **Upload** par l'intervenant (pièce d'identité, photo, justificatifs) : validation type
  (JPEG/PNG/WEBP/PDF) & taille (5 Mo).
- **Chiffrement au repos** (AES-256-GCM) ; fichiers stockés **hors du répertoire public**,
  jamais servis statiquement.
- **Accès restreint** : téléchargement réservé à l'intervenant propriétaire **et** à l'agence ;
  jamais accessible au public ni aux familles (cohérent RG-15) — déchiffrement à la volée.
- Côté agence : pièces téléchargeables depuis la fiche profil pour la **vérification d'identité** (US-04).
- Clé de chiffrement via `FILE_ENCRYPTION_KEY` (env) ; stockage `/storage/` (hors dépôt).

### Incrément 10 — Paramétrage & CMS (Module M9, RG-41/42)
- **CMS FAQ** (RG-42) : création / édition / publication des questions via le back-office
  (`/espace/admin/parametrage/faq`) ; la page publique `/faq` lit la base (repli sur la
  FAQ par défaut si vide).
- **Barèmes & tarifs indicatifs** (RG-41) : grille tarifaire administrable
  (`/espace/admin/parametrage/tarifs`) affichée sur la page publique `/tarifs`.
- Pattern **éditable-sans-déploiement** : modèles `FaqEntry` / `Tarif` (ordre + publication),
  CRUD réservé à l'agence, lecture publique avec repli.

### Incrément 12 — CMS étendu : Services & Zones (Module M9, RG-41/42)
- **Services administrables** (RG-42) : catalogue éditable (`/espace/admin/parametrage/services`)
  pilotant les pages publiques `/services` (+ détail, généré à la demande pour les nouveaux
  services), la recherche et les formulaires (demande, inscription, profil intervenant).
- **Zones d'intervention administrables** (RG-41) : communes éditables
  (`/espace/admin/parametrage/zones`) alimentant la recherche et le formulaire de demande.
- Lecture publique **avec repli** sur le catalogue/les communes par défaut (le site reste
  alimenté avant toute saisie). Accueil & footer conservent le catalogue statique (perf/ISR).

### Incrément 13 — Back-office finalisé : modèles de notifications & exports (M9, RG-41/39)
- **Modèles de notifications éditables** (RG-41) : objet & corps personnalisables par événement
  (`/espace/admin/parametrage/notifications-modeles`), marqueur `{message}`/`{site}`, possibilité
  de **désactiver** un événement (hors critique). Appliqués dans `sendNotification`.
- **Exports CSV** (RG-39) : demandes, base de candidats, avis — depuis le reporting et chaque
  liste back-office (séparateur `;` + BOM UTF-8 pour Excel/accents). Réservés à l'agence.
- ✅ **Back-office complet** : reporting, demandes, candidats (vérification), avis (modération),
  notifications (journal + modèles), paramétrage (services, zones, FAQ, tarifs), exports.

### Incrément 9 — Notifications (Module M10, RG-35 à RG-38)
- **Couche d'envoi unique** : préférences + journalisation + dispatch, derrière `sendNotification`.
- **Préférences par utilisateur** (RG-37) : e-mail / SMS activables (espace → Sécurité) ;
  respectées à l'envoi — sauf **envois critiques** (OTP, réinitialisation) toujours émis.
- **Journalisation des envois** (RG-38) : modèle `NotificationLog` (statut SENT / MOCKED /
  SKIPPED / FAILED) + **journal consultable** `/espace/admin/notifications` (filtrable).
- **Catalogue d'événements** (RG-35) `lib/notificationEvents.ts` ; **SMS réservé au critique** (RG-36).
- **Providers réels** : adaptateurs e-mail (API type Resend) & SMS (passerelle HTTP générique),
  sans SDK, activés par `NOTIFICATIONS_MODE=live` ; **mock par défaut** (exécutable sans identifiants).

### Incrément 8 — Conformité RGPD & mentions légales (CDC §4.4)
- **Bandeau de consentement aux cookies** (accepter / refuser / personnaliser) avec
  consentement **horodaté** ; page dédiée `/cookies` pour modifier ses choix à tout moment.
- Distinction cookies **strictement nécessaires** (session) vs **mesure d'audience** (sur consentement).
- **Informations légales centralisées** (`lib/data/site.ts` → `legal`) : saisie unique par
  l'agence, lues par les mentions légales et la politique de confidentialité.
- **Politique de confidentialité** structurée (responsable, cadre ARTCI/RGPD, finalités,
  consentement, données sensibles, durées, cookies, sous-traitants, droits + suppression self-service).
- **Mentions légales** complètes (éditeur, hébergeur, propriété intellectuelle, contact).
- **Registre des traitements** : modèle interne `docs/registre-des-traitements.md` (7 traitements recensés).

> ⚠️ Les valeurs d'identité légale (raison sociale, RCCM, hébergeur…) sont des **placeholders
> balisés** à renseigner par l'agence avant la mise en production.

### Incrément 7 — Reporting & pilotage (Module M9 partiel, US-15, §3.10)
- **Tableau de bord administrateur** `/espace/admin/reporting` : volumes (demandes,
  familles, intervenants), **taux de transformation**, part de profils vérifiés, délai
  moyen de première proposition, satisfaction (note moyenne), avis à modérer.
- **Répartition des demandes par statut** (visualisation) et **flux d'activité récente**
  (supervision — RG-40).
- Indicateurs calculés en temps réel par agrégation. Exports et suivi par conseiller à venir.

### Incrément 6 — Avis & recommandations (Module M11, RG-31/32/34 ; éligibilité RG-24/27)
- **Dépôt d'avis** par la famille **après une prestation réalisée** (placement) — un seul
  avis par prestation, rattaché à l'auteur (RG-27/32).
- **Modération** par l'agence avant publication : approuver / rejeter / masquer, et
  **réponse publique** (RG-31/34) ; file de modération filtrable `/espace/admin/avis`.
- **Note moyenne** recalculée automatiquement à partir des avis approuvés.
- **Témoignages publics** (accueil, À propos) alimentés par les avis approuvés
  (anonymisés), avec repli sur des témoignages illustratifs si aucun avis publié.

### Incrément 5 — Espaces enrichis (Modules M7/M8, RG-25/26/30)
- **Messagerie** famille ↔ agence rattachée à chaque demande (RG-25) : fil de discussion
  bidirectionnel, contrôle d'accès strict (la famille n'accède qu'à ses conversations).
- **Documents** (RG-26) : l'agence met devis / contrats / attestations / factures à
  disposition (par lien) ; la famille les consulte en **lecture seule** (page dédiée +
  par demande).
- **Calendrier de disponibilités** intervenant (RG-30) : ajout / suppression de créneaux
  hebdomadaires, exploités par la présélection.
- Navigation et tableau de bord complétés par rôle (Documents, Disponibilités).
- Protection des routes migrée vers la convention **`proxy`** de Next.js 16.

### Incrément 4 — Demande & Mise en relation (Modules M5/M6, RG-16 à RG-24)
- **Dépôt de demande** (visiteur invité ou famille connectée), accusé de réception
  e-mail + SMS et notification agence (RG-16/19).
- **Cycle de vie de la demande** (RG-17) : nouvelle → qualifiée → présélection →
  profils proposés → en cours → conclue / abandonnée.
- **Espace Famille** : liste & suivi des demandes, **profils proposés** (anonymisés),
  expression d'intérêt, **demande de remplacement** (US-11).
- **Espace Intervenant** : propositions de mission reçues, **accepter / refuser**.
- **Back-office agence** : qualification, affectation, **devis/estimation**, transitions
  de statut, **présélection assistée par le moteur de matching**, pilotage des
  propositions (rencontre, placement), **journal d'activité horodaté** (RG-23).
- **RG-22** : les coordonnées (famille ↔ intervenant) ne sont divulguées qu'**après
  validation de la mise en relation par l'agence**.
- **RG-24** : le placement conclu clôt la demande et ouvrira l'éligibilité aux avis (M11).

### Incrément 3 — Profils & Recherche/Matching (Modules M3/M4, RG-07 à RG-15)
- **Profil professionnel intervenant** : métiers & zones multiples (RG-11), expérience,
  langues, compétences, formations, permis, disponibilités, références.
- **Cycle de vie du profil** (RG-07) : brouillon → soumis → en vérification → vérifié →
  actif → suspendu / archivé ; soumission à vérification par l'intervenant.
- **Back-office agence** (`/espace/admin/intervenants`, rôle ADMIN) : liste filtrable par
  statut, fiche détaillée, **vérification identité/références**, badges, blacklist, notes
  internes, transitions de statut — chaque action **tracée** (RG-10).
- **Recherche & matching** (`/trouver-un-intervenant`) : seuls les profils vérifiés/actifs
  remontent (RG-12), **score pondéré** service/zone/fréquence/langue/expérience (RG-13),
  tri pertinence/note/expérience, filtres via URL (SEO).
- **Anonymisation stricte** (RG-09/15) : prénom + initiale, **aucune coordonnée** exposée
  côté public ; coordonnées visibles de l'agence uniquement.

### Incrément 2 — Comptes & Authentification (Module M2, RG-01 à RG-06)
- Inscription **Famille / Intervenant** avec champs adaptés au rôle (US-01, US-02).
- Connexion par **e-mail ou téléphone**, déconnexion, sessions opaques révocables
  (cookie httpOnly, empreinte hachée en base).
- **Vérification de compte par OTP** (RG-03) — code à 6 chiffres, expiration, tentatives limitées.
- **Consentement RGPD horodaté** (RG-04), mots de passe **hachés bcrypt** + politique de robustesse (RG-05).
- **Verrouillage anti-bruteforce** après 5 tentatives (RG-06) + rate limiting par IP.
- **Réinitialisation de mot de passe** sécurisée par lien à usage unique (US-03).
- **Espace personnel protégé** (`/espace`) avec RBAC (middleware + gardes serveur) :
  tableau de bord adapté au rôle, édition de profil, changement de mot de passe,
  suppression de compte (droit RGPD).
- Persistance **Prisma** (SQLite en dev, **PostgreSQL-ready** en prod).

#### Base de données & comptes de démonstration
```bash
npx prisma migrate dev      # crée/migre la base
npm run db:seed             # comptes de démo (mot de passe : MotDePasse123)
```
Comptes seedés : `admin@sosnounous.ci` (ADMIN), `famille@example.com` (FAMILY),
`intervenant@example.com` (INTERVENANT). En mode `NOTIFICATIONS_MODE=mock`, les codes
OTP et liens de réinitialisation s'affichent dans la **console du serveur**.

> ⚠️ Pour passer en PostgreSQL : modifier `provider` dans `prisma/schema.prisma`,
> renseigner `DATABASE_URL`, puis `npx prisma migrate deploy`.

### Incrément 1 — Site vitrine
- Design system (palette confiance bleu/teal + accent corail, conforme CDC §5.5).
- Layout global mobile-first : header (double entrée, téléphone visible, accès espace),
  footer (bloc légal).
- Pages publiques : Accueil, Services (+ détail par service), Trouver un intervenant
  (profils anonymisés + filtres), Devenir intervenant, Notre méthode, Tarifs & devis,
  À propos (avec le mot de la promotrice), FAQ, Contact, pages légales, plan du site.
- Formulaires fonctionnels : contact + demande de devis multi-étapes
  (validation client/serveur, anti-spam pot-de-miel, rate limiting, états
  chargement/erreur/succès).
- Notifications transactionnelles **mockées** derrière une interface branchable
  (e-mail / SMS) — CDC §3.9 / §4.10.
- SEO : métadonnées par page, `sitemap.xml`, `robots.txt`, données structurées
  (LocalBusiness, FAQPage), HTML sémantique.
- Accessibilité : skip link, focus visible, navigation clavier, libellés de formulaires,
  contrastes, `prefers-reduced-motion`.
- En-têtes de sécurité de base (CDC §4.3).

### Prochains incréments (périmètre CDC restant)
1. **Renseignement des données réelles** par l'agence : infos légales, clés providers, contenus, services & tarifs.
2. **Mise en production** : PostgreSQL, hébergement, domaine, sauvegardes, supervision, recette (voir `docs/DEPLOIEMENT.md`).
3. **Option phase 2** — Paiement Mobile Money.
4. (Optionnel) Messagerie temps réel, géolocalisation, application mobile native — hors périmètre v1 (CDC §1.6).

## Stack technique
- **Next.js 16** (App Router, React 19, TypeScript)
- **Tailwind CSS 3**
- **Prisma 6** (ORM) — SQLite en dev, PostgreSQL en prod
- **Authentification maison** : sessions opaques + cookie httpOnly, bcrypt, OTP, RBAC
- API : route handlers Next.js (`app/api/*`)
- Données de contenu : fichiers TypeScript dans `lib/data` (migration CMS prévue)

## Démarrage

```bash
npm install
cp .env.example .env         # renseigner DATABASE_URL (PostgreSQL)
docker compose up -d db      # PostgreSQL local (ou utiliser votre propre instance)
npm run db:deploy            # applique la migration initiale
npm run db:seed              # (optionnel) données de démonstration
npm run dev                  # http://localhost:3000
```
> Le projet utilise **PostgreSQL** (dev & prod). Voir `docs/DEPLOIEMENT.md` pour le déploiement.

### Scripts
| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run db:migrate` | Crée/applique une migration Prisma |
| `npm run db:seed` | Insère les comptes de démonstration |
| `npm run db:studio` | Explore la base (Prisma Studio) |
| `npm run lint` | Analyse ESLint |

## Arborescence

```
app/                  Pages (App Router) + routes API + sitemap/robots
  api/                Endpoints (contact, devis)
  <pages>/            Une page par route
components/
  layout/             Header, Footer
  ui/                 Design system (Button, Card, Section, Icon, Badge…)
  forms/              Champs + formulaires
lib/
  data/               Contenus (site, services, méthode, faq, profils…)
  notifications.ts    Abstraction e-mail/SMS (mock → live)
  validation.ts       Validation partagée client/serveur
  rateLimit.ts        Limitation de débit (anti-abus)
  seo.ts              Fabrique de métadonnées
```

## Configuration & sécurité
- Aucun secret n'est committé : tout passe par `.env.local` (voir `.env.example`).
- Validation serveur systématique sur les formulaires, anti-spam + rate limiting.
- En-têtes de sécurité dans `next.config.mjs`.

## Conformité
Les données personnelles seront traitées conformément à la **loi ivoirienne n°2013-450
(ARTCI)** et aux principes du **RGPD** (CDC §4.4). Les pages légales fournies sont des
**modèles à finaliser** avec l'agence et un conseil juridique avant mise en production
(raison sociale, RCCM, hébergeur, durées de conservation, bandeau cookies).

## Contenus à fournir par l'agence (placeholders balisés dans le code)
- Coordonnées réelles (téléphone, e-mail, adresse) — via `.env.local` / `lib/data/site.ts`.
- Photos authentiques (familles, intervenants — contexte ivoirien, CDC §5.5).
- Vrais témoignages (modérés), grilles tarifaires, mentions légales complètes.
- Logo définitif de la marque.
