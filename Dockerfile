# ─────────────────────────────────────────────────────────────────────────────
# Image de production — SOS Nounous & Services (Next.js 16 + Prisma)
# Base Debian slim (compatibilité moteur Prisma / OpenSSL).
# ⚠️ À valider en CI/staging (non testé dans l'environnement de développement).
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-slim

WORKDIR /app

# OpenSSL requis par le moteur Prisma
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Dépendances (le postinstall exécute `prisma generate` — le schéma est présent)
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Code applicatif + build de production
COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Les migrations sont appliquées au démarrage du conteneur
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
