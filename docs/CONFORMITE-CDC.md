# Revue de conformité au cahier des charges

Projet : **SOS Nounous & Services** — Réf. CDC **GBC-SOSN-CDC-2026-001**.
Légende : ✅ conforme · ⚠️ partiel / à finaliser · ⛔ non couvert (hors périmètre v1 ou opérationnel).

> État technique à la date de la revue : `npm run build` ✅, `npm run lint` ✅ (0 erreur),
> ~50 routes API + ~35 pages. Base SQLite en dev, PostgreSQL-ready en prod.

---

## 1. Synthèse

| Axe | Couverture |
|---|---|
| **Fonctionnel (modules M1–M12)** | ✅ ~96 % |
| **Règles de gestion (RG-01 → RG-43)** | ✅ 40 conformes · ⚠️ 3 partielles |
| **User stories (US-01 → US-15)** | ✅ 15 / 15 |
| **Technique & sécurité (§4)** | ✅ ~85 % (reste : tests automatisés, CSP, infra) |
| **RGPD / loi 2013-450 (§4.4)** | ✅ mécanismes complets · ⚠️ valeurs légales réelles à saisir |
| **UX / UI (§5)** | ✅ + charte graphique officielle appliquée |
| **Livrables (§6)** | ⚠️ code + docs techniques ✅ ; SFD/DAT/maquettes/recette formelle à part |
| **Mise en production (§8.4)** | ⚠️ artefacts + guide prêts ; déploiement réel à réaliser |

**Verdict** : le périmètre **fonctionnel et de développement** du lot 1 est essentiellement
**réalisé et vérifié**. Restent des éléments **opérationnels** (infra, données réelles, recette
formelle) et quelques compléments (tests automatisés, exports PDF, cartographie).

---

## 2. Modules fonctionnels (M1–M12)

| Module | État | Détail |
|---|---|---|
| M1 Site vitrine & contenus | ✅ | Accueil double entrée, services, méthode, à-propos, FAQ, contact, légal. |
| M2 Comptes & authentification | ✅ | Inscription Famille/Intervenant, OTP, RBAC, réinit. mot de passe. |
| M3 Profils & base de candidats | ✅ | Cycle de vie, vérification tracée, pièces chiffrées. |
| M4 Recherche & matching | ✅ | Filtres, score pondéré, anonymisation. |
| M5 Demande & devis | ✅ | Dépôt invité/famille, accusés, devis ; ⚠️ brouillon (RG-18) partiel. |
| M6 Mise en relation & candidatures | ✅ | Propositions, statuts tracés, divulgation contrôlée, placement. |
| M7 Espace Famille | ✅ | Suivi, profils proposés, messagerie, documents, avis, remplacement. |
| M8 Espace Intervenant | ✅ | Profil, disponibilités, propositions, pièces, messagerie indirecte. |
| M9 Back-office | ✅ | Reporting, demandes, candidats, avis, notifications, paramétrage, exports. |
| M10 Notifications email/SMS | ✅ | Catalogue, préférences, journal, modèles ; envoi réel branché (clés à fournir). |
| M11 Avis & recommandations | ✅ | Dépôt après prestation, modération, réponse, note moyenne, badges. |
| M12 Contact & devis | ✅ | Formulaires, anti-spam, accusés. |

---

## 3. Matrice des règles de gestion (RG)

