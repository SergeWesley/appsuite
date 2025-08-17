# Migration des séances récurrentes

Ce guide explique comment appliquer les migrations SQL nécessaires pour ajouter le support des séances récurrentes dans votre base de données Supabase.

## ⚠️ Important - Sauvegarde

**Faites une sauvegarde de votre base de données avant d'exécuter ces migrations !**

## 🚀 Installation

### Option 1: Via l'interface Supabase Dashboard

1. Connectez-vous à votre [dashboard Supabase](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Créez une nouvelle requête
5. Copiez-collez le contenu du fichier `migrations/add_workout_templates.sql`
6. Exécutez la requête

### Option 2: Via Supabase CLI

```bash
# Si vous utilisez Supabase CLI
supabase db push

# Ou exécutez directement le fichier de migration
psql -h your-db-host -U postgres -d postgres -f migrations/add_workout_templates.sql
```

## 📋 Ce qui va ��tre créé

### Nouvelles tables:

1. **`workout_templates`** - Stocke les modèles de séances récurrentes
   - Configuration de récurrence (quotidienne, hebdomadaire, mensuelle)
   - Paramètres d'intervalle et jours de la semaine
   - Dates de début/fin et nombre max d'occurrences

2. **`workout_template_exercises`** - Exercices associés aux templates
   - Liaison avec les exercices existants
   - Paramètres spécifiques (séries, répétitions, poids, etc.)

### Modifications des tables existantes:

1. **`workout_sessions`** - Ajout de deux nouvelles colonnes:
   - `template_id` - Référence vers le template (optionnel)
   - `is_from_template` - Indique si la séance vient d'un template

### Fonctionnalités ajoutées:

- **Index** pour optimiser les performances
- **Politiques RLS** pour la sécurité des données
- **Triggers** pour la mise à jour automatique des timestamps
- **Vue** `workout_templates_with_exercises` pour simplifier les requêtes
- **Fonction** `get_template_next_occurrences()` pour générer les occurrences

## 🔧 Vérification de l'installation

Après l'exécution, vérifiez que tout fonctionne:

```sql
-- Vérifier que les tables ont été créées
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('workout_templates', 'workout_template_exercises');

-- Vérifier les nouvelles colonnes dans workout_sessions
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'workout_sessions' 
AND column_name IN ('template_id', 'is_from_template');

-- Tester la vue
SELECT * FROM workout_templates_with_exercises LIMIT 1;
```

## 📝 Utilisation

Une fois les migrations appliquées, vous pouvez:

1. **Créer des templates** de séances récurrentes via l'interface
2. **Générer automatiquement** les séances selon la récurrence définie
3. **Visualiser** dans le calendrier les séances planifiées vs réalisées
4. **Modifier** ou **désactiver** les templates selon vos besoins

## 🔄 Migration inverse (rollback)

Si vous devez annuler ces changements:

```sql
-- ⚠️ ATTENTION: Ceci supprimera toutes les données des templates !

-- Supprimer les nouvelles tables
DROP TABLE IF EXISTS workout_template_exercises CASCADE;
DROP TABLE IF EXISTS workout_templates CASCADE;

-- Supprimer les colonnes ajoutées (optionnel, peut casser l'app)
ALTER TABLE workout_sessions 
DROP COLUMN IF EXISTS template_id,
DROP COLUMN IF EXISTS is_from_template;

-- Supprimer la vue et la fonction
DROP VIEW IF EXISTS workout_templates_with_exercises;
DROP FUNCTION IF EXISTS get_template_next_occurrences;
```

## 📞 Support

Si vous rencontrez des problèmes lors de l'installation:

1. Vérifiez que votre utilisateur a les permissions nécessaires
2. Consultez les logs d'erreur de Supabase
3. Assurez-vous que les tables `exercises` et `workout_sessions` existent déjà
4. Contactez l'équipe de développement si nécessaire

## 🎯 Prochaines étapes

Après l'installation des migrations:

1. L'application peut maintenant gérer les séances récurrentes
2. Les utilisateurs peuvent créer des templates via l'interface
3. Le calendrier affichera les séances planifiées et réalisées
4. Les statistiques incluront les données de récurrence
