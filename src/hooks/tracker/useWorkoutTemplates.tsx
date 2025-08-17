'use client';

import { useState, useEffect } from 'react';
import { WorkoutTemplate, WorkoutTemplateFormData, WorkoutOccurrence, generateRecurrenceOccurrences, DayOfWeek } from '@/types/workout-session';
import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type WorkoutTemplateRow = Database['public']['Tables']['workout_templates']['Row'];
type WorkoutTemplateInsert = Database['public']['Tables']['workout_templates']['Insert'];
type WorkoutTemplateUpdate = Database['public']['Tables']['workout_templates']['Update'];
type WorkoutTemplateExerciseRow = Database['public']['Tables']['workout_template_exercises']['Row'];
type WorkoutTemplateExerciseInsert = Database['public']['Tables']['workout_template_exercises']['Insert'];

// Types pour les jointures
type WorkoutTemplateWithExercises = WorkoutTemplateRow & {
  workout_template_exercises: (WorkoutTemplateExerciseRow & {
    exercises: {
      id: string;
      name: string;
      muscle_group: string;
      description: string | null;
      is_custom: boolean;
    } | null;
  })[];
};

// Fonction pour convertir les données de la base vers le type WorkoutTemplate
function mapRowToWorkoutTemplate(row: WorkoutTemplateWithExercises): WorkoutTemplate {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    recurrence: {
      type: row.recurrence_type as any,
      interval: row.recurrence_interval || undefined,
      daysOfWeek: row.recurrence_days_of_week as DayOfWeek[] || undefined,
      endDate: row.recurrence_end_date ? new Date(row.recurrence_end_date) : undefined,
      maxOccurrences: row.recurrence_max_occurrences || undefined,
    },
    exercises: row.workout_template_exercises.map(te => ({
      id: te.id,
      exerciseId: te.exercise_id,
      exercise: te.exercises ? {
        id: te.exercises.id,
        name: te.exercises.name,
        muscleGroup: te.exercises.muscle_group as any,
        description: te.exercises.description || undefined,
        isCustom: te.exercises.is_custom,
        userId: undefined,
        dateCreated: new Date(),
      } : undefined,
      sets: te.sets || undefined,
      reps: te.reps || undefined,
      weight: te.weight || undefined,
      duration: te.duration || undefined,
      notes: te.notes || undefined,
      order: te.exercise_order,
    })),
    userId: row.user_id,
    dateCreated: new Date(row.created_at),
    dateUpdated: new Date(row.updated_at),
    isActive: row.is_active,
  };
}

// Fonction pour convertir WorkoutTemplateFormData vers WorkoutTemplateInsert
function mapFormDataToInsert(formData: WorkoutTemplateFormData, userId: string): WorkoutTemplateInsert {
  return {
    user_id: userId,
    name: formData.name,
    description: formData.description || null,
    recurrence_type: formData.recurrence.type,
    recurrence_interval: formData.recurrence.interval || null,
    recurrence_days_of_week: formData.recurrence.daysOfWeek || null,
    recurrence_end_date: formData.recurrence.endDate?.toISOString().split('T')[0] || null,
    recurrence_max_occurrences: formData.recurrence.maxOccurrences || null,
    start_date: formData.startDate.toISOString().split('T')[0],
    is_active: true,
  };
}

export function useWorkoutTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Charger les templates
  const loadTemplates = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase
        .from('workout_templates')
        .select(`
          *,
          workout_template_exercises (
            *,
            exercises (
              id,
              name,
              muscle_group,
              description,
              is_custom
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedTemplates = data.map(mapRowToWorkoutTemplate);
      setTemplates(mappedTemplates);
    } catch (err) {
      console.error('Erreur lors du chargement des templates:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadTemplates();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Ajouter un nouveau template
  const addTemplate = async (templateData: WorkoutTemplateFormData): Promise<WorkoutTemplate | null> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    try {
      setError(null);

      // 1. Créer le template
      const templateInsertData = mapFormDataToInsert(templateData, user.id);

      const { data: templateData_db, error: templateError } = await supabase
        .from('workout_templates')
        .insert(templateInsertData)
        .select()
        .single();

      if (templateError) throw templateError;

      // 2. Ajouter les exercices du template
      if (templateData.exercises.length > 0) {
        const exerciseInserts: WorkoutTemplateExerciseInsert[] = templateData.exercises.map((exercise) => ({
          template_id: templateData_db.id,
          exercise_id: exercise.exerciseId,
          sets: exercise.sets || null,
          reps: exercise.reps || null,
          weight: exercise.weight || null,
          duration: exercise.duration || null,
          notes: exercise.notes || null,
          exercise_order: exercise.order,
        }));

        const { error: exercisesError } = await supabase
          .from('workout_template_exercises')
          .insert(exerciseInserts);

        if (exercisesError) throw exercisesError;
      }

      // 3. Recharger les données pour obtenir le template complet
      const { data: fullTemplateData, error: fullTemplateError } = await supabase
        .from('workout_templates')
        .select(`
          *,
          workout_template_exercises (
            *,
            exercises (
              id,
              name,
              muscle_group,
              description,
              is_custom
            )
          )
        `)
        .eq('id', templateData_db.id)
        .single();

      if (fullTemplateError) throw fullTemplateError;

      const newTemplate = mapRowToWorkoutTemplate(fullTemplateData);
      setTemplates(prev => [newTemplate, ...prev]);

      return newTemplate;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du template:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  };

  // Désactiver un template
  const deactivateTemplate = async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('workout_templates')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== id));
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la désactivation du template:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Générer les occurrences d'un template pour une période donnée
  const generateTemplateOccurrences = (
    template: WorkoutTemplate,
    rangeStart: Date,
    rangeEnd: Date
  ): WorkoutOccurrence[] => {
    const startDate = new Date(template.dateCreated);
    const occurrenceDates = generateRecurrenceOccurrences(
      startDate,
      template.recurrence,
      rangeStart,
      rangeEnd
    );

    return occurrenceDates.map(date => ({
      date,
      templateId: template.id,
      template,
    }));
  };

  // Générer toutes les occurrences pour tous les templates actifs
  const generateAllOccurrences = (rangeStart: Date, rangeEnd: Date): WorkoutOccurrence[] => {
    const allOccurrences: WorkoutOccurrence[] = [];

    templates.forEach(template => {
      if (template.isActive) {
        const templateOccurrences = generateTemplateOccurrences(template, rangeStart, rangeEnd);
        allOccurrences.push(...templateOccurrences);
      }
    });

    // Trier par date
    return allOccurrences.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Obtenir un template par ID
  const getTemplateById = (id: string): WorkoutTemplate | undefined => {
    return templates.find(template => template.id === id);
  };

  return {
    templates,
    loading,
    error,
    addTemplate,
    deactivateTemplate,
    generateTemplateOccurrences,
    generateAllOccurrences,
    getTemplateById,
    refreshTemplates: loadTemplates,
  };
}
