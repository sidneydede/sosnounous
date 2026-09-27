#!/bin/sh
# Démarrage du conteneur — SOS Nounous & Services.
#
# Les migrations sont appliquées au démarrage. Une base managée peut être
# momentanément injoignable (redémarrage, bascule, réseau) : on réessaie au lieu
# d'abandonner. En dernier recours le serveur démarre quand même — un conteneur
# qui sort en erreur est relancé en boucle par l'hébergeur, ce qui finit en
# suspension automatique du service (incident constaté le 27/09/2026).
set -e

MIGRATE_RETRIES="${MIGRATE_RETRIES:-10}"
MIGRATE_RETRY_DELAY="${MIGRATE_RETRY_DELAY:-6}"

attempt=1
while true; do
  echo "→ Application des migrations (tentative ${attempt}/${MIGRATE_RETRIES})…"
  if npx prisma migrate deploy; then
    echo "→ Migrations appliquées."
    break
  fi

  if [ "$attempt" -ge "$MIGRATE_RETRIES" ]; then
    echo "⚠️  ÉCHEC des migrations : base injoignable ou DATABASE_URL invalide." >&2
    echo "⚠️  Démarrage en mode dégradé — les pages publiques répondent, les" >&2
    echo "⚠️  fonctions base échoueront. Diagnostic : GET /api/health/db." >&2
    break
  fi

  attempt=$((attempt + 1))
  sleep "$MIGRATE_RETRY_DELAY"
done

echo "→ Démarrage du serveur…"
exec "$@"
