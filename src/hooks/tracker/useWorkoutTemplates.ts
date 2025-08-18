'use client';

import { useState, useEffect } from 'react';
import { WorkoutTemplate, WorkoutTemplateFormData, WorkoutTemplateExercise } from '@/types/workout-program';
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
    exercises: row.workout_template_exercises.map(wte => ({
      id: wte.id,
      templateId: wte.template_id,
      exerciseId: wte.exercise_id,
      sets: wte.sets || undefined,
      reps: wte.reps || undefined,
      weight: wte.weight || undefined,
      duration: wte.duration || undefined,
      notes: wte.notes || undefined,
      order: wte.exercise_order,
    })),
    estimatedDuration: row.estimated_duration || undefined,
    difficulty: row.difficulty || undefined,
    tags: row.tags || undefined,
    isPublic: row.is_public,
    userId: row.user_id,
    dateCreated: new Date(row.created_at),
    dateUpdated: new Date(row.updated_at),
  };
}

// Fonction pour convertir WorkoutTemplateFormData vers WorkoutTemplateInsert
function mapFormDataToInsert(formData: WorkoutTemplateFormData, userId: string): WorkoutTemplateInsert {
  return {
    user_id: userId,
    name: formData.name,
    description: formData.description || null,
    estimated_duration: formData.estimatedDuration || null,
    difficulty: formData.difficulty || null,
    tags: formData.tags || null,
    is_public: formData.isPublic || false,
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
        .or(`user_id.eq.${user.id},is_public.eq.true`)
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

      const { data: templateRow, error: templateError } = await supabase
        .from('workout_templates')
        .insert(templateInsertData)
        .select()
        .single();

      if (templateError) throw templateError;

      // 2. Ajouter les exercices
      if (templateData.exercises.length > 0) {
        const exerciseInserts: WorkoutTemplateExerciseInsert[] = templateData.exercises.map((exercise) => ({
          template_id: templateRow.id,
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
        .eq('id', templateRow.id)
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

  // Mettre à jour un template
  const updateTemplate = async (id: string, updates: Partial<WorkoutTemplateFormData>): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      setError(null);

      // 1. Mettre à jour le template
      const templateUpdate: WorkoutTemplateUpdate = {};
      if (updates.name !== undefined) templateUpdate.name = updates.name;
      if (updates.description !== undefined) templateUpdate.description = updates.description || null;
      if (updates.estimatedDuration !== undefined) templateUpdate.estimated_duration = updates.estimatedDuration || null;
      if (updates.difficulty !== undefined) templateUpdate.difficulty = updates.difficulty || null;
      if (updates.tags !== undefined) templateUpdate.tags = updates.tags || null;
      if (updates.isPublic !== undefined) templateUpdate.is_public = updates.isPublic;

      const { error: templateError } = await supabase
        .from('workout_templates')
        .update(templateUpdate)
        .eq('id', id)
        .eq('user_id', user.id);

      if (templateError) throw templateError;

      // 2. Si les exercices sont mis à jour, les remplacer complètement
      if (updates.exercises !== undefined) {
        // Supprimer les anciens exercices
        const { error: deleteError } = await supabase
          .from('workout_template_exercises')
          .delete()
          .eq('template_id', id);

        if (deleteError) throw deleteError;

        // Ajouter les nouveaux exercices
        if (updates.exercises.length > 0) {
          const exerciseInserts: WorkoutTemplateExerciseInsert[] = updates.exercises.map((exercise) => ({
            template_id: id,
            exercise_id: exercise.exerciseId,
            sets: exercise.sets || null,
            reps: exercise.reps || null,
            weight: exercise.weight || null,
            duration: exercise.duration || null,
            notes: exercise.notes || null,
            exercise_order: exercise.order,
          }));

          const { error: insertError } = await supabase
            .from('workout_template_exercises')
            .insert(exerciseInserts);

          if (insertError) throw insertError;
        }
      }

      // 3. Recharger les données
      await loadTemplates();
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du template:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Supprimer un template
  const deleteTemplate = async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== id));
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du template:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Dupliquer un template
  const duplicateTemplate = async (id: string, newName?: string): Promise<WorkoutTemplate | null> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    try {
      const originalTemplate = templates.find(t => t.id === id);
      if (!originalTemplate) {
        throw new Error('Template non trouvé');
      }

      const duplicatedTemplate: WorkoutTemplateFormData = {
        name: newName || `${originalTemplate.name} (Copie)`,
        description: originalTemplate.description,
        exercises: originalTemplate.exercises.map(({ id, templateId, ...exerciseData }) => exerciseData),
        estimatedDuration: originalTemplate.estimatedDuration,
        difficulty: originalTemplate.difficulty,
        tags: originalTemplate.tags,
        isPublic: false, // Les copies sont privées par défaut
      };

      return await addTemplate(duplicatedTemplate);
    } catch (err) {
      console.error('Erreur lors de la duplication du template:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  };

  // Obtenir un template par ID
  const getTemplateById = (id: string): WorkoutTemplate | undefined => {
    return templates.find(template => template.id === id);
  };

  // Rechercher des templates
  const searchTemplates = (query: string, difficulty?: string, tags?: string[]): WorkoutTemplate[] => {
    return templates.filter(template => {
      const matchesQuery = !query || 
        template.name.toLowerCase().includes(query.toLowerCase()) ||
        (template.description && template.description.toLowerCase().includes(query.toLowerCase()));

      const matchesDifficulty = !difficulty || template.difficulty === difficulty;

      const matchesTags = !tags || tags.length === 0 || 
        (template.tags && tags.some(tag => template.tags!.includes(tag)));

      return matchesQuery && matchesDifficulty && matchesTags;
    });
  };

  // Obtenir les templates de l'utilisateur uniquement
  const getUserTemplates = (): WorkoutTemplate[] => {
    return templates.filter(template => template.userId === user?.id);
  };

  // Obtenir les templates publics
  const getPublicTemplates = (): WorkoutTemplate[] => {
    return templates.filter(template => template.isPublic && template.userId !== user?.id);
  };

  return {
    templates,
    loading,
    error,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    getTemplateById,
    searchTemplates,
    getUserTemplates,
    getPublicTemplates,
    refreshTemplates: loadTemplates,
  };
}
