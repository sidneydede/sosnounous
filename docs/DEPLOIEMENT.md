# Guide de mise en production — SOS Nounous & Services

Référence : CDC GBC-SOSN-CDC-2026-001 (§4.5 Hébergement, §4.6 Performance, §4.7 Sauvegarde,
§4.8 Maintenance, §8.4 Conditions de mise en production).

> Ce document décrit la procédure de passage en production de la plateforme
> (Next.js 16 + Prisma). En développement, la base est SQLite ; en production, **PostgreSQL**.

---

## 1. Pré-requis

- Node.js 22+ (ou exécution via conteneur Docker).
- Une base **PostgreSQL** managée (sauvegardée, haute disponibilité — §4.5).
- Un fournisseur d'**e-mail transactionnel** (clé API) et une **passerelle SMS** (§4.10).
- Un **nom de domaine** + certificat **TLS** (§4.5).
- Un stockage de fichiers **persistant et chiffré** pour les pièces justificatives (§4.4).

---

## 2. Variables d'environnement (production)

Définir ces variables dans l'environnement d'hébergement (jamais committées) :

| Variable | Rôle |
|---|---|
| `NODE_ENV=production` | Active le mode production (cookies `Secure`, HSTS). |
| `DATABASE_URL` | URL PostgreSQL (`postgresql://user:pass@host:5432/db?schema=public`). |
| `NEXT_PUBLIC_SITE_URL` | URL publique (SEO, sitemap, liens absolus). |
| `NEXT_PUBLIC_AGENCY_PHONE` / `NEXT_PUBLIC_AGENCY_EMAIL` | Coordonnées affichées. |
| `FILE_ENCRYPTION_KEY` | Clé hex 32 octets — chiffrement des pièces (§4.4). **Secrète.** |
| `FILE_STORAGE_DIR` | Répertoire persistant des fichiers chiffrés (volume monté). |
| `NOTIFICATIONS_MODE=live` | Active l'envoi réel (e-mail/SMS). |
| `EMAIL_API_KEY` / `EMAIL_API_URL` / `EMAIL_FROM` | Fournisseur e-mail. |
| `SMS_API_KEY` / `SMS_API_URL` / `SMS_SENDER` | Passerelle SMS. |

Générer une clé de chiffrement :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. Base de données PostgreSQL

Le projet utilise **PostgreSQL** (dev & prod) ; la **migration initiale est fournie**
(`prisma/migrations/0_init`). 

1. Créer une **base dédiée** (et idéalement un utilisateur dédié) sur le serveur PostgreSQL —
   ne pas réutiliser la base d'une autre application :
   ```sql
   CREATE DATABASE sosnounous;
   CREATE USER sosnounous WITH PASSWORD '…';
   GRANT ALL PRIVILEGES ON DATABASE sosnounous TO sosnounous;
   ```
