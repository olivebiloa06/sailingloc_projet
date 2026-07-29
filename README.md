# SailingLoc 🌊

> Marketplace de location de bateaux entre particuliers 
> Agence **Pandawan** · École Numérique de Paris · Promotion 2025–2026

---

## Table des matières

- [Présentation](#présentation)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Scripts disponibles](#scripts-disponibles)
- [Tests](#tests)
- [Sécurité](#sécurité)
- [Accessibilité](#accessibilité)
- [Structure du projet](#structure-du-projet)
- [Équipe](#équipe)

---

## Présentation

SailingLoc est une marketplace peer-to-peer de location de bateaux entre particuliers. Elle permet aux propriétaires de bateaux de mettre leurs embarcations en location entre deux sorties, et aux locataires de réserver en ligne avec paiement sécurisé, contrat automatique et messagerie temps réel.

**Client :** M. Voisin  
**Soutenance :** 10 -11 septembre 2026  
**Hébergement :** OVH VPS — Gravelines, France

---

## Stack technique

### Backend
| Technologie | Version | Rôle |
|-------------|---------|------|
| Node.js | 20 LTS | Runtime |
| Express | 5 | Framework API REST |
| PostgreSQL | 16 | Base de données relationnelle |
| Sequelize | 6 | ORM |
| Socket.io | 4 | Messagerie temps réel |
| JWT | — | Authentification (access + refresh tokens) |
| Stripe | — | Paiement par carte |
| PayPal | — | Paiement alternatif |
| PDFKit | — | Génération de contrats PDF |
| Nodemailer | — | Emails transactionnels |
| Multer | — | Upload de fichiers |
| Helmet | — | Sécurité HTTP |
| bcryptjs | — | Hashage des mots de passe |

### Frontend
| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 19 | UI |
| Vite | — | Bundler |
| Tailwind CSS | v4 | Styles |
| React Router | v6 | Navigation |
| Axios | — | Requêtes HTTP |

### Tests
| Outil | Usage |
|-------|-------|
| Jest | Tests unitaires (99 tests) |
| Cypress | Tests E2E (3 parcours) |
| JMeter | Tests de charge (500 users, SLA < 800ms) |
| GitHub Actions | CI/CD pipeline |

---

## Architecture

```
sailingloc_projet/
├── backend/                    # API REST Express
│   ├── src/
│   │   ├── controllers/        # Logique métier
│   │   ├── models/             # Modèles Sequelize
│   │   ├── routes/             # Routes API
│   │   ├── middlewares/        # Auth, RBAC, upload
│   │   ├── services/           # Stripe, PayPal, Email, PDF
│   │   └── server.js           # Point d'entrée
│   └── uploads/                # Fichiers uploadés (non versionnés)
├── frontend/                   # SPA React
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   ├── pages/              # Pages de l'application
│   │   ├── context/            # AuthContext, LanguageCurrencyContext
│   │   ├── hooks/              # useAuth, useInView
│   │   ├── services/           # api.js (Axios)
│   │   └── assets/             # Images locales
│   └── cypress/                # Tests E2E
├── jmeter/                     # Plan de charge JMeter
├── .github/workflows/          # GitHub Actions CI
└── db/                         # Script SQL
```

---

## Fonctionnalités

### Visiteur non connecté
- Parcourir et filtrer les bateaux (destination, dates, type, capacité, prix, skipper)
- Consulter les fiches détaillées avec avis et disponibilités
- Page Inspiration (articles CMS)
- Page À propos, pages légales (9 pages footer)

### Locataire
- Inscription / Connexion avec œil afficher/masquer le mot de passe
- Tunnel de réservation complet
- Paiement sécurisé Stripe + PayPal
- Contrat PDF généré automatiquement après paiement
- Email de confirmation avec contrat en pièce jointe
- Historique des réservations avec téléchargement des contrats
- Laisser un avis après une réservation confirmée
- Messagerie temps réel avec les propriétaires
- Gestion des favoris (♥)
- Sélecteur de langue (FR/EN) et devise (5 devises)

### Propriétaire
- Publication d'annonce avec photos
- Gestion des disponibilités
- Acceptation / refus des demandes de réservation
- Tableau de bord : KPIs revenus, commission, réservations
- Upload de documents (pièce d'identité, assurance, permis)
- Blocage automatique de publication si documents non validés

### Administrateur
- Validation des documents propriétaires (aperçu + téléchargement)
- Gestion des utilisateurs (changer de rôle, supprimer avec cascade)
- CMS articles Inspiration (créer, modifier, publier, dépublier)
- Supervision des transactions et paiements
- Modération des avis
- KPIs globaux (CA, commission, utilisateurs, réservations)

### Technique
- Messagerie temps réel Socket.io avec indicateur "en train d'écrire..."
- Breadcrumb automatique sur toutes les pages
- Bannière cookies
- Menu "Découvrir" avec dropdown multi-sections
- Accessibilité WCAG 2.1 (aria-label, aria-expanded, focus:ring, role="dialog", lang="fr")

---

## Installation

### Prérequis
- Node.js 20+
- PostgreSQL 16
- Java 21 (pour JMeter)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Remplir les variables
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application est disponible sur `http://localhost:5173`  
L'API tourne sur `http://localhost:5000`

---

## Variables d'environnement

Créer un fichier `backend/.env` :

```env
PORT=5000
NODE_ENV=development

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sailingloc_dev
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

# JWT
JWT_SECRET=votre_secret_jwt
JWT_REFRESH_SECRET=votre_secret_refresh

# Frontend
FRONTEND_URL=http://localhost:5173

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Email (Nodemailer)
EMAIL_USER=votre@gmail.com
EMAIL_PASS=mot_de_passe_application
```

⚠️ **Ne jamais commiter le fichier `.env`** — il est dans `.gitignore`.

---

## Scripts disponibles

### Backend
```bash
npm run dev          # Démarre en mode développement (nodemon)
npm start            # Démarre en production
npm test             # Lance les tests Jest
npm run test:ci      # Tests Jest avec rapport de couverture (CI)
npm run seed         # Remplit la base avec des données de démo
```

### Frontend
```bash
npm run dev          # Démarre Vite en développement
npm run build        # Build de production
npm run preview      # Prévisualise le build
npx cypress open     # Ouvre l'interface Cypress
npx cypress run      # Lance les tests E2E en headless
```

---

## Tests

### Tests unitaires Jest — 99 tests ✅

```bash
cd backend && npm test
```

**Couverture :**
- `booking.test.js` — Calcul montant, commission 10%, validation dates et voyageurs
- `auth.test.js` — Génération JWT, vérification, expiration, bcrypt
- `validation.test.js` — Email, prix, capacité, type bateau, chevauchement de réservations

### Tests E2E Cypress — 3 parcours

```bash
cd frontend && npx cypress run
```

- **Parcours 1** — Réservation complète (visiteur → connexion → réservation → confirmation)
- **Parcours 2** — Publication d'un bateau (propriétaire → formulaire → liste publique)
- **Parcours 3** — Gestion des disponibilités (ajout période → visible sur la fiche)

### Tests de charge JMeter

Plan de test : `jmeter/sailingloc-load-test.jmx`

- **500 utilisateurs simultanés**
- **Ramp-up : 60 secondes**
- **SLA : temps de réponse < 800ms**
- **Taux d'erreur cible : < 1%**

```bash
# Lancer depuis le dossier JMeter
jmeter -n -t sailingloc-load-test.jmx -l results/resultats.jtl -e -o results/rapport-html
```

### CI/CD GitHub Actions

Pipeline déclenché sur push vers `dev`, `main` et `feature/**` :
- Installation des dépendances
- Exécution des tests Jest
- Build frontend (vérification compilation)

---

## Sécurité

| Mesure | Implémentation |
|--------|---------------|
| Authentification | JWT access token (15 min) + refresh token HttpOnly cookie (7j) |
| Autorisation | RBAC 3 rôles : `locataire`, `proprietaire`, `admin` |
| Mots de passe | bcrypt (salt factor 10) |
| Rate limiting | 200 req/15min (dev) · 5 req/15min (prod) |
| En-têtes HTTP | Helmet avec `crossOriginResourcePolicy: cross-origin` |
| CORS | Restreint à `FRONTEND_URL` avec `credentials: true` |
| Documents | Magic bytes validation · Jamais servis en statique |
| Injection SQL | Protection via ORM Sequelize (requêtes paramétrées) |
| XSS | React échappe automatiquement · Helmet CSP |

---

## Accessibilité

Le projet respecte les bonnes pratiques **WCAG 2.1** :

- `lang="fr"` sur la balise `<html>`
- `aria-label` sur tous les boutons icônes (favoris, œil mot de passe, recherche...)
- `aria-expanded` + `aria-haspopup` sur les dropdowns
- `role="dialog"` + `aria-modal` + focus trap sur les modales
- `role="banner"`, `role="search"`, `role="menu"` sur les éléments structurants
- `focus:ring` visible sur tous les éléments interactifs (navigation clavier)
- Fermeture des modales et dropdowns avec la touche `Escape`
- `aria-live="polite"` sur les messages de chargement
- `aria-hidden="true"` sur les SVG décoratifs

---

## Modèles de données

```
User ──────────────── Boat
  │                     │
  ├── Booking ──────────┤
  │       │             │
  │   Contract      Availability
  │       │
  │   Payment
  │
  ├── Document
  ├── Review ────────── Boat
  ├── Favorite ──────── Boat
  ├── RefreshToken
  └── Conversation ──── Message
```

**13 modèles :** User, Boat, Availability, Booking, Payment, Contract, Review, Document, Article, Favorite, RefreshToken, Conversation, Message

---

## Équipe

| Membre | Rôle |
|--------|------|
| **Olive Biloa Ombolo** | Lead Developer · Chef de Projet Digital |
| **Massylia Sahi** | Développeuse Full-Stack |

**Agence :** Pandawan  
**École :** Digital School of Paris (DSP), Vincennes  
**Formation :** Master 1 Chef de Projet Digital / Développeuse Web Full-Stack

---

## Licence

Projet académique — tous droits réservés © 2026 Agence Pandawan