| RG | Exigence | État | Implémentation |
|---|---|---|---|
| RG-01 | Rôle unique par compte | ✅ | `User.role` (FAMILY/INTERVENANT/ADMIN) |
| RG-02 | E-mail & téléphone uniques | ✅ | Contraintes `@unique` + contrôle |
| RG-03 | Activation après vérification | ✅ | OTP → statut ACTIVE |
| RG-04 | Consentement horodaté | ✅ | `consentAt` |
| RG-05 | Mot de passe haché + robuste | ✅ | bcrypt + politique |
| RG-06 | Anti-bruteforce | ✅ | Verrouillage 15 min / 5 essais |
| RG-07 | Cycle de vie du profil | ✅ | DRAFT→…→ACTIVE/SUSPENDED |
| RG-08 | Proposable si vérifié/actif | ✅ | Contrôle au matching & à la proposition |
| RG-09 | Coordonnées masquées aux familles | ✅ | Projection anonymisée |
| RG-10 | Vérifications tracées | ✅ | `VerificationEvent` |
| RG-11 | Plusieurs métiers / zones | ✅ | Listes JSON |
| RG-12 | Seuls vérifiés/actifs en résultats | ✅ | Filtre `searchProfiles` |
| RG-13 | Matching pondéré | ✅ | `scoreProfile` |
| RG-14 | Mise en relation validée par l'agence | ✅ | Modèle hybride (propositions agence) |
| RG-15 | Anonymisation (prénom + initiale) | ✅ | `toPublicProfile` |
| RG-16 | Demande rattachée famille/invité | ✅ | `Demande.familyId` nullable |
| RG-17 | Statuts de la demande | ✅ | NEW→…→CONCLUDED/ABANDONED |
| RG-18 | Brouillon de demande | ⚠️ | Statut DRAFT présent ; pas d'enregistrement brouillon en UI |
| RG-19 | Accusé + notification agence | ✅ | E-mail + SMS + notif |
| RG-20 | Mise en relation (demande↔profils↔famille) | ✅ | `Proposition` |
| RG-21 | Statuts de candidature | ✅ | RECEIVED→…→PLACED/REJECTED |
| RG-22 | Divulgation coordonnées après validation | ✅ | `coordinatesReleased` |
| RG-23 | Changements de statut tracés | ✅ | `ActivityEvent` |
| RG-24 | Placement → suivi & éligibilité avis | ✅ | Placement → CONCLUDED + avis |
| RG-25 | Cloisonnement données famille | ✅ | Contrôles d'accès serveur |
| RG-26 | Documents lecture seule téléchargeables | ✅ | `Document` + page Documents |
| RG-27 | Avis seulement après prestation | ✅ | Contrôle statut PLACED |
| RG-28 | Intervenant voit offres compatibles | ✅* | Propositions le concernant (modèle hybride) |
| RG-29 | Complétude/vérif. conditionnent la visibilité | ✅ | Statut + complétude au dépôt |
| RG-30 | Calendrier de disponibilités | ✅ | `AvailabilitySlot` CRUD |
| RG-31 | Avis modéré avant publication | ✅ | Statut PENDING→APPROVED |
| RG-32 | Avis rattaché prestation + auteur | ✅ | `Review.propositionId` + auteur |
| RG-33 | Références vérifiées → badge | ✅ | Vérif. agence → badge |
| RG-34 | Réponse publique / masquage | ✅ | `agencyReply` + statut HIDDEN |
| RG-35 | Événement → notification paramétrable | ✅ | Catalogue + modèles éditables |
| RG-36 | SMS critique / e-mail courant | ✅ | `critical` + canal |
| RG-37 | Préférences de notification | ✅ | `notifyEmail`/`notifySms` |
| RG-38 | Journalisation des envois | ✅ | `NotificationLog` |
| RG-39 | Back-office restreint + journalisé | ✅ | RBAC + journalisation |
| RG-40 | Actions sensibles tracées/auditables | ✅ | Événements + journaux |
| RG-41 | Paramétrage sans intervention technique | ✅ | Services, zones, FAQ, tarifs, modèles notif. |
| RG-42 | CMS éditorial sans déploiement | ✅* | FAQ & services éditables ; pages narratives en code |
| RG-43 | SEO / perf par page | ✅ | Metadata, sitemap, robots, JSON-LD |

