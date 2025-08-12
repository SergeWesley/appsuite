# Migration vers Supabase - Guide complet

## 🎯 Objectif
Ce guide vous accompagne dans la migration de votre application Booker depuis localStorage vers Supabase pour une gestion de données robuste et synchronisée.

## 📋 Prérequis
1. Un compte Supabase (gratuit sur [https://supabase.com](https://supabase.com))
2. Node.js et npm installés
3. L'application Booker actuelle

## 🚀 Étapes de migration

### 1. Configuration Supabase

#### A. Créer un projet Supabase
1. Connectez-vous à [Supabase](https://supabase.com)
2. Cliquez sur "New Project"
3. Choisissez votre organisation
4. Donnez un nom à votre projet (ex: "booker-app")
5. Créez un mot de passe pour votre base de données
6. Sélectionnez une région proche de vos utilisateurs
7. Cliquez sur "Create new project"

#### B. Récupérer les clés d'API
1. Dans votre tableau de bord Supabase, allez dans "Settings" > "API"
2. Copiez l'URL du projet (Project URL)
3. Copiez la clé publique anonyme (anon public key)

#### C. Configurer les variables d'environnement
1. Créez un fichier `.env.local` à la racine du projet
2. Ajoutez vos clés Supabase :
```bash
NEXT_PUBLIC_SUPABASE_URL=votre_url_projet_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

### 2. Création de la base de données

#### A. Exécuter le script SQL
1. Dans Supabase, allez dans "SQL Editor"
2. Cliquez sur "New query"
3. Copiez et collez le contenu du fichier `supabase-schema.sql`
4. Cliquez sur "Run" pour exécuter le script

#### B. Vérifier la création des tables
1. Allez dans "Table Editor"
2. Vérifiez que les tables `books` et `reading_sessions` ont été créées
3. Vérifiez que les politiques RLS (Row Level Security) sont actives

### 3. Configuration de l'authentification

#### A. Configurer l'authentification anonyme
1. Dans Supabase, allez dans "Authentication" > "Settings"
2. Activez "Enable anonymous sign-ins" si vous voulez permettre l'utilisation sans compte
3. Ou configurez d'autres méthodes d'authentification selon vos besoins

#### B. Politique de sécurité
- Les données sont automatiquement isolées par utilisateur grâce aux politiques RLS
- Chaque utilisateur ne peut voir que ses propres livres et sessions

### 4. Migration des données existantes

#### A. Migration automatique
L'application migreara automatiquement vos données depuis localStorage vers Supabase lors du premier lancement :

1. Les livres stockés localement seront transférés dans Supabase
2. Les sessions de lecture seront également migrées
3. Les données localStorage seront supprimées après migration réussie

#### B. Vérification de la migration
1. Lancez l'application avec `npm run dev`
2. Vérifiez que vos livres apparaissent correctement
3. Testez l'ajout/modification/suppression de livres
4. Testez le système de timer de lecture

## 🔧 Fonctionnalités ajoutées

### Synchronisation multi-appareils
- Vos données sont maintenant synchronisées entre tous vos appareils
- Connexion automatique pour une expérience fluide

### Sauvegarde automatique
- Plus de risque de perte de données
- Sauvegarde en temps réel dans le cloud

### Performance améliorée
- Chargement optimisé des données
- Gestion d'erreurs robuste

## 🛠️ Résolution de problèmes

### Erreur "Invalid API key"
- Vérifiez que vos variables d'environnement sont correctement configurées
- Redémarrez le serveur de développement après modification du `.env.local`

### Erreur "Row Level Security policy violation"
- Vérifiez que l'authentification fonctionne
- Vérifiez que les politiques RLS sont correctement configurées

### Migration qui ne se lance pas
- Vérifiez que votre projet Supabase est bien actif
- Vérifiez la connectivité réseau
- Consultez la console développeur pour plus de détails

## 📞 Support

### Intégration MCP Supabase
Pour une gestion facilitée de votre base de données Supabase, vous pouvez connecter l'intégration MCP Supabase qui vous permettra de :
- Gérer vos tables et données directement
- Configurer l'authentification
- Monitorer les performances
- Créer des sauvegardes

### Ressources utiles
- [Documentation Supabase](https://supabase.com/docs)
- [Guide Next.js + Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Communauté Supabase](https://supabase.com/docs/guides/resources#community)

## ✅ Checklist de migration

- [ ] Projet Supabase créé
- [ ] Variables d'environnement configurées
- [ ] Script SQL exécuté
- [ ] Tables créées et vérifiées
- [ ] Authentification configurée
- [ ] Application redémarrée
- [ ] Migration des données vérifiée
- [ ] Tests fonctionnels effectués

Une fois toutes ces étapes complétées, votre application Booker sera entièrement migrée vers Supabase ! 🎉
