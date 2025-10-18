#!/bin/bash
set -e
echo "Démarrage en mode DÉVELOPPEMENT..."

set -a
source ./.env
source ./frontend/.env
set +a

export NODE_ENV=dev
export VITE_NODE_ENV=dev

docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build --force-recreate
