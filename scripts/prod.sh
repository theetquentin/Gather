#!/bin/bash
set -e

FRONTEND_CONF="./nginx/conf.d/frontend.conf"
BACKEND_CONF="./nginx/conf.d/backend.conf"

echo "Lancement du déploiement en production..."

# Étape 0 : Vérifier les droits sur ./certbot/conf/live
CERT_DIR="./certbot/conf/live"
if [ ! -r "$CERT_DIR" ] || [ ! -w "$CERT_DIR" ]; then
  echo "Attention : vous n'avez pas les droits nécessaires sur $CERT_DIR"
  echo "Lancez le script avec sudo ou ajustez les permissions."
  exit 1
fi

# Étape 1 : Démarrage initial en HTTP
echo "🔹 Étape 1 : Démarrage initial en HTTP..."
docker compose up -d frontend backend nginx

# Étape 2 : Génération du certificat SSL si nécessaire
if [ ! -d "./certbot/conf/live" ]; then
  echo "Étape 2 : Génération du certificat SSL avec Certbot..."
  docker compose run --rm certbot
else
  echo "Les certificats existent déjà, passage à HTTPS..."
fi

# Étape 3 : bascule HTTP -> HTTPS
activate_https() {
    local file="$1"

    echo "-> Bascule HTTP/HTTPS dans $file"

    # 1. Commenter le bloc HTTP
    # Cible la plage de lignes entre '# START HTTP' et '# END HTTP'.
    # '//b' :  Exclut les lignes de balisage
    # /^\s*#/b : Exclut les lignes qui commencent par un commentaire (y compris les espaces)
    # 's/^/# /' : ajoute un '#' suivi d'un espace au début de la ligne.
    sed -i '/^# START HTTP$/,/^# END HTTP$/{
        //b
        /^\s*#/b
        s/^/# /
    }' "$file"

    # 2. Décommenter le bloc HTTPS
    sed -i '/^# START HTTPS$/,/^# END HTTPS$/{
        //!s/^# *//
    }' "$file"
}

activate_https "$FRONTEND_CONF"
activate_https "$BACKEND_CONF"

echo "Étape 4 : Relance de Nginx..."
docker compose restart nginx

echo "Déploiement terminé !"