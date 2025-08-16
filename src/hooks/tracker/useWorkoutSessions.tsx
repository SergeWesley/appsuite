'use client';

import { useState, useEffect } from 'react';
import { WorkoutSession, WorkoutSessionFormData, WorkoutExercise, WorkoutStats, MuscleGroup } from '@/types/workout-session';
import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type WorkoutSessionRow = Database['public']['Tables']['workout_sessions']['Row'];
type WorkoutSessionInsert = Database['public']['Tables']['workout_sessions']['Insert'];
type WorkoutSessionUpdate = Database['public']['Tables']['workout_sessions']['Update'];
type WorkoutExerciseRow = Database['public']['Tables']['workout_exercises']['Row'];
type WorkoutExerciseInsert = Database['public']['Tables']['workout_exercises']['Insert'];

// Types pour les jointures
type WorkoutSessionWithExercises = WorkoutSessionRow & {
  workout_exercises: (WorkoutExerciseRow & {
    exercises: {
      id: string;
      name: string;
      muscle_group: string;
      description: string | null;
      is_custom: boolean;
    } | null;
  })[];
};

// Fonction pour convertir les données de la base vers le type WorkoutSession
function mapRowToWorkoutSession(row: WorkoutSessionWithExercises): WorkoutSession {
  return {
    id: row.id,
    date: new Date(row.date),
    notes: row.notes || undefined,
    exercises: row.workout_exercises.map(we => ({
      id: we.id,
      exerciseId: we.exercise_id,
      exercise: we.exercises ? {
        id: we.exercises.id,
        name: we.exercises.name,
        muscleGroup: we.exercises.muscle_group as any,
        description: we.exercises.description || undefined,
        isCustom: we.exercises.is_custom,
        userId: undefined,
        dateCreated: new Date(),
      } : undefined,
      sets: we.sets || undefined,
      reps: we.reps || undefined,
      weight: we.weight || undefined,
      duration: we.duration || undefined,
      notes: we.notes || undefined,
      order: we.exercise_order,
    })),
    totalExercises: row.total_exercises,
    duration: row.duration || undefined,
    userId: row.user_id,
    dateCreated: new Date(row.created_at),
    dateUpdated: new Date(row.updated_at),
  };
}

// Fonction pour convertir WorkoutSessionFormData vers WorkoutSessionInsert
function mapFormDataToInsert(formData: WorkoutSessionFormData, userId: string): WorkoutSessionInsert {
  return {
    user_id: userId,
    date: formData.date.toISOString().split('T')[0],
    notes: formData.notes || null,
    total_exercises: formData.exercises.length,
    duration: null, // Sera calculé automatiquement si nécessaire
  };
}

