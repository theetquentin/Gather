#!/bin/bash
set -e

BACKEND_CONF="./nginx/conf.d/backend.conf"
FRONTEND_CONF="./nginx/conf.d/frontend.conf"
BACKEND_HTTP="./nginx/conf.d/backend.conf.http"
BACKEND_HTTPS="./nginx/conf.d/backend.conf.https"
FRONTEND_HTTP="./nginx/conf.d/frontend.conf.http"
FRONTEND_HTTPS="./nginx/conf.d/frontend.conf.https"

echo "Lancement du déploiement en production..."

# Étape 0 : Créer les dossiers certbot et vérifier les permissions
CERT_DIR="./certbot/conf"
WWW_DIR="./certbot/www"
mkdir -p "$CERT_DIR"
mkdir -p "$WWW_DIR/.well-known/acme-challenge"

# S'assurer que les dossiers sont accessibles en écriture
chmod -R 755 ./certbot || true
if [ ! -w "$CERT_DIR" ]; then
  echo "Attention : vous n'avez pas les droits d'écriture sur $CERT_DIR"
  echo "Ajustez les permissions avec: sudo chown -R \$USER:\$USER ./certbot"
  exit 1
fi

echo "Dossiers Certbot créés et configurés"

echo "Étape 1 : Configuration HTTP et démarrage des services..."
cp "$BACKEND_HTTP" "$BACKEND_CONF"
cp "$FRONTEND_HTTP" "$FRONTEND_CONF"
docker compose up -d frontend backend nginx


if [ ! -d "./certbot/conf/live" ]; then
  echo "Étape 2 : Génération du certificat SSL avec Certbot..."
  docker compose run --rm certbot
else
  echo "Les certificats SSL existent déjà, passage à HTTPS..."
fi

echo "Étape 3 : Basculement vers HTTPS..."
cp "$BACKEND_HTTPS" "$BACKEND_CONF"
cp "$FRONTEND_HTTPS" "$FRONTEND_CONF"

echo "Étape 4 : Relance de Nginx..."
docker compose restart nginx

echo "Déploiement terminé !"
docker compose ps
