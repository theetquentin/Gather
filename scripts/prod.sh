#!/bin/bash
set -e

BACKEND_CONF="./nginx/conf.d/backend.conf"
FRONTEND_CONF="./nginx/conf.d/frontend.conf"
BACKEND_HTTP="./nginx/conf.d/backend.conf.http"
BACKEND_HTTPS="./nginx/conf.d/backend.conf.https"
FRONTEND_HTTP="./nginx/conf.d/frontend.conf.http"
FRONTEND_HTTPS="./nginx/conf.d/frontend.conf.https"

echo "🚀 Lancement du déploiement en production..."

# Étape 0 : Vérifier les droits sur ./certbot/conf/live
CERT_DIR="./certbot/conf/live"
if [ ! -r "$CERT_DIR" ] || [ ! -w "$CERT_DIR" ]; then
  echo "⚠️  Attention : vous n'avez pas les droits nécessaires sur $CERT_DIR"
  echo "Lancez le script avec sudo ou ajustez les permissions."
  exit 1
fi

# Étape 1 : Copier les configs HTTP et démarrer les services
echo "🔹 Étape 1 : Configuration HTTP et démarrage des services..."
cp "$BACKEND_HTTP" "$BACKEND_CONF"
cp "$FRONTEND_HTTP" "$FRONTEND_CONF"
docker compose up -d frontend backend nginx

# Étape 2 : Génération du certificat SSL si nécessaire
if [ ! -d "./certbot/conf/live" ]; then
  echo "🔹 Étape 2 : Génération du certificat SSL avec Certbot..."
  docker compose run --rm certbot
else
  echo "✅ Les certificats SSL existent déjà, passage à HTTPS..."
fi

# Étape 3 : Basculer vers HTTPS
echo "🔹 Étape 3 : Basculement vers HTTPS..."
cp "$BACKEND_HTTPS" "$BACKEND_CONF"
cp "$FRONTEND_HTTPS" "$FRONTEND_CONF"

# Étape 4 : Relance de Nginx
echo "🔹 Étape 4 : Relance de Nginx..."
docker compose restart nginx

echo "✅ Déploiement terminé !"
docker compose ps
