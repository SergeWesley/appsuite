'use client';

import { useState, useEffect } from 'react';
import { ScheduledWorkout, ScheduledWorkoutFormData, GeneratedWorkout, RecurrencePattern, WeekDay } from '@/types/workout-program';
import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type ScheduledWorkoutRow = Database['public']['Tables']['scheduled_workouts']['Row'];
type ScheduledWorkoutInsert = Database['public']['Tables']['scheduled_workouts']['Insert'];
type ScheduledWorkoutUpdate = Database['public']['Tables']['scheduled_workouts']['Update'];
type GeneratedWorkoutRow = Database['public']['Tables']['generated_workouts']['Row'];
type GeneratedWorkoutInsert = Database['public']['Tables']['generated_workouts']['Insert'];

// Types pour les jointures
type ScheduledWorkoutWithRelations = ScheduledWorkoutRow & {
  workout_templates?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  workout_programs?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
};

type GeneratedWorkoutWithRelations = GeneratedWorkoutRow & {
  scheduled_workouts: {
    id: string;
    name: string;
    template_id: string | null;
    program_id: string | null;
  };
  workout_sessions?: {
    id: string;
    date: string;
    notes: string | null;
  } | null;
};

// Fonction pour convertir les données de la base vers le type ScheduledWorkout
function mapRowToScheduledWorkout(row: ScheduledWorkoutWithRelations): ScheduledWorkout {
  return {
    id: row.id,
    name: row.name,
    templateId: row.template_id || undefined,
    programId: row.program_id || undefined,
    template: row.workout_templates ? {
      id: row.workout_templates.id,
      name: row.workout_templates.name,
      description: row.workout_templates.description || undefined,
      exercises: [],
      isPublic: false,
      userId: row.user_id,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    } : undefined,
    program: row.workout_programs ? {
      id: row.workout_programs.id,
      name: row.workout_programs.name,
      description: row.workout_programs.description || undefined,
      duration: 0,
      level: 'beginner',
      templates: [],
      isPublic: false,
      userId: row.user_id,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    } : undefined,
    startDate: new Date(row.start_date),
    endDate: row.end_date ? new Date(row.end_date) : undefined,
    recurrencePattern: row.recurrence_pattern,
    recurrenceInterval: row.recurrence_interval,
    weekDays: row.week_days as WeekDay[] || undefined,
    scheduledTime: row.scheduled_time || undefined,
    reminderMinutes: row.reminder_minutes || undefined,
    isActive: row.is_active,
    autoGenerate: row.auto_generate,
    userId: row.user_id,
    dateCreated: new Date(row.created_at),
    dateUpdated: new Date(row.updated_at),
  };
}

