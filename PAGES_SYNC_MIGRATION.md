# Migration : Synchronisation automatique des pages lues

## 🎯 Objectif

Cette migration ajoute une **synchronisation automatique** entre les sessions de lecture et les livres. Quand vous ajoutez une session avec des pages lues, le nombre de pages du livre est automatiquement mis à jour, ainsi que le progrès et le statut.

## 📋 Fonctionnalités ajoutées

### ⚡ **Synchronisation automatique**
- **Trigger SQL** : Met à jour automatiquement `current_page` du livre quand une session est créée/modifiée
- **Calcul du progrès** : Recalcule automatiquement le pourcentage (0-100%) basé sur `current_page/total_pages`
- **Changement de statut** :
  - `'toread'` → `'reading'` quand on commence à lire
  - → `'completed'` quand on atteint 100%
- **Date de completion** : Définit automatiquement `date_completed`

### 🔄 **Synchronisation Frontend-Backend**
- **Hook combiné** : `useBooksWithSessions` synchronise automatiquement les données
- **Rafraîchissement intelligent** : L'interface se met à jour après chaque modification de session
- **Gestion des erreurs** : Robuste en cas de problème réseau

### 🛠️ **Fonctions utilitaires**
- `recalculate_book_pages(book_id, user_id)` : Recalcule un livre spécifique
- `recalculate_all_books_pages(user_id)` : Recalcule tous les livres d'un utilisateur

## 🚀 Instructions d'installation

### 1. **Appliquer la migration SQL**

1. **Ouvrir Supabase** → "SQL Editor" → "New query"
2. **Copier-coller** le contenu du fichier `supabase-pages-sync.sql`
3. **Cliquer "Run"** pour exécuter la migration

### 2. **Vérifier l'installation**

La migration ajoute automatiquement :
- ✅ Fonction `sync_book_pages_read()`
- ✅ Trigger `sync_book_pages_trigger`
- ✅ Fonctions utilitaires de recalcul
- ✅ Index optimisé

### 3. **Test de fonctionnement**

1. **Démarrer une session de lecture** sur un livre
2. **Arrêter la session** en spécifiant des pages lues (ex: 25 pages)
3. **Vérifier** que le livre se met automatiquement à jour avec :
   - `current_page` augmentée
   - `progress` recalculé
   - `status` changé si nécessaire

## 🔍 **Exemple de fonctionnement**

### Avant
```sql
-- Livre initial
{ id: "livre-1", current_page: 0, progress: 0, status: "toread", total_pages: 300 }
```

### Après ajout d'une session avec 25 pages lues
```sql
-- Livre mis à jour automatiquement
{ id: "livre-1", current_page: 25, progress: 8, status: "reading", total_pages: 300 }
```

### Après ajout d'une autre session avec 275 pages lues
```sql
-- Livre terminé automatiquement
{ id: "livre-1", current_page: 300, progress: 100, status: "completed", total_pages: 300, date_completed: "2024-..." }
```

## 🐛 **Résolution de problèmes**

### Problème : Les livres ne se mettent pas à jour
1. **Vérifier** que la migration SQL a été appliquée correctement
2. **Vérifier** les logs de la console pour des erreurs
3. **Rafraîchir** la page pour recharger les données

### Problème : Données incohérentes
1. **Utiliser** la fonction de recalcul manuel :
```sql
-- Pour un livre spécifique
SELECT recalculate_book_pages('uuid-du-livre', 'uuid-utilisateur');

-- Pour tous les livres de l'utilisateur
SELECT recalculate_all_books_pages('uuid-utilisateur');
```

### Problème : Performance lente
1. **Vérifier** que l'index `idx_reading_sessions_book_pages` existe
2. **Consulter** les requêtes lentes dans Supabase

## 📊 **Impact sur les performances**

- ✅ **Trigger léger** : Exécution rapide lors des modifications
- ✅ **Index optimisé** : Requêtes de synchronisation rapides
- ✅ **Pas de polling** : Mise à jour seulement quand nécessaire
- ✅ **Batch updates** : Efficace même avec beaucoup de sessions

## 🔄 **Compatibilité**

- ✅ **Données existantes** : Les livres existants continuent de fonctionner
- ✅ **Sessions existantes** : Comptabilisées dans les calculs
- ✅ **Migration douce** : Aucune perte de données
- ✅ **Rollback possible** : Les triggers peuvent être supprimés si nécessaire

## 🎉 **Résultat**

Après cette migration, votre application aura une **synchronisation parfaite** entre les sessions de lecture et les livres, avec une **expérience utilisateur fluide** et des **données toujours cohérentes** !
