# Registre des traitements de données à caractère personnel

**SOS Nounous & Services** — Conformité loi ivoirienne n°2013-450 (autorité : ARTCI) & alignement RGPD (CDC §4.4).

> ⚠️ Document interne **modèle** à compléter et tenir à jour par l'agence (responsable du
> traitement). Les durées de conservation, sous-traitants et coordonnées doivent être validés
> avec un conseil juridique avant la mise en production.

## Identité du responsable de traitement
- **Entité** : à compléter (raison sociale, RCCM)
- **Représentant légal** : Mme Marcelle Kouakou
- **Contact données** : voir `lib/data/site.ts` → `legal.dataContactEmail`

## Traitements recensés

### T1 — Gestion des comptes & authentification
| Champ | Valeur |
|---|---|
| Finalité | Création de compte, connexion sécurisée, gestion des rôles |
| Base légale | Exécution du service / consentement |
| Catégories de données | Identité, e-mail, téléphone, mot de passe (haché), commune, consentement horodaté |
| Personnes concernées | Familles, intervenants, administrateurs |
| Durée de conservation | À définir (ex. durée du compte + X mois après suppression) |
| Destinataires | Agence ; hébergeur (sous-traitant) |
| Sécurité | Hachage bcrypt, OTP, RBAC, journalisation, TLS |

### T2 — Base de candidats intervenants
| Champ | Valeur |
|---|---|
| Finalité | Constitution, qualification et vérification des profils |
| Base légale | Exécution du service / consentement |
| Catégories de données | Identité, pièces justificatives, expérience, références, zones, disponibilités |
| Personnes concernées | Intervenants |
| Durée de conservation | À définir |
| Destinataires | Agence ; familles (vue **anonymisée**, hors coordonnées — RG-09/15) |
| Sécurité | Accès restreint, anonymisation publique, traçabilité des vérifications (RG-10) |

### T3 — Demandes & mise en relation
| Champ | Valeur |
|---|---|
| Finalité | Captation du besoin, présélection, suivi du placement |
| Base légale | Exécution du service |
| Catégories de données | Coordonnées, besoin, **données relatives aux enfants** (précautions renforcées) |
| Personnes concernées | Familles, enfants du foyer |
| Durée de conservation | À définir |
| Destinataires | Agence ; intervenant retenu (coordonnées libérées après validation — RG-22) |
| Sécurité | Cloisonnement par rôle, minimisation, libération conditionnelle des coordonnées |

### T4 — Messagerie & documents
| Champ | Valeur |
|---|---|
| Finalité | Échanges famille ↔ agence, mise à disposition de documents |
| Base légale | Exécution du service |
| Catégories de données | Contenu des messages, documents (devis, contrats…) |
| Durée de conservation | À définir |

### T5 — Avis & réputation
| Champ | Valeur |
|---|---|
| Finalité | Recueil et publication d'avis modérés |
| Base légale | Consentement / intérêt légitime |
| Catégories de données | Note, commentaire, auteur (publié de façon anonymisée) |
| Durée de conservation | À définir |

### T6 — Notifications transactionnelles
| Champ | Valeur |
|---|---|
| Finalité | Accusés, alertes, OTP, rappels |
| Base légale | Exécution du service / consentement (préférences) |
| Catégories de données | E-mail, téléphone |
| Destinataires | Sous-traitants e-mail & SMS |
| Statut | Architecture en place ; **passerelle réelle à brancher** (M10) |

### T7 — Mesure d'audience (cookies)
| Champ | Valeur |
|---|---|
| Finalité | Statistiques d'usage pour amélioration |
| Base légale | **Consentement** (bandeau cookies) |
| Statut | Consentement géré (`/cookies`) ; outil d'analyse à intégrer le cas échéant |

## Droits des personnes
Accès, rectification, suppression, opposition, portabilité. La suppression de compte est
self-service (espace → Sécurité). Les autres demandes sont adressées au contact données.

## Sous-traitants (à formaliser par contrat)
| Sous-traitant | Rôle | Localisation | Contrat |
|---|---|---|---|
| Hébergeur | Hébergement applicatif & base de données | à préciser | à formaliser |
| Fournisseur e-mail | E-mails transactionnels | à préciser | à formaliser |
| Passerelle SMS | SMS (OTP, alertes) | à préciser | à formaliser |

## Mesures de sécurité transverses (CDC §4.3)
TLS, mots de passe hachés, OTP, RBAC, rate limiting, anti-spam, journalisation des actions
sensibles, sauvegardes chiffrées (à mettre en place en production), minimisation et privacy by design.
