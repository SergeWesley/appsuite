# Guide d'implémentation - Programmation de séances

## 📋 Résumé de l'implémentation

J'ai créé une solution complète pour ajouter la programmation et la récurrence aux séances d'entraînement. Voici ce qui a été développé :

### ✅ Ce qui a été créé

1. **Modèle de données complet** (`src/types/workout-program.ts`)
   - Types pour templates, programmes, et séances programmées
   - Support de la récurrence (quotidien, hebdomadaire, mensuel)
   - Gestion des séances générées automatiquement

2. **Types Supabase mis à jour** (`src/types/supabase.ts`)
   - 5 nouvelles tables ajoutées
   - Types TypeScript synchronisés

3. **Formulaire étendu** (`src/components/tracker/WorkoutSessionFormExtended.tsx`)
   - 3 modes : séance unique, programmation, sauvegarde template
   - Interface intuitive pour récurrence
   - Préservation du design existant

4. **Hooks de gestion** 
   - `src/hooks/tracker/useWorkoutTemplates.ts` - Gestion des templates
   - `src/hooks/tracker/useScheduledWorkouts.ts` - Gestion de la programmation

5. **Migrations SQL** (`SUPABASE_MIGRATIONS.sql`)
   - 5 tables avec RLS complet
   - Index optimisés pour les performances
   - Contraintes de données robustes

### 🏗️ Architecture des données

```
workout_templates (modèles de séances)
├── workout_template_exercises (exercices du modèle)

workout_programs (programmes multi-semaines) 
├── workout_program_templates (liaison programme/templates)

scheduled_workouts (programmation avec récurrence)
├── generated_workouts (séances générées automatiquement)
    └── workout_sessions (séances réellement effectuées)
```

## 🚀 Étapes d'implémentation

### 1. Migration de la base de données

```sql
-- Exécuter dans l'éditeur SQL de Supabase
-- Le fichier SUPABASE_MIGRATIONS.sql contient toutes les migrations
```

### 2. Mise à jour de l'application

Le formulaire étendu peut remplacer l'ancien ou être utilisé en complément :

```tsx
// Au lieu de WorkoutSessionForm, utiliser :
import { WorkoutSessionFormExtended } from '@/components/tracker/WorkoutSessionFormExtended';

// Exemple d'utilisation
<WorkoutSessionFormExtended
  session={session}
  onSubmit={handleSessionSubmit}
  onSchedule={handleScheduleSubmit}  // Nouveau : programmation
  onSaveAsTemplate={handleSaveTemplate}  // Nouveau : templates
  onCancel={handleCancel}
/>
```

### 3. Utilisation des nouveaux hooks

```tsx
// Gestion des templates
const { 
  templates, 
  addTemplate, 
  searchTemplates 
} = useWorkoutTemplates();

// Gestion des séances programmées
const { 
  scheduledWorkouts, 
  addScheduledWorkout, 
  getUpcomingWorkouts 
} = useScheduledWorkouts();
```

## 🎯 Fonctionnalités disponibles

### Templates de séances
- ✅ Sauvegarde d'une séance comme template réutilisable
- ✅ Templates privés et publics
- ✅ Difficulté et tags pour filtrer
- ✅ Duplication et modification

### Programmation
- ✅ Récurrence quotidienne, hebdomadaire, mensuelle
- ✅ Sélection des jours de la semaine
- ✅ Date de début et fin
- ✅ Heure programmée et rappels

### Génération automatique
- ✅ Création automatique des séances selon la récurrence
- ✅ Statuts : programmé, complété, sauté
- ✅ Liaison avec les séances réellement effectuées

## 📝 Modèle de données détaillé

### `workout_templates`
```sql
- id, name, description
- estimated_duration, difficulty, tags
- is_public (partage)
- user_id (propriétaire)
```

### `scheduled_workouts` 
```sql
- name, template_id/program_id
- start_date, end_date
- recurrence_pattern, recurrence_interval
- week_days (pour récurrence hebdomadaire)
- scheduled_time, reminder_minutes
- is_active, auto_generate
```

### `generated_workouts`
```sql
- scheduled_workout_id (référence)
- scheduled_date, scheduled_time
- status (scheduled/completed/skipped)
- workout_session_id (une fois effectuée)
```

## 🔧 Points d'intégration

### Dans l'interface existante

1. **Page tracker** - Ajouter onglets "Templates" et "Programmation"
2. **Calendrier** - Afficher les séances programmées
3. **Dashboard** - Statistiques des séances programmées
4. **Formulaire** - Remplacer par la version étendue

### Exemples d'usage

```tsx
// Créer un template depuis une séance existante
const handleSaveAsTemplate = async (name: string, description?: string) => {
  const templateData: WorkoutTemplateFormData = {
    name,
    description,
    exercises: session.exercises.map(ex => ({ ...ex })),
    difficulty: 'intermediate',
    isPublic: false
  };
  
  await addTemplate(templateData);
};

// Programmer des séances récurrentes
const handleSchedule = async (scheduleData: ScheduledWorkoutFormData) => {
  await addScheduledWorkout({
    name: "Haut du corps",
    templateId: selectedTemplate.id,
    startDate: new Date(),
    recurrencePattern: 'weekly',
    weekDays: [1, 3, 5], // Lun, Mer, Ven
    autoGenerate: true
  });
};
```

## 🎨 Cohérence design

Le formulaire étendu préserve :
- ✅ Même style et animations
- ✅ Même structure de couleurs
- ✅ Même patterns d'interaction
- ✅ Responsive design

## 📊 Avantages de cette approche

### 1. **Modèle simple et robuste**
- Tables normalisées avec relations claires
- Contraintes de données pour l'intégrité
- RLS complet pour la sécurité

### 2. **Flexibilité maximale**
- Support de tous types de récurrence
- Templates réutilisables 
- Programmes multi-semaines
- Génération automatique optionnelle

### 3. **Performance optimisée**
- Index sur toutes les requêtes fréquentes
- Requêtes optimisées dans les hooks
- Pagination native des résultats

### 4. **Extensibilité**
- Architecture modulaire
- Hooks réutilisables
- Types TypeScript complets
- Prêt pour l'ajout de fonctionnalités

## 🎯 Prochaines étapes recommandées

### Immédiat
1. Exécuter les migrations SQL
2. Tester les nouveaux composants
3. Intégrer dans les pages existantes

### Court terme  
- Interface de gestion des templates
- Calendrier des séances programmées
- Notifications/rappels
- Statistiques étendues

### Long terme
- Programmes prédéfinis
- Partage de templates entre utilisateurs
- Coach IA pour suggestions
- Export/import de données

## 🔍 Tests recommandés

```typescript
// Tester la création de templates
const template = await addTemplate({
  name: "Test Template",
  exercises: [/* exercices */],
  difficulty: "beginner"
});

// Tester la programmation
const schedule = await addScheduledWorkout({
  name: "Séances Test",
  templateId: template.id,
  startDate: new Date(),
  recurrencePattern: "weekly",
  weekDays: [1, 3, 5],
  autoGenerate: true
});

// Vérifier la génération automatique
const upcoming = getUpcomingWorkouts(7);
console.log(`${upcoming.length} séances programmées cette semaine`);
```

Cette implémentation fournit une base solide et extensible pour la programmation de séances, tout en préservant la simplicité d'utilisation de l'application existante.
