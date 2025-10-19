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

### 🔄 Workflow automatisé (Dev → Tests → PR → Main → Production)

**Processus simplifié en une seule action :**

1. **Push sur `dev`** → Déclenche automatiquement :
   - ✅ Tests backend (Jest + ESLint)
   - ✅ Tests frontend (Build + ESLint)
   - ✅ Si tous les tests passent → **Création automatique d'une PR** `dev` → `main`
   - ✅ **Auto-merge** de la PR (fusion automatique)
   - ✅ Le merge déclenche le **déploiement automatique** en production
   - ✅ Health checks pour vérifier que le déploiement fonctionne

**Aucune intervention manuelle nécessaire !** Juste un `git push origin dev` suffit.

### ⚙️ Architecture des Workflows

**3 fichiers, rôles distincts :**

| Fichier | Déclenchement | Rôle |
|---------|---------------|------|
| **`tests.yml`** | Appelé par d'autres workflows | Workflow réutilisable : ESLint + Jest (backend), ESLint + Build (frontend) |
| **`ci.yml`** | Pull Request vers `main`/`dev` | Validation avant merge : appelle `tests.yml` |
| **`deploy.yml`**  | Push sur `dev` ou manuel | Pipeline complet : Tests → PR auto → Merge → Deploy → Verify |

### 🔄 Pipeline de Déploiement (`deploy.yml`)

**4 jobs séquentiels :**

1. **Tests** → Appelle `tests.yml` (backend + frontend)
2. **Create PR** → Crée/met à jour PR `dev → main` + active auto-merge
3. **Deploy** (self-hosted) → Sync code (`git reset --hard`) + génère `.env` + exécute `prod.sh`
4. **Verify** → Health checks HTTPS (backend + frontend)

**En pratique :**
```bash
git push origin dev  # Déclenche tout automatiquement
```

### 🔒 SSL/HTTPS avec Certbot

Le déploiement gère automatiquement les certificats SSL via Let's Encrypt :

- **Première exécution** : Génération des certificats SSL
- **Config Nginx optimisée** :
  - Modificateur `^~` pour donner priorité absolue au challenge Certbot
  - Redirection HTTP → HTTPS après génération des certificats
- **Renouvellement automatique** : `--keep-until-expiring` (pas de rate-limit)

**Mécanisme de déploiement** (`scripts/prod.sh`) :
1. Création des dossiers `certbot/www/.well-known/acme-challenge/`
2. Démarrage en HTTP avec les configs `*.http`
3. Redémarrage de Nginx pour monter correctement les volumes
4. Exécution de Certbot pour générer les certificats
5. Basculement vers HTTPS avec les configs `*.https`
6. Redémarrage final de Nginx

### 🖥️ Prérequis serveur
Le serveur de production doit disposer de :
- **Git, Docker et Docker Compose** installés
- **GitHub Actions self-hosted runner** configuré
- **Ports 80 et 443** ouverts pour HTTP/HTTPS
- **Domaines configurés** pointant vers le serveur

### 🔐 Secrets GitHub requis
- `BACKEND_PORT`, `MONGO_URI`, `JWT_SECRET`
- `DOMAIN` (ex: gather.example.com)
- `API_DOMAIN` (ex: api.gather.example.com)
- `MAIL` (pour Let's Encrypt)
- `VITE_BACKEND_PORT`, `VITE_FRONTEND_PORT`, `VITE_API_DOMAIN`
- `GATHER_TOKEN` (Personal Access Token avec permissions repo + pull requests)

### 🧾 Script de production (`scripts/prod.sh`)
Le script gère :
1. Le démarrage initial des services avec Docker Compose  
2. La génération des certificats SSL via Certbot  
3. Le basculement de la configuration Nginx vers HTTPS  
4. Le redémarrage des conteneurs pour appliquer la configuration sécurisée  

### 🧾 Script de développement (`scripts/dev.sh`)
Ce script est utilisé pour développer sur sa machine et non sur serveur, avec le backend et le frontend en http simple.