export function useWorkoutSessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Charger les séances
  const loadSessions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_exercises (
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
        .order('date', { ascending: false });

      if (error) throw error;

      const mappedSessions = data.map(mapRowToWorkoutSession);
      setSessions(mappedSessions);
    } catch (err) {
      console.error('Erreur lors du chargement des séances:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadSessions();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Ajouter une nouvelle séance
  const addSession = async (sessionData: WorkoutSessionFormData): Promise<WorkoutSession | null> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    try {
      setError(null);

      // 1. Créer la séance
      const sessionInsertData = mapFormDataToInsert(sessionData, user.id);

      const { data: sessionData_db, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert(sessionInsertData)
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 2. Ajouter les exercices
      if (sessionData.exercises.length > 0) {
        const exerciseInserts: WorkoutExerciseInsert[] = sessionData.exercises.map((exercise, index) => ({
          workout_session_id: sessionData_db.id,
          exercise_id: exercise.exerciseId,
          sets: exercise.sets || null,
          reps: exercise.reps || null,
          weight: exercise.weight || null,
          duration: exercise.duration || null,
          notes: exercise.notes || null,
          exercise_order: exercise.order,
        }));

        const { error: exercisesError } = await supabase
          .from('workout_exercises')
          .insert(exerciseInserts);

        if (exercisesError) throw exercisesError;
      }

      // 3. Recharger les données pour obtenir la séance complète
      const { data: fullSessionData, error: fullSessionError } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_exercises (
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
        .eq('id', sessionData_db.id)
        .single();

      if (fullSessionError) throw fullSessionError;

      const newSession = mapRowToWorkoutSession(fullSessionData);
      setSessions(prev => [newSession, ...prev]);

      return newSession;
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la séance:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  };

  // Mettre à jour une séance
  const updateSession = async (id: string, updates: Partial<WorkoutSessionFormData>): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      setError(null);

      // 1. Mettre à jour la séance
      const sessionUpdate: WorkoutSessionUpdate = {};
      if (updates.date !== undefined) sessionUpdate.date = updates.date.toISOString().split('T')[0];
      if (updates.notes !== undefined) sessionUpdate.notes = updates.notes || null;
      if (updates.exercises !== undefined) sessionUpdate.total_exercises = updates.exercises.length;

      const { error: sessionError } = await supabase
        .from('workout_sessions')
        .update(sessionUpdate)
        .eq('id', id)
        .eq('user_id', user.id);

      if (sessionError) throw sessionError;

      // 2. Si les exercices sont mis à jour, les remplacer complètement
      if (updates.exercises !== undefined) {
        // Supprimer les anciens exercices
        const { error: deleteError } = await supabase
          .from('workout_exercises')
          .delete()
          .eq('workout_session_id', id);

        if (deleteError) throw deleteError;

        // Ajouter les nouveaux exercices
        if (updates.exercises.length > 0) {
          const exerciseInserts: WorkoutExerciseInsert[] = updates.exercises.map((exercise) => ({
            workout_session_id: id,
            exercise_id: exercise.exerciseId,
            sets: exercise.sets || null,
            reps: exercise.reps || null,
            weight: exercise.weight || null,
            duration: exercise.duration || null,
            notes: exercise.notes || null,
            exercise_order: exercise.order,
          }));

          const { error: insertError } = await supabase
            .from('workout_exercises')
            .insert(exerciseInserts);

          if (insertError) throw insertError;
        }
      }

      // 3. Recharger les données
      await loadSessions();
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la séance:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Supprimer une séance
  const deleteSession = async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== id));
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de la séance:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Dupliquer une séance
  const duplicateSession = async (id: string): Promise<WorkoutSession | null> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    try {
      const originalSession = sessions.find(s => s.id === id);
      if (!originalSession) {
        throw new Error('Séance non trouvée');
      }

      const duplicatedSession: WorkoutSessionFormData = {
        date: new Date(), // Aujourd'hui par défaut
        notes: originalSession.notes,
        exercises: originalSession.exercises.map(({ id, exercise, ...exerciseData }) => exerciseData),
      };

      return await addSession(duplicatedSession);
    } catch (err) {
      console.error('Erreur lors de la duplication de la séance:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  };

  // Obtenir une séance par ID
  const getSessionById = (id: string): WorkoutSession | undefined => {
    return sessions.find(session => session.id === id);
  };

  // Obtenir les statistiques
  const getStats = (): WorkoutStats => {
    const totalSessions = sessions.length;
    const totalExercises = sessions.reduce((sum, session) => sum + session.totalExercises, 0);
    const averageExercisesPerSession = totalSessions > 0 ? totalExercises / totalSessions : 0;

    // Statistiques par groupe musculaire
    const exercisesByMuscleGroup = sessions.reduce((acc, session) => {
      session.exercises.forEach(exercise => {
        if (exercise.exercise) {
          const group = exercise.exercise.muscleGroup;
          acc[group] = (acc[group] || 0) + 1;
        }
      });
      return acc;
    }, {} as Record<MuscleGroup, number>);

    // Séances cette semaine
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sessionsThisWeek = sessions.filter(session => session.date >= oneWeekAgo).length;

    // Séances ce mois
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sessionsThisMonth = sessions.filter(session => session.date >= oneMonthAgo).length;

    return {
      totalSessions,
      totalExercises,
      averageExercisesPerSession,
      exercisesByMuscleGroup,
      sessionsThisWeek,
      sessionsThisMonth,
    };
  };

  return {
    sessions,
    loading,
    error,
    addSession,
    updateSession,
    deleteSession,
    duplicateSession,
    getSessionById,
    getStats,
    refreshSessions: loadSessions,
  };
}
