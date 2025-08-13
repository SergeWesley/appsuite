# Guide d'utilisation du Timer de Session de Lecture

## 🎯 Fonctionnalités réalisées

Votre système de timer de session de lecture est maintenant complètement implémenté avec toutes les fonctionnalités demandées :

### ✅ Contraintes respectées
- **Session unique par livre** : Un livre ne peut avoir qu'une seule session active à la fois
- **Timer unique par session** : Chaque session a son propre timer
- **Arrêt automatique** : Quand on arrête le timer, la session se termine
- **Logique Supabase** : Fonctions stockées, politiques, triggers côté base de données
- **Interface en temps réel** : Timer visible dans la modale avec décompte en temps réel

## 🚀 Installation

### 1. Appliquer les migrations Supabase

**OBLIGATOIRE** : Avant d'utiliser le système, vous devez appliquer les migrations :

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Créez une nouvelle requête
4. Copiez-collez le contenu complet du fichier `supabase-migrations.sql`
5. Exécutez la requête

### 2. Variables d'environnement

Assurez-vous que vos variables Supabase sont configurées dans `.env.local` :

```bash
NEXT_PUBLIC_SUPABASE_URL=votre_url_projet_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

## 📱 Utilisation

### Interface utilisateur

#### BookCard (Cartes de livres)
- **Indicateur visuel** : Barre verte en haut pour les sessions actives
- **Temps en temps réel** : Affichage du temps écoulé sur la barre
- **Bouton timer animé** : Icône timer qui pulse pour les sessions actives

#### ReadingTimer (Modale)
- **Timer en temps réel** : Format HH:MM:SS qui se met à jour chaque seconde
- **Boutons intelligents** : Démarrer/Arrêter avec états de chargement
- **Formulaire d'arrêt** : Notes et pages lues lors de l'arrêt de session
- **Statistiques** : Affichage des stats du livre

### Workflow utilisateur

1. **Démarrer une session** :
   - Cliquer sur l'icône timer dans BookCard
   - Ou ouvrir la modale et cliquer "Démarrer"
   - Le timer commence immédiatement

2. **Session en cours** :
   - Timer visible en temps réel dans la modale
   - Indicateur sur la carte du livre
   - Sessions automatiquement sauvegardées

3. **Arrêter une session** :
   - Cliquer "Arrêter" dans la modale
   - Remplir optionnellement notes et pages lues
   - Session sauvegardée avec durée exacte

## 🔧 Architecture technique

### Hooks React

#### `useTimer`
```typescript
const {
  isTimerActive,     // Vérifier si un timer est actif
  getFormattedTime,  // Obtenir le temps formaté HH:MM:SS
  startTimer,        // Démarrer un timer
  stopTimer,         // Arrêter un timer
  loading,           // État de chargement
  error              // Gestion d'erreurs
} = useTimer();
```

#### Exemple d'utilisation :
```typescript
// Vérifier l'état
const isActive = isTimerActive(bookId);
const timeDisplay = getFormattedTime(bookId);

// Démarrer
await startTimer(bookId);

// Arrêter avec notes
await stopTimer(bookId, "Très bon chapitre", 25);
```

### Fonctions Supabase

#### Automatiquement gérées
- **Session unique** : `start_reading_session()` arrête automatiquement les sessions existantes
- **Calcul de durée** : `stop_reading_session()` calcule la durée exacte
- **Sécurité** : Policies RLS pour isoler les données par utilisateur
- **Performance** : Index optimisés pour les requêtes rapides

## 🧪 Test du système

### Page de test intégrée

Accédez à `/test-timer` dans votre application pour tester :

1. **Tests de base** :
   - Démarrer/arrêter des timers
   - Vérifier la mise à jour en temps réel
   - Tester les sessions multiples

2. **Tests avancés** :
   - Session unique par livre
   - Synchronisation entre onglets
   - Gestion d'erreurs

### Tests manuels recommandés

1. **Test session unique** :
   - Démarrer un timer sur livre A
   - Démarrer un autre timer sur livre A
   - ✅ Le premier doit s'arrêter automatiquement

2. **Test multi-livres** :
   - Démarrer timer livre A
   - Démarrer timer livre B
   - ✅ Les deux doivent fonctionner en parallèle

3. **Test persistance** :
   - Démarrer un timer
   - Recharger la page
   - ✅ Le timer doit reprendre

## 🛡️ Sécurité et performance

### Sécurité
- **RLS activé** : Chaque utilisateur voit seulement ses données
- **Fonctions sécurisées** : Validation côté serveur
- **Pas d'exposition de données** : API sécurisée

### Performance
- **Index optimisés** : Requêtes rapides sur sessions actives
- **Mise à jour locale** : Timer côté client (pas de requêtes constantes)
- **Chargement intelligent** : Initialisation efficace

## 🔍 Dépannage

### Problèmes courants

1. **Timer ne démarre pas** :
   - Vérifiez les migrations Supabase
   - Consultez la console navigateur
   - Vérifiez la connexion réseau

2. **Sessions ne s'arrêtent pas** :
   - Vérifiez les permissions utilisateur
   - Redémarrez l'application
   - Vérifiez les logs Supabase

3. **Données non sauvegardées** :
   - Vérifiez les politiques RLS
   - Vérifiez l'ID utilisateur
   - Consultez l'onglet "Auth" dans Supabase

### Commandes de maintenance

```sql
-- Nettoyer les sessions anciennes
SELECT cleanup_stale_sessions();

-- Vérifier les sessions actives
SELECT * FROM reading_sessions WHERE is_active = true;

-- Sessions d'un utilisateur
SELECT * FROM get_user_active_sessions('USER_ID');
```

## 🎊 Félicitations !

Votre système de timer est maintenant pleinement opérationnel avec :

- ✅ Timer en temps réel dans la modale
- ✅ Session unique par livre garantie
- ✅ Logique robuste côté Supabase
- ✅ Interface utilisateur intuitive
- ✅ Sécurité et performance optimisées

Le système est prêt pour la production ! 🚀
