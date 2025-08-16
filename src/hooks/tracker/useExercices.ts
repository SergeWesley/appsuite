'use client';

import { useState, useEffect } from 'react';
import { Exercise, ExerciseFormData, MuscleGroup } from '@/types/workout-session';
import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type ExerciseRow = Database['public']['Tables']['exercises']['Row'];
type ExerciseInsert = Database['public']['Tables']['exercises']['Insert'];
type ExerciseUpdate = Database['public']['Tables']['exercises']['Update'];

// Fonction pour convertir les données de la base vers le type Exercise
function mapRowToExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group as MuscleGroup,
    description: row.description || undefined,
    isCustom: row.is_custom,
    userId: row.user_id || undefined,
    dateCreated: new Date(row.created_at),
  };
}

// Fonction pour convertir ExerciseFormData vers ExerciseInsert
function mapFormDataToInsert(formData: ExerciseFormData, userId: string): ExerciseInsert {
  return {
    name: formData.name,
    muscle_group: formData.muscleGroup,
    description: formData.description || null,
    is_custom: true,
    user_id: userId,
  };
}

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Charger les exercices (prédéfinis + personnalisés)
  const loadExercises = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;

      const mappedExercises = data.map(mapRowToExercise);
      setExercises(mappedExercises);
    } catch (err) {
      console.error('Erreur lors du chargement des exercices:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [user]);

  // Ajouter un exercice personnalisé
  const addCustomExercise = async (exerciseData: ExerciseFormData): Promise<Exercise | null> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    try {
      setError(null);

      const insertData = mapFormDataToInsert(exerciseData, user.id);

      const { data, error } = await supabase
        .from('exercises')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newExercise = mapRowToExercise(data);
      setExercises(prev => [...prev, newExercise]);
      
      return newExercise;
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'exercice:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  };

  // Mettre à jour un exercice personnalisé
  const updateCustomExercise = async (id: string, updates: Partial<ExerciseFormData>): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      setError(null);

      const updateData: ExerciseUpdate = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.muscleGroup !== undefined) updateData.muscle_group = updates.muscleGroup;
      if (updates.description !== undefined) updateData.description = updates.description || null;

      const { data, error } = await supabase
        .from('exercises')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('is_custom', true)
        .select()
        .single();

      if (error) throw error;

      const updatedExercise = mapRowToExercise(data);
      setExercises(prev => prev.map(exercise => exercise.id === id ? updatedExercise : exercise));
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'exercice:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Supprimer un exercice personnalisé
  const deleteCustomExercise = async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('is_custom', true);

      if (error) throw error;

      setExercises(prev => prev.filter(exercise => exercise.id !== id));
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'exercice:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Obtenir les exercices par groupe musculaire
  const getExercisesByMuscleGroup = (muscleGroup: MuscleGroup): Exercise[] => {
    if (muscleGroup === 'all') {
      return exercises;
    }
    return exercises.filter(exercise => exercise.muscleGroup === muscleGroup);
  };

  // Rechercher des exercices
  const searchExercises = (query: string, muscleGroup?: MuscleGroup): Exercise[] => {
    let filteredExercises = exercises;
    
    if (muscleGroup && muscleGroup !== 'all') {
      filteredExercises = filteredExercises.filter(exercise => exercise.muscleGroup === muscleGroup);
    }
    
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      filteredExercises = filteredExercises.filter(exercise =>
        exercise.name.toLowerCase().includes(lowercaseQuery) ||
        exercise.description?.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    return filteredExercises;
  };

  // Obtenir un exercice par ID
  const getExerciseById = (id: string): Exercise | undefined => {
    return exercises.find(exercise => exercise.id === id);
  };

  // Obtenir les exercices personnalisés uniquement
  const getCustomExercises = (): Exercise[] => {
    return exercises.filter(exercise => exercise.isCustom && exercise.userId === user?.id);
  };

  return {
    exercises,
    loading,
    error,
    addCustomExercise,
    updateCustomExercise,
    deleteCustomExercise,
    getExercisesByMuscleGroup,
    searchExercises,
    getExerciseById,
    getCustomExercises,
    refreshExercises: loadExercises,
  };
}