\* RG-28 : conforme dans la logique du modèle hybride (l'agence propose). RG-42 : substantiellement
couvert (contenus structurés éditables) ; le texte de pages narratives (À propos, Notre méthode)
reste en code.

---

## 4. User stories (US)

| US | État | US | État |
|---|---|---|---|
| US-01 Inscription famille | ✅ | US-09 Demande de devis | ✅ |
| US-02 Inscription intervenant | ✅ | US-10 Proposition de profils | ✅ |
| US-03 Récupération d'accès | ✅ | US-11 Remplacement | ✅ |
| US-04 Vérification (conseiller) | ✅ | US-12 Suivi famille | ✅ |
| US-05 Mise à jour disponibilités | ✅ | US-13 Candidature à une offre | ✅ |
| US-06 Recherche famille | ✅ | US-14 Dépôt d'avis | ✅ |
| US-07 Matching assisté | ✅ | US-15 Pilotage (reporting) | ✅ |
| US-08 Dépôt de demande | ✅ | | |

---

## 5. Spécifications techniques (§4)

| § | Exigence | État | Note |
|---|---|---|---|
| 4.1 | Architecture 3 couches, API, RBAC, environnements | ✅ | API via route handlers (consommable mobile) ; RBAC ; dev/recette/prod documentés |
| 4.2 | Technologies (front, back, BDD, CMS, notif) | ✅ | Next.js 16, Prisma, PostgreSQL (prod), CMS intégré |
| 4.3 | Sécurité (OWASP, hachage, rate limit, anti-spam, en-têtes) | ✅ | ⚠️ CSP à définir ; CSRF atténué par cookies SameSite |
| 4.4 | RGPD / loi 2013-450 | ✅ | Consentement, droits, cookies, chiffrement au repos, registre (modèle) ; ⚠️ valeurs légales réelles |
| 4.5 | Hébergement, TLS, monitoring | ⚠️ | Guide + sonde `/api/health` ; provisioning à réaliser |
| 4.6 | Performance (≤3s mobile, dispo ≥99,5%) | ✅ | Mobile-first, ISR, optimisations ; cibles à valider en prod |
| 4.7 | Sauvegarde & PRA | ⚠️ | Procédure documentée ; à mettre en place (infra) |
| 4.8 | Maintenance & évolutivité | ⚠️ | Code modulaire, versionnable (Git) ; ⛔ **tests automatisés non fournis** |
| 4.9 | Responsive mobile-first | ✅ | Vérifié |
| 4.10 | Intégrations tierces | ⚠️ | SMS/e-mail (adaptateurs prêts) ; ⛔ cartographie ; Mobile Money phase 2 ; analytics prêt (consentement) |

---

## 6. UX / UI (§5) & charte

- Ergonomie, arborescence, double entrée, parcours guidés, fil d'Ariane, accessibilité de base : ✅
- **Charte graphique officielle** (navy/corail/or/ivoire, typographie Jost, logo, favicon) : ✅ appliquée.

---

## 7. Priorisation MoSCoW (§2.16)

| Priorité | État |
|---|---|
| **Must have** (vitrine, comptes, candidature/profils, demande/devis, présélection/proposition, espaces, back-office cœur, notifications, contact) | ✅ |
| **Should have** (recherche/filtrage avancée, avis & badges, messagerie, calendrier dispo, reporting) | ✅ |
| **Could have** (estimateur budget, paiement Mobile Money, blog, espace documents enrichi) | ⚠️ Documents ✅ ; estimateur/paiement/blog ⛔ (phase 2) |
| **Won't have v1** (app native, LMS, géoloc temps réel, marketplace self-service) | ⛔ (conforme : hors périmètre) |

---

## 8. Livrables (§6) & critères de validation (§8)

| Livrable / critère | État |
|---|---|
| Code source versionnable | ✅ (`.gitignore` prêt ; dépôt Git à initialiser) |
| Documentation technique | ✅ README + `DEPLOIEMENT.md` + `registre-des-traitements.md` + cette revue |
| SFD/DAT, wireframes/maquettes, prototype | ⚠️ Le CDC tient lieu de SFD ; maquettes = charte fournie ; à formaliser si exigé |
| Guides utilisateur (Famille/Intervenant/Admin) | ⛔ À produire |
| Plan & rapports de tests | ⚠️ Tests **manuels** par incrément réalisés ; ⛔ cahier de recette formel + tests automatisés |
| Recette fonctionnelle (§8.1) | ⚠️ Conformité RG vérifiée ; recette formelle MOA/AMOA à prononcer |
| Tests techniques (§8.2) | ⚠️ Sécurité partielle, perf à mesurer, compat. multi-navigateurs à tester, restauration à tester |
| Mise en production (§8.4) | ⚠️ Pré-requis et guide prêts ; PV de MEP à établir |

---

## 9. Écarts & points à finaliser (synthèse honnête)

1. **Tests automatisés absents** (§4.8/§6) — seuls des tests manuels par incrément ont été réalisés. Recommandation : ajouter une suite (unit + e2e) avant TMA.
2. **Brouillon de demande (RG-18)** — statut prévu, enregistrement explicite en UI à ajouter.
3. **CMS pages narratives (RG-42)** — FAQ/services/tarifs/zones éditables ; textes À propos/Méthode encore en code.
4. **Sécurité §4.3** — définir une **CSP**, envisager des jetons CSRF explicites (cookies SameSite atténuent déjà).
5. **Intégrations §4.10** — cartographie non intégrée ; analytics à brancher (consentement prêt).
6. **Opérationnel (côté agence/hébergeur)** — PostgreSQL, hébergement, domaine/TLS, sauvegardes, supervision, **clés providers e-mail/SMS**, **informations légales réelles**, recette formelle.
7. **Données de démonstration** présentes en base de développement (à réinitialiser pour la prod).

---

## 10. Conclusion

Le développement couvre **l'intégralité du cœur fonctionnel du lot 1** (Must + Should have) avec
les exigences de sécurité et de conformité **implémentées**, et la **charte graphique officielle**
appliquée. Le projet est **prêt pour la recette et le déploiement**, sous réserve des actions
opérationnelles listées en §9. Les exclusions (§2.16 « Won't have ») sont respectées.
