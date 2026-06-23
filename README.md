# AppSuite - Votre Écosystème Personnel

**AppSuite** est un projet complet de type monorepo / application "tout-en-un" qui regroupe plusieurs outils essentiels du quotidien sous une seule et même interface moderne, fluide et sécurisée.

Construite avec une stack technique de pointe, cette plateforme offre une expérience utilisateur premium grâce à des animations soignées (Framer Motion) et une interface intuitive.

## Les Modules de la Suite

L'application est divisée en plusieurs "mini-apps" spécialisées :

- **Booker** : Gestionnaire complet pour votre bibliothèque. Suivez vos lectures en cours, vos statistiques, et archivez vos livres préférés.
- **Cooker** : Votre carnet de recettes personnel. (Gestion et suivi de recettes).
- **Notes** : Une application de prise de notes structurée avec système de dossiers pour organiser vos idées et documents importants.
- **Spender** : Gardez le contrôle sur votre budget ! Gestionnaire de dépenses et d'abonnements récurrents avec calcul automatique du coût mensuel.
- **Tracker** : Votre compagnon sportif. Enregistrez vos séances, suivez vos exercices, et analysez vos performances.
- **Watcher** : Suivi de films et séries. Ne perdez plus le fil de ce que vous regardez.
- **Browser** : Organisez vos sites et applications web favoris au même endroit pour un accès rapide.
- **Dashboard** : Un tableau de bord central pour naviguer facilement entre tous vos outils.

## Fonctionnalités Principales

- **Authentification Unifiée** : Un seul compte pour accéder à l'ensemble des modules (propulsé par Supabase).
- **Navigation Transversale** : Passez d'une app à l'autre en un clic via un menu de navigation global.
- **Design Cohérent & Premium** : UI/UX harmonisée, utilisant les composants TailwindCSS et Headless UI.
- **Animations Fluides** : Transitions douces et micro-interactions via Framer Motion.
- **Cloud Sync en Temps Réel** : Données synchronisées instantanément sur tous vos appareils grâce à la base de données Supabase.
- **Sécurité RLS (Row Level Security)** : Vos données sont strictement isolées et sécurisées.

## Technologies Utilisées

Ce projet repose sur une stack moderne et performante :

- **Frontend** : Next.js 15 (App Router), React 19, TypeScript
- **Styling** : Tailwind CSS v4, Headless UI, Framer Motion
- **Icônes** : Lucide React
- **Backend & Base de données** : Supabase (PostgreSQL, Auth, Storage)
- **Validation** : Zod
- **Formulaires & Tables** : TanStack React Table

## Installation et Lancement Rapide

1. **Cloner le projet**
   ```bash
   git clone <votre-repo>
   cd appsuite
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   Créez un fichier `.env.local` à la racine du projet et ajoutez vos clés Supabase :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Ouvrir l'application**
   Rendez-vous sur [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du Projet

```
src/
├── app/                  # Routeur Next.js (Chaque dossier = un module)
│   ├── auth/             # Pages d'authentification
│   ├── booker/           # Module Bibliothèque
│   ├── cooker/           # Module Recettes
│   ├── dashboard/        # Tableau de bord principal
│   ├── notes/            # Module Prise de notes
│   ├── spender/          # Module Dépenses/Abonnements
│   ├── tracker/          # Module Sport/Fitness
│   ├── watcher/          # Module Films/Séries
│   └── browser/          # Module Raccourcis Web
├── components/           # Composants React partagés et spécifiques par module
├── hooks/                # Custom hooks (Logique métier par module)
├── types/                # Définitions TypeScript
└── lib/                  # Configurations utilitaires (Supabase, etc.)
```

## Scripts NPM Disponibles

- `npm run dev` : Lance l'environnement de développement.
- `npm run build` : Compile l'application pour la production.
- `npm run start` : Démarre l'application compilée.
- `npm run lint` : Vérifie la qualité du code (ESLint).
- `npm run format` : Formate le code (Prettier).
- `npm run update-types` : Génère et met à jour les types TypeScript depuis la base Supabase.

---
**AppSuite** - Votre écosystème d'applications personnelles unifié.