2. Renseigner `DATABASE_URL` (env de l'hébergement).
3. Appliquer le schéma — automatique au démarrage du conteneur (`docker-entrypoint.sh` exécute
   `prisma migrate deploy`), ou manuellement :
   ```bash
   npm run db:deploy   # prisma migrate deploy
   ```
4. **Créer le compte administrateur initial** (ne pas utiliser le seed de démonstration en prod) :
   soit en adaptant `prisma/seed.ts` (mots de passe changés), soit en insérant l'admin en base
   (e-mail, `passwordHash` bcrypt, `role='ADMIN'`, `status='ACTIVE'`, `consentAt`).

> En local, `docker compose up db` fournit une base PostgreSQL prête à l'emploi
> (voir `docker-compose.yml`).

---

## 4. Build & exécution

```bash
npm ci
npx prisma generate
npm run build
npm run db:deploy      # migrations
npm run start          # serveur de production (port 3000)
```

### Option A — Hébergement Node managé / PaaS
Configurer : commande de build `npm run build`, commande de démarrage `npm run start`,
variables d'environnement, et un job de release exécutant `npm run db:deploy`.

### Option B — Plateforme type Vercel
Compatible (Next.js natif). Prévoir une base PostgreSQL managée externe, configurer les
variables d'environnement, et exécuter `prisma migrate deploy` en étape de build/release.
⚠️ Le stockage de fichiers local n'est pas persistant en serverless : utiliser un stockage
objet (S3 + chiffrement) en adaptant `lib/storage.ts`.

### Option C — Conteneur Docker (fourni)
```bash
docker build -t sosnounous .
docker run -d --name sosnounous -p 3000:3000 \
  -e DATABASE_URL="postgresql://…" \
  -e FILE_ENCRYPTION_KEY="…" \
  -e FILE_STORAGE_DIR="/data/uploads" \
  -e NEXT_PUBLIC_SITE_URL="https://…" \
  -e NOTIFICATIONS_MODE="live" -e EMAIL_API_KEY="…" -e SMS_API_KEY="…" -e SMS_API_URL="…" \
  -v sosn_uploads:/data/uploads \
  sosnounous
```
Les migrations sont appliquées automatiquement au démarrage (`docker-entrypoint.sh`).
Placer un reverse-proxy (TLS) devant le conteneur.

**Stack complète (app + PostgreSQL) en une commande** — utile en staging :
```bash
docker compose up --build    # voir docker-compose.yml (base + app + volumes)
```

---

## 5. TLS, domaine & e-mails (§4.5)
- Certificat **TLS** valide (Let's Encrypt ou fournisseur) ; redirection HTTP→HTTPS.
- Nom de domaine dédié pointant vers l'hébergement.
- Adresses e-mail professionnelles + configuration SPF/DKIM/DMARC pour la délivrabilité.

---

## 6. Performance (§4.6)
- Images optimisées (Next/Image), mise en cache, code splitting — déjà en place.
- Cibles : pages clés ≤ 3 s en mobile, disponibilité ≥ 99,5 %.
- Mettre un CDN/edge devant les assets statiques si possible.
- **Rate limiting** : l'implémentation actuelle est en mémoire (par instance). En
  multi-instances, brancher un store partagé (Redis) dans `lib/rateLimit.ts`.

---

## 7. Sauvegarde & continuité (§4.7)
- **Base de données** : sauvegardes automatiques chiffrées (ex. quotidiennes 30 j + hebdo 3 mois),
  externalisées ; tests de restauration périodiques.
- **Fichiers** (`FILE_STORAGE_DIR`) : sauvegarde du volume (les fichiers sont chiffrés au repos).
- Définir **RPO/RTO** et un plan de reprise (PRA).

---

## 8. Supervision (§4.5)
- Sonde de santé : `GET /api/health` (200 = OK, 503 = base injoignable). À brancher sur
  l'orchestrateur / l'outil de monitoring (uptime, alertes).
- Journalisation applicative + alertes sur erreurs 5xx.
- Suivi des envois de notifications : back-office `/espace/admin/notifications` (RG-38).

---

## 9. Sécurité — vérifications avant go-live (§4.3, §8.2)
- [ ] HTTPS/TLS actif partout ; HSTS envoyé en production (configuré).
- [ ] `FILE_ENCRYPTION_KEY`, `DATABASE_URL`, clés API : secrets hors dépôt.
- [ ] Mots de passe de **démonstration changés** ; compte admin réel créé.
- [ ] Sauvegardes chiffrées + restauration testée.
- [ ] Rate limiting adapté (Redis si multi-instances).
- [ ] (Recommandé) Définir une **Content-Security-Policy** et la tester (non activée par
      défaut pour éviter de casser le rendu — à valider en recette).
- [ ] Scan des dépendances (`npm audit`) et mises à jour de sécurité.

---

## 10. Conformité RGPD / loi 2013-450 (§4.4, §8.4)
- [ ] Renseigner les **informations légales réelles** (`legal` dans `lib/data/site.ts`).
- [ ] Finaliser **mentions légales**, **politique de confidentialité**, **CGU** (durées de conservation, sous-traitants).
- [ ] Compléter le **registre des traitements** (`docs/registre-des-traitements.md`).
- [ ] Bandeau cookies actif (configuré) ; vérifier le consentement avant tout traceur.
- [ ] Encadrer contractuellement les sous-traitants (hébergeur, e-mail, SMS).

---

## 11. Recette & smoke tests post-déploiement (§8)
- [ ] `GET /api/health` → 200.
- [ ] Pages publiques accessibles (accueil, services, contact, légales).
- [ ] Inscription → OTP reçu (e-mail réel) → connexion.
- [ ] Dépôt de demande → accusé reçu → visible au back-office.
- [ ] Parcours agence : vérification profil, proposition, placement.
- [ ] Upload d'une pièce justificative → téléchargement réservé (agence/owner).
- [ ] Dépôt d'avis → modération → publication.
- [ ] Responsive mobile (priorité mobile-first).

---

## 12. Rollback
- Conserver l'image/déploiement précédent ; revenir à la version antérieure en cas d'anomalie bloquante.
- Les migrations Prisma sont additives ; prévoir une procédure de retour (restauration d'une
  sauvegarde de base si une migration doit être annulée).
