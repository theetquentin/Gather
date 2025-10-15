# 📚 Gather

**Gather** est une application fullstack permettant de gérer ses collections personnelles (livres, films, musiques, etc.).  
Le projet est développé en **TypeScript**, avec **Express + MongoDB** pour le backend et **React + TailwindCSS** pour le frontend.  
L’objectif est de proposer une plateforme claire et organisée, déployée via **Docker** sur **Fly.io**.

---

## 🛠️ Technologies utilisées

### Backend
- Node.js / Express
- TypeScript
- MongoDB (Mongoose)
- ESLint + Prettier

### Frontend
- React
- TypeScript
- TailwindCSS
- ESLint + Prettier

### Outils
- Docker
- Git & GitHub

---

## 📂 Structure du projet


## 🚀 Déploiement & Démarrage

Le projet est entièrement conteneurisé et géré par Docker Compose.

Prérequis : 
- **Docker** et **Docker Compose**.
- **Node.js** (recommandé pour la gestion des .env et les scripts Bash).
- **Configuration DNS** : Pour le mode Production, vous devez avoir un domaine principal et un sous-domaine (ex: gather.quentintheet.fr et api.gather.quentintheet.fr) qui sont reliés à l'adresse IP publique de votre serveur via un enregistrement DNS de type A.

### 1. Configuration des variables d'environnement

Ce projet utilise des variables d'environnement pour la configuration des services.
Créez les fichiers suivants à la racine du projet :
- ./.env (Variables globales et de backend)
- ./frontend/.env (Variables spécifiques au frontend, notamment les clés VITE_)

### 2. Démarrage en mode Développement

Le mode développement utilise des volumes pour le hot-reloading et expose les ports internes pour faciliter le débogage.

Pour lancer la stack :

`./dev.sh`

Accès :
```
Frontend : http://localhost:<VITE_FRONTEND_PORT>
Backend API : http://localhost:<BACKEND_PORT>
```

### 3. Démarrage en mode Production

Le mode production est optimisé pour un déploiement sécurisé, incluant un reverse proxy Nginx et la gestion automatique des certificats SSL (via Certbot).

Les variables **DOMAIN** et **API_DOMAIN** doivent être présentes dans votre fichier .env.

Il faut des nom de domaines reliés à votre serveur,

Pour lancer la stack de production (cela va d'abord tenter de générer ou vérifier les certificats SSL) :

`./prod.sh`

Accès :
```
Frontend : https://<DOMAIN>
Backend API : https://<API_DOMAIN>
```