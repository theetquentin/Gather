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

Le projet **Gather** utilise un pipeline d'**Intégration Continue (CI)** et de **Déploiement Continu (CD)** basé sur **GitHub Actions**.
Ce pipeline garantit la qualité du code, l'automatisation du déploiement et la fiabilité du processus de mise en production.

### 🔄 Workflow automatisé (Dev → Main → Production)

**Processus simplifié en une seule action :**

1. **Push sur `dev`** → Déclenche automatiquement :
   - Tests backend (Jest + ESLint)
   - Tests frontend (Build + ESLint)
   - Si tous les tests passent → **Merge automatique** de `dev` vers `main`
   - Le merge déclenche le **déploiement automatique** en production

**Aucune intervention manuelle nécessaire !** Juste un `git push origin dev` suffit.

### ⚙️ Workflows disponibles

**1. CD - Deploy to Production (`.github/workflows/deploy.yml`)** ⭐
- **Déclenchement :** `push` sur `dev` ou manuel via GitHub Actions
- **Étapes automatiques (sur push dev) :**
  1. **Tests Backend** : ESLint + Jest (mongodb-memory-server)
  2. **Tests Frontend** : ESLint + Build (Vite)
  3. **Auto-merge** : Si les tests passent, merge automatique `dev` → `main`
  4. **Déploiement** : Connexion au serveur, pull du code, exécution de `./scripts/prod.sh`
  5. **Vérification** : Health checks sur le backend et le frontend
- **Mode manuel** : Permet de redéployer en cas d'urgence sans passer par les tests

**2. CI - Tests (`.github/workflows/ci.yml`)**
- **Déclenchement :** `pull request` vers `main` ou `dev`
- **Vérifications** :
  - Linting du frontend et du backend (ESLint)
  - Tests backend (Jest avec `mongodb-memory-server`)
  - Build du frontend (Vite)

### 🖥️ Prérequis serveur
Le serveur de production doit disposer de :
- Git, Docker et Docker Compose installés
- Accès SSH configuré avec clé privée
- Projet cloné à l'emplacement défini dans `PROJECT_PATH`
- GitHub Actions self-hosted runner configuré

### 🔐 Secrets GitHub requis
- `BACKEND_PORT`, `MONGO_URI`, `JWT_SECRET`
- `DOMAIN`, `API_DOMAIN`, `MAIL`
- `VITE_BACKEND_PORT`, `VITE_FRONTEND_PORT`, `VITE_API_DOMAIN`

### 🧾 Script de production (`scripts/prod.sh`)
Le script gère :
1. Le démarrage initial des services avec Docker Compose  
2. La génération des certificats SSL via Certbot  
3. Le basculement de la configuration Nginx vers HTTPS  
4. Le redémarrage des conteneurs pour appliquer la configuration sécurisée  

### 🧾 Script de développement (`scripts/dev.sh`)
Ce script est utilisé pour développer sur sa machine et non sur serveur, avec le backend et le frontend en http simple.