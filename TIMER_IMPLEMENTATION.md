# Implémentation du Timer de Session de Lecture

## 🎯 Fonctionnalités implémentées

### Timer en temps réel
- ✅ Décompte en temps réel visible dans la modale
- ✅ Affichage du temps actuel sur les cartes de livres
- ✅ Un seul timer actif par livre à la fois
- ✅ Gestion automatique des sessions multiples

### Logique côté Supabase
- ✅ Fonctions stockées pour gérer les sessions uniques
- ✅ Triggers pour empêcher les sessions multiples
- ✅ Politiques de sécurité RLS
- ✅ Nettoyage automatique des sessions anciennes

## 🔧 Installation et Configuration

### 1. Appliquer les migrations Supabase

Pour activer le système de timer, vous devez exécuter les migrations SQL dans votre base de données Supabase :

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Créez une nouvelle requête
4. Copiez le contenu du fichier `supabase-migrations.sql`
5. Exécutez la requête

### 2. Fonctions créées

Les migrations créent les fonctions suivantes :

#### `start_reading_session(p_book_id, p_user_id)`
- Démarre une nouvelle session de lecture
- Arrête automatiquement toute session active existante pour le même livre
- Retourne l'ID de la nouvelle session

#### `stop_reading_session(p_session_id, p_user_id, p_notes, p_pages_read)`
- Arrête une session active
- Calcule automatiquement la durée
- Met à jour les notes et pages lues
- Retourne true/false selon le succès

#### `get_active_session(p_book_id, p_user_id)`
- Récupère la session active pour un livre donné
- Calcule la durée actuelle en temps réel

#### `get_user_active_sessions(p_user_id)`
- Récupère toutes les sessions actives d'un utilisateur
- Utilisé pour initialiser les timers au chargement

#### `cleanup_stale_sessions()`
- Nettoie les sessions actives depuis plus de 24h
- Peut être appelée périodiquement

### 3. Triggers et contraintes

- **Trigger `prevent_multiple_sessions_trigger`** : Empêche la création manuelle de sessions multiples
- **Index optimisé** : Améliore les performances des requêtes sur les sessions actives

## 🎮 Utilisation

### Démarrer une session
```typescript
const { startTimer } = useTimer();
await startTimer(bookId);
```

### Arrêter une session
```typescript
const { stopTimer } = useTimer();
await stopTimer(bookId, notes, pagesRead);
```

### Vérifier l'état d'un timer
```typescript
const { isTimerActive, getFormattedTime } = useTimer();
const isActive = isTimerActive(bookId);
const currentTime = getFormattedTime(bookId); // Format: "HH:MM:SS"
```

## 🔍 Hooks utilisés

### `useTimer`
Hook principal pour la gestion des timers :
- Gère l'état des timers actifs
- Met à jour le temps en temps réel (toutes les secondes)
- Interface avec les fonctions Supabase

### `useReadingSessions` (mis à jour)
Hook pour la gestion des sessions :
- Utilise maintenant les fonctions Supabase
- Maintient la compatibilité avec l'interface existante

## 📱 Interface utilisateur

### BookCard
- Affiche un indicateur visuel pour les sessions actives
- Montre le temps écoulé en temps réel dans la barre verte
- Bouton timer animé pour les sessions actives

### ReadingTimer (Modal)
- Timer en temps réel au format HH:MM:SS
- Animation visuelle pour le temps qui passe
- États de chargement pour les actions
- Gestion d'erreurs intégrée

## 🛡️ Sécurité

- **Row Level Security (RLS)** : Chaque utilisateur ne peut voir que ses sessions
- **Fonctions sécurisées** : Utilisation de `SECURITY DEFINER`
- **Validation** : Vérification des permissions dans chaque fonction

## 🔧 Dépannage

### Problèmes courants

1. **Timer ne démarre pas**
   - Vérifiez que les migrations sont appliquées
   - Vérifiez la connexion Supabase
   - Consultez la console pour les erreurs

2. **Sessions multiples**
   - Le système empêche automatiquement les sessions multiples
   - Si le problème persiste, exécutez `cleanup_stale_sessions()`

3. **Synchronisation entre onglets**
   - Le timer se synchronise automatiquement au chargement
   - Rechargez la page pour forcer la synchronisation

### Logs utiles

```sql
-- Vérifier les sessions actives
SELECT * FROM reading_sessions WHERE is_active = true;

-- Nettoyer les sessions anciennes
SELECT cleanup_stale_sessions();

-- Vérifier les sessions d'un utilisateur
SELECT * FROM get_user_active_sessions('user-id-here');
```

## ⚡ Performance

- Index optimisé pour les requêtes sur les sessions actives
- Mise à jour du timer uniquement côté client (pas de requêtes constantes)
- Chargement initial optimisé des sessions actives

## 🚀 Fonctionnalités futures possibles

- Notifications push pour les sessions longues
- Statistiques avancées de lecture
- Objectifs de temps de lecture quotidiens
- Export des données de sessions
