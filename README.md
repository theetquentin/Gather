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
- Jest + Supertest

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


## 🚀 Pipeline CI/CD

Le projet **Gather** utilise un pipeline d’**Intégration Continue (CI)** et de **Déploiement Continu (CD)** basé sur **GitHub Actions**.  
Ce pipeline garantit la qualité du code, l’automatisation du déploiement et la fiabilité du processus de mise en production.

- **CI (Continuous Integration)**  
  Exécute automatiquement les tests et le linting lors des *push* et *pull requests* sur les branches `dev` et `main`.

- **CD (Continuous Deployment)**  
  Déploie automatiquement l’application en production à chaque *push* sur la branche `main`.

### ⚙️ Workflows principaux

**1. CI – Tests et Linting (`.github/workflows/ci.yml`)**
- **Déclenchement :** `push` sur `dev` ou `pull request` vers `main`  
- **Vérifications effectuées :**
  - Linting du frontend et du backend (ESLint)  
  - Tests backend (Jest avec `mongodb-memory-server`)  
  - Build du frontend (Vite)  
- **Aucun service externe requis :** une base MongoDB en mémoire est générée pour les tests.

**2. CD – Déploiement en production (`.github/workflows/deploy.yml`)**
- **Déclenchement :** `push` sur `main` ou lancement manuel via GitHub Actions  
- **Processus :**
  1. Connexion SSH au serveur distant  
  2. Récupération du code depuis `main`  
  3. Exécution du script `./scripts/prod.sh` (déploiement Docker Compose)  
  4. Vérification automatique de l’accessibilité du backend et du frontend  
- Le déploiement repose sur des **secrets GitHub** pour la connexion SSH et les domaines de production.

### 🖥️ Prérequis serveur
Le serveur de production doit disposer de :
- Git, Docker et Docker Compose installés  
- Accès SSH configuré avec clé privée  
- Projet cloné à l’emplacement défini dans `PROJECT_PATH`  
- Fichiers `.env` configurés pour le backend et le frontend  


### 🔄 Processus de déploiement
- **Automatique :** lors de la fusion sur `main`, le workflow CD est déclenché et déploie la nouvelle version.  
- **Manuel :** un déploiement peut être lancé depuis l’interface **Actions → CD - Deploy to Production**.

### 🧾 Script de production (`scripts/prod.sh`)
Le script gère :
1. Le démarrage initial des services avec Docker Compose  
2. La génération des certificats SSL via Certbot  
3. Le basculement de la configuration Nginx vers HTTPS  
4. Le redémarrage des conteneurs pour appliquer la configuration sécurisée  

### 🧾 Script de développement (`scripts/dev.sh`)
Ce script est utilisé pour développer sur sa machine et non sur serveur, avec le backend et le frontend en http simple.