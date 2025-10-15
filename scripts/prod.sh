#!/bin/bash
set -e
echo "Démarrage en mode PRODUCTION..."

if [ ! -f ../.env ]; then
    echo "Fichier .env manquant"
    exit 1
fi

set -a
source ../.env
set +a

export NODE_ENV=prod
export VITE_NODE_ENV=prod
DOMAIN="${DOMAIN}"
API_DOMAIN="${API_DOMAIN}"
export MAIL="quentin.theet@gmail.com"

CERT_DIR="/etc/letsencrypt/live/$DOMAIN"

# Vérification des certificats existants
if [ -f "$CERT_DIR/fullchain.pem" ] && [ -f "$CERT_DIR/privkey.pem" ]; then
    echo "Certificat SSL déjà présent, pas besoin de régénérer."
else
    echo "Certificat SSL absent, génération en cours..."

    mkdir -p /var/www/certbot
    mkdir -p /etc/letsencrypt

    echo "Démarrage temporaire de Nginx pour Certbot..."
    docker compose --profile prod up -d nginx

    docker run --rm \
      -v /etc/letsencrypt:/etc/letsencrypt \
      -v /var/www/certbot:/var/www/certbot \
      certbot/certbot certonly \
      --webroot \
      --webroot-path=/var/www/certbot \
      --email "$MAIL" \
      --agree-tos \
      --no-eff-email \
      -d "$DOMAIN" \
      -d "$API_DOMAIN"

    echo "Redémarrage de Nginx avec SSL..."
    docker compose --profile prod restart nginx
fi

# Lancer toute la stack prod
echo "Lancement des services prod..."
docker compose --profile prod up -d --build

echo "Tous les services prod démarrés !"
echo "Frontend: https://$DOMAIN"
echo "API: https://$API_DOMAIN"
echo "Logs: docker compose logs -f"