// Fonction pour convertir les données de la base vers le type GeneratedWorkout
function mapRowToGeneratedWorkout(row: GeneratedWorkoutWithRelations): GeneratedWorkout {
  return {
    id: row.id,
    scheduledWorkoutId: row.scheduled_workout_id,
    scheduledWorkout: {
      id: row.scheduled_workouts.id,
      name: row.scheduled_workouts.name,
      templateId: row.scheduled_workouts.template_id || undefined,
      programId: row.scheduled_workouts.program_id || undefined,
      startDate: new Date(),
      recurrencePattern: 'weekly',
      recurrenceInterval: 1,
      isActive: true,
      autoGenerate: true,
      userId: row.user_id,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    },
    workoutSessionId: row.workout_session_id || undefined,
    scheduledDate: new Date(row.scheduled_date),
    scheduledTime: row.scheduled_time || undefined,
    status: row.status,
    skippedReason: row.skipped_reason || undefined,
    generatedAt: new Date(row.generated_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    userId: row.user_id,
  };
}

// Fonction pour convertir ScheduledWorkoutFormData vers ScheduledWorkoutInsert
function mapFormDataToInsert(formData: ScheduledWorkoutFormData, userId: string): ScheduledWorkoutInsert {
  return {
    user_id: userId,
    name: formData.name,
    template_id: formData.templateId || null,
    program_id: formData.programId || null,
    start_date: formData.startDate.toISOString().split('T')[0],
    end_date: formData.endDate ? formData.endDate.toISOString().split('T')[0] : null,
    recurrence_pattern: formData.recurrencePattern,
    recurrence_interval: formData.recurrenceInterval,
    week_days: formData.weekDays || null,
    scheduled_time: formData.scheduledTime || null,
    reminder_minutes: formData.reminderMinutes || null,
    is_active: true,
    auto_generate: formData.autoGenerate || false,
  };
}

// Fonction pour calculer les prochaines dates selon la récurrence
function calculateNextDates(
  startDate: Date,
  endDate: Date | undefined,
  pattern: RecurrencePattern,
  interval: number,
  weekDays?: WeekDay[],
  limit: number = 50
): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  const end = endDate || new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 an par défaut

  while (current <= end && dates.length < limit) {
    switch (pattern) {
      case 'daily':
        dates.push(new Date(current));
        current.setDate(current.getDate() + interval);
        break;

      case 'weekly':
        if (weekDays && weekDays.length > 0) {
          for (let i = 0; i < 7 * interval && dates.length < limit; i++) {
            if (weekDays.includes(current.getDay() as WeekDay)) {
              dates.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
          }
        } else {
          dates.push(new Date(current));
          current.setDate(current.getDate() + 7 * interval);
        }
        break;

      case 'biweekly':
        dates.push(new Date(current));
        current.setDate(current.getDate() + 14 * interval);
        break;

      case 'monthly':
        dates.push(new Date(current));
        current.setMonth(current.getMonth() + interval);
        break;

      default:
        // Pour 'custom', on laisse l'utilisateur gérer
        return dates;
    }
  }

  return dates;
}

export function useScheduledWorkouts() {
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [generatedWorkouts, setGeneratedWorkouts] = useState<GeneratedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Charger les séances programmées
  const loadScheduledWorkouts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase
        .from('scheduled_workouts')
        .select(`
          *,
          workout_templates (id, name, description),
          workout_programs (id, name, description)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedScheduledWorkouts = data.map(mapRowToScheduledWorkout);
      setScheduledWorkouts(mappedScheduledWorkouts);
    } catch (err) {
      console.error('Erreur lors du chargement des séances programmées:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Charger les séances générées
  const loadGeneratedWorkouts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('generated_workouts')
        .select(`
          *,
          scheduled_workouts (id, name, template_id, program_id),
          workout_sessions (id, date, notes)
        `)
        .eq('user_id', user.id)
        .gte('scheduled_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // 30 derniers jours
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      const mappedGeneratedWorkouts = data.map(mapRowToGeneratedWorkout);
      setGeneratedWorkouts(mappedGeneratedWorkouts);
    } catch (err) {
      console.error('Erreur lors du chargement des séances générées:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadScheduledWorkouts();
      loadGeneratedWorkouts();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Ajouter une nouvelle séance programmée
  const addScheduledWorkout = async (workoutData: ScheduledWorkoutFormData): Promise<ScheduledWorkout | null> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    try {
      setError(null);

      const workoutInsertData = mapFormDataToInsert(workoutData, user.id);

      const { data: workoutRow, error: workoutError } = await supabase
        .from('scheduled_workouts')
        .insert(workoutInsertData)
        .select(`
          *,
          workout_templates (id, name, description),
          workout_programs (id, name, description)
        `)
        .single();

      if (workoutError) throw workoutError;

      const newScheduledWorkout = mapRowToScheduledWorkout(workoutRow);
      setScheduledWorkouts(prev => [newScheduledWorkout, ...prev]);

      // Générer automatiquement les séances si demandé
      if (workoutData.autoGenerate) {
        await generateWorkouts(newScheduledWorkout.id);
      }

      return newScheduledWorkout;
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la séance programmée:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  };

  // Générer les séances pour une programmation
  const generateWorkouts = async (scheduledWorkoutId: string): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      const scheduledWorkout = scheduledWorkouts.find(sw => sw.id === scheduledWorkoutId);
      if (!scheduledWorkout) {
        throw new Error('Séance programmée non trouvée');
      }

      // Calculer les prochaines dates
      const nextDates = calculateNextDates(
        scheduledWorkout.startDate,
        scheduledWorkout.endDate,
        scheduledWorkout.recurrencePattern,
        scheduledWorkout.recurrenceInterval,
        scheduledWorkout.weekDays
      );

      // Créer les séances générées
      const generatedInserts: GeneratedWorkoutInsert[] = nextDates.map(date => ({
        scheduled_workout_id: scheduledWorkoutId,
        scheduled_date: date.toISOString().split('T')[0],
        scheduled_time: scheduledWorkout.scheduledTime || null,
        status: 'scheduled',
        generated_at: new Date().toISOString(),
        user_id: user.id,
      }));

      const { error } = await supabase
        .from('generated_workouts')
        .insert(generatedInserts);

      if (error) throw error;

      // Recharger les séances générées
      await loadGeneratedWorkouts();

      return true;
    } catch (err) {
      console.error('Erreur lors de la génération des séances:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Mettre à jour une séance programmée
  const updateScheduledWorkout = async (id: string, updates: Partial<ScheduledWorkoutFormData>): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      setError(null);

      const updateData: ScheduledWorkoutUpdate = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.templateId !== undefined) updateData.template_id = updates.templateId || null;
      if (updates.programId !== undefined) updateData.program_id = updates.programId || null;
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate.toISOString().split('T')[0];
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate ? updates.endDate.toISOString().split('T')[0] : null;
      if (updates.recurrencePattern !== undefined) updateData.recurrence_pattern = updates.recurrencePattern;
      if (updates.recurrenceInterval !== undefined) updateData.recurrence_interval = updates.recurrenceInterval;
      if (updates.weekDays !== undefined) updateData.week_days = updates.weekDays || null;
      if (updates.scheduledTime !== undefined) updateData.scheduled_time = updates.scheduledTime || null;
      if (updates.reminderMinutes !== undefined) updateData.reminder_minutes = updates.reminderMinutes || null;

      const { error } = await supabase
        .from('scheduled_workouts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadScheduledWorkouts();
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la séance programmée:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Supprimer une séance programmée
  const deleteScheduledWorkout = async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('scheduled_workouts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setScheduledWorkouts(prev => prev.filter(sw => sw.id !== id));
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de la séance programmée:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Activer/désactiver une séance programmée
  const toggleScheduledWorkout = async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      const scheduledWorkout = scheduledWorkouts.find(sw => sw.id === id);
      if (!scheduledWorkout) {
        throw new Error('Séance programmée non trouvée');
      }

      const { error } = await supabase
        .from('scheduled_workouts')
        .update({ is_active: !scheduledWorkout.isActive })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadScheduledWorkouts();
      return true;
    } catch (err) {
      console.error('Erreur lors de la modification du statut:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Marquer une séance générée comme complétée
  const completeGeneratedWorkout = async (id: string, workoutSessionId: string): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      const { error } = await supabase
        .from('generated_workouts')
        .update({
          status: 'completed',
          workout_session_id: workoutSessionId,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadGeneratedWorkouts();
      return true;
    } catch (err) {
      console.error('Erreur lors de la completion de la séance:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Skip une séance générée
  const skipGeneratedWorkout = async (id: string, reason?: string): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      const { error } = await supabase
        .from('generated_workouts')
        .update({
          status: 'skipped',
          skipped_reason: reason || null,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadGeneratedWorkouts();
      return true;
    } catch (err) {
      console.error('Erreur lors du skip de la séance:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  // Obtenir les séances programmées actives
  const getActiveScheduledWorkouts = (): ScheduledWorkout[] => {
    return scheduledWorkouts.filter(sw => sw.isActive);
  };

  // Obtenir les prochaines séances générées
  const getUpcomingWorkouts = (days: number = 7): GeneratedWorkout[] => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return generatedWorkouts.filter(gw => 
      gw.scheduledDate >= now && 
      gw.scheduledDate <= futureDate &&
      gw.status === 'scheduled'
    );
  };

  return {
    scheduledWorkouts,
    generatedWorkouts,
    loading,
    error,
    addScheduledWorkout,
    updateScheduledWorkout,
    deleteScheduledWorkout,
    toggleScheduledWorkout,
    generateWorkouts,
    completeGeneratedWorkout,
    skipGeneratedWorkout,
    getActiveScheduledWorkouts,
    getUpcomingWorkouts,
    refreshScheduledWorkouts: loadScheduledWorkouts,
    refreshGeneratedWorkouts: loadGeneratedWorkouts,
  };
}
