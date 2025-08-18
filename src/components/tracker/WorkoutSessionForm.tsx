'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutSession, WorkoutSessionFormData, WorkoutExercise, MuscleGroup, MUSCLE_GROUP_LABELS, RecurrencePattern, WeekDay, RECURRENCE_LABELS, WEEK_DAY_SHORT_LABELS } from '@/types/workout-session';
import { useExercises } from '@/hooks/tracker/useExercices';
import { Calendar, Plus, X, Search, Filter, Trash2, GripVertical, Repeat, Clock } from 'lucide-react';

interface WorkoutSessionFormProps {
  session?: WorkoutSession;
  onSubmit: (data: WorkoutSessionFormData) => void;
  onCancel: () => void;
}

interface ExerciseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string) => void;
}

function ExerciseSelectionModal({ isOpen, onClose, onSelect }: ExerciseSelectionModalProps) {
  const { exercises, searchExercises } = useExercises();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup>('all');

  const filteredExercises = searchExercises(searchQuery, selectedMuscleGroup);

  const muscleGroups: MuscleGroup[] = ['all', 'upper_body', 'lower_body', 'cardio', 'core', 'full_body', 'other'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Choisir un exercice
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search and Filter */}
              <div className="space-y-4">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un exercice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Filter size={16} className="text-gray-400" />
                  {muscleGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() => setSelectedMuscleGroup(group)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedMuscleGroup === group
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {MUSCLE_GROUP_LABELS[group]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="grid gap-3">
                {filteredExercises.map((exercise) => (
                  <motion.button
                    key={exercise.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelect(exercise.id);
                      onClose();
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{exercise.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                          {exercise.isCustom && ' • Personnalisé'}
                        </p>
                        {exercise.description && (
                          <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {filteredExercises.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun exercice trouvé</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function WorkoutSessionForm({ session, onSubmit, onCancel }: WorkoutSessionFormProps) {
  const { getExerciseById } = useExercises();
  const [formData, setFormData] = useState<WorkoutSessionFormData>({
    date: new Date(),
    notes: '',
    exercises: [],
    isRecurring: false,
    recurrencePattern: 'none',
    recurrenceInterval: 1,
    recurrenceDays: [],
  });
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  useEffect(() => {
    if (session) {
      setFormData({
        date: session.date,
        notes: session.notes || '',
        exercises: session.exercises.map(({ id, exercise, ...exerciseData }) => exerciseData),
        isRecurring: session.isRecurring || false,
        recurrencePattern: session.recurrencePattern || 'none',
        recurrenceInterval: session.recurrenceInterval || 1,
        recurrenceDays: session.recurrenceDays || [],
        recurrenceEndDate: session.recurrenceEndDate,
      });
    }
  }, [session]);

  const addExercise = (exerciseId: string) => {
    const exercise = getExerciseById(exerciseId);
    if (!exercise) return;

    const newExercise: Omit<WorkoutExercise, 'id' | 'exercise'> = {
      exerciseId,
      sets: 3,
      reps: exercise.muscleGroup === 'cardio' ? undefined : 12,
      weight: exercise.muscleGroup === 'cardio' ? undefined : undefined,
      duration: exercise.muscleGroup === 'cardio' ? 30 : undefined,
      notes: '',
      order: formData.exercises.length + 1,
    };

    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
  };

  const removeExercise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index).map((ex, i) => ({ ...ex, order: i + 1 })),
    }));
  };

  const updateExercise = (index: number, updates: Partial<Omit<WorkoutExercise, 'id' | 'exercise'>>) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => i === index ? { ...ex, ...updates } : ex),
    }));
  };

  const moveExercise = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= formData.exercises.length) return;

    const newExercises = [...formData.exercises];
    const [movedExercise] = newExercises.splice(fromIndex, 1);
    newExercises.splice(toIndex, 0, movedExercise);

    // Réordonnancer
    const reorderedExercises = newExercises.map((ex, i) => ({ ...ex, order: i + 1 }));

    setFormData(prev => ({
      ...prev,
      exercises: reorderedExercises,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Date and Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Informations générales
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de la séance *
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hidden sm:inline" />
                <input
                  type="date"
                  required
                  value={formatDateForInput(formData.date)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    date: new Date(e.target.value + 'T12:00:00'),
                  }))}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Notes sur cette séance d'entraînement..."
              />
            </div>
          </div>
        </div>

        {/* Récurrence */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Repeat size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Récurrence
            </h2>
          </div>

          <div className="space-y-4">
            {/* Toggle récurrence */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  isRecurring: e.target.checked,
                  recurrencePattern: e.target.checked ? 'weekly' : 'none'
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                Répéter cette séance
              </label>
            </div>

            {/* Options de récurrence */}
            <AnimatePresence>
              {formData.isRecurring && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de récurrence
                      </label>
                      <select
                        value={formData.recurrencePattern}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recurrencePattern: e.target.value as RecurrencePattern,
                          recurrenceDays: e.target.value === 'weekly' ? [new Date(prev.date).getDay() as WeekDay] : []
                        }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {(Object.keys(RECURRENCE_LABELS) as RecurrencePattern[])
                          .filter(pattern => pattern !== 'none')
                          .map((pattern) => (
                          <option key={pattern} value={pattern}>
                            {RECURRENCE_LABELS[pattern]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intervalle
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Tous les</span>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={formData.recurrenceInterval}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            recurrenceInterval: parseInt(e.target.value) || 1
                          }))}
                          className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                        />
                        <span className="text-sm text-gray-600">
                          {formData.recurrencePattern === 'daily' && (formData.recurrenceInterval || 1) > 1 ? 'jours' : ''}
                          {formData.recurrencePattern === 'daily' && (formData.recurrenceInterval || 1) === 1 ? 'jour' : ''}
                          {formData.recurrencePattern === 'weekly' && (formData.recurrenceInterval || 1) > 1 ? 'semaines' : ''}
                          {formData.recurrencePattern === 'weekly' && (formData.recurrenceInterval || 1) === 1 ? 'semaine' : ''}
                          {formData.recurrencePattern === 'monthly' && (formData.recurrenceInterval || 1) > 1 ? 'mois' : ''}
                          {formData.recurrencePattern === 'monthly' && (formData.recurrenceInterval || 1) === 1 ? 'mois' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Jours de la semaine pour récurrence hebdomadaire */}
                  {formData.recurrencePattern === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jours de la semaine
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {(Object.keys(WEEK_DAY_SHORT_LABELS) as unknown as WeekDay[]).map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const currentDays = formData.recurrenceDays || [];
                              const newDays = currentDays.includes(day)
                                ? currentDays.filter(d => d !== day)
                                : [...currentDays, day].sort((a, b) => a - b);
                              setFormData(prev => ({ ...prev, recurrenceDays: newDays }));
                            }}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              formData.recurrenceDays?.includes(day)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {WEEK_DAY_SHORT_LABELS[day]}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Sélectionnez les jours où vous voulez répéter cette séance
                      </p>
                    </div>
                  )}

                  {/* Date de fin (optionnel) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin (optionnel)
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hidden sm:inline" />
                      <input
                        type="date"
                        value={formData.recurrenceEndDate ? formatDateForInput(formData.recurrenceEndDate) : ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recurrenceEndDate: e.target.value ? new Date(e.target.value + 'T12:00:00') : undefined
                        }))}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Laissez vide pour une récurrence illimitée
                    </p>
                  </div>

                  {/* Aperçu */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Repeat size={16} className="text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Aperçu de la récurrence</p>
                        <p>
                          {formData.recurrencePattern === 'daily' && `Tous les ${formData.recurrenceInterval === 1 ? '' : formData.recurrenceInterval + ' '}jour${formData.recurrenceInterval > 1 ? 's' : ''}`}
                          {formData.recurrencePattern === 'weekly' && formData.recurrenceDays?.length > 0 &&
                            `Chaque ${formData.recurrenceDays.map(day => WEEK_DAY_SHORT_LABELS[day]).join(', ')}${formData.recurrenceInterval > 1 ? ` (toutes les ${formData.recurrenceInterval} semaines)` : ''}`}
                          {formData.recurrencePattern === 'monthly' && `Tous les ${formData.recurrenceInterval === 1 ? '' : formData.recurrenceInterval + ' '}mois`}
                          {formData.recurrenceEndDate && ` jusqu'au ${formData.recurrenceEndDate.toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Exercises */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Exercices ({formData.exercises.length})
            </h2>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExerciseModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>Ajouter un exercice</span>
            </motion.button>
          </div>

          {formData.exercises.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Plus size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun exercice ajouté
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par ajouter des exercices à votre séance.
              </p>
              <button
                type="button"
                onClick={() => setShowExerciseModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Ajouter le premier exercice
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.exercises.map((exercise, index) => {
                const exerciseInfo = getExerciseById(exercise.exerciseId);
                const isCardio = exerciseInfo?.muscleGroup === 'cardio';

                return (
                  <motion.div
                    key={`${exercise.exerciseId}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Drag Handle */}
                      <div className="flex flex-col gap-1 pt-2">
                        <button
                          type="button"
                          onClick={() => moveExercise(index, index - 1)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ↑
                        </button>
                        <GripVertical size={16} className="text-gray-400" />
                        <button
                          type="button"
                          onClick={() => moveExercise(index, index + 1)}
                          disabled={index === formData.exercises.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ↓
                        </button>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {exerciseInfo?.name || 'Exercice inconnu'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {MUSCLE_GROUP_LABELS[exerciseInfo?.muscleGroup || 'other']}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExercise(index)}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {!isCardio && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Séries
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={exercise.sets || ''}
                                  onChange={(e) => updateExercise(index, { 
                                    sets: e.target.value ? parseInt(e.target.value) : undefined 
                                  })}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Répétitions
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={exercise.reps || ''}
                                  onChange={(e) => updateExercise(index, { 
                                    reps: e.target.value ? parseInt(e.target.value) : undefined 
                                  })}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Poids (kg)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={exercise.weight || ''}
                                  onChange={(e) => updateExercise(index, { 
                                    weight: e.target.value ? parseFloat(e.target.value) : undefined 
                                  })}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </>
                          )}
                          {isCardio && (
                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Durée (minutes)
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={exercise.duration || ''}
                                onChange={(e) => updateExercise(index, { 
                                  duration: e.target.value ? parseInt(e.target.value) : undefined 
                                })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (optionnel)
                          </label>
                          <input
                            type="text"
                            value={exercise.notes || ''}
                            onChange={(e) => updateExercise(index, { notes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Notes spécifiques à cet exercice..."
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={formData.exercises.length === 0}
            className="flex-1 px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {session ? 'Modifier la séance' : 'Créer la séance'}
          </button>
        </div>
      </form>

      <ExerciseSelectionModal
        isOpen={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onSelect={addExercise}
      />
    </div>
  );
}
