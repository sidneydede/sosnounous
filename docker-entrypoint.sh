#!/bin/sh
set -e

echo "→ Application des migrations de base de données…"
npx prisma migrate deploy

echo "→ Démarrage du serveur…"
exec "$@"
