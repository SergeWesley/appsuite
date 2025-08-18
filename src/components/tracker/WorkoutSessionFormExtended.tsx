'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutSession, WorkoutSessionFormData, WorkoutExercise, MuscleGroup, MUSCLE_GROUP_LABELS } from '@/types/workout-session';
import { ScheduledWorkoutFormData, RecurrencePattern, WeekDay, RECURRENCE_LABELS, WEEK_DAY_LABELS } from '@/types/workout-program';
import { useExercises } from '@/hooks/tracker/useExercices';
import { 
  Calendar, Plus, X, Search, Filter, Trash2, GripVertical, 
  Clock, Repeat, Save, Settings, AlertCircle 
} from 'lucide-react';

interface WorkoutSessionFormExtendedProps {
  session?: WorkoutSession;
  onSubmit: (data: WorkoutSessionFormData) => void;
  onSchedule?: (data: ScheduledWorkoutFormData) => void;
  onSaveAsTemplate?: (name: string, description?: string) => void;
  onCancel: () => void;
}

interface ExerciseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string) => void;
}

type FormMode = 'session' | 'schedule' | 'template';

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

export function WorkoutSessionFormExtended({ 
  session, 
  onSubmit, 
  onSchedule, 
  onSaveAsTemplate, 
  onCancel 
}: WorkoutSessionFormExtendedProps) {
  const { getExerciseById } = useExercises();
  const [mode, setMode] = useState<FormMode>('session');
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  // Données du formulaire de séance
  const [formData, setFormData] = useState<WorkoutSessionFormData>({
    date: new Date(),
    notes: '',
    exercises: [],
  });

  // Données pour la programmation
  const [scheduleData, setScheduleData] = useState<ScheduledWorkoutFormData>({
    name: '',
    startDate: new Date(),
    recurrencePattern: 'weekly',
    recurrenceInterval: 1,
    weekDays: [1], // Lundi par défaut
    autoGenerate: true,
  });

  // Données pour le template
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (session) {
      setFormData({
        date: session.date,
        notes: session.notes || '',
        exercises: session.exercises.map(({ id, exercise, ...exerciseData }) => exerciseData),
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

    const reorderedExercises = newExercises.map((ex, i) => ({ ...ex, order: i + 1 }));

    setFormData(prev => ({
      ...prev,
      exercises: reorderedExercises,
    }));
  };

  const handleSubmitSession = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSchedule) {
      onSchedule(scheduleData);
    }
  };

  const handleSaveAsTemplate = () => {
    if (onSaveAsTemplate && templateData.name.trim()) {
      onSaveAsTemplate(templateData.name, templateData.description || undefined);
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTimeForInput = (time: string) => {
    return time.padStart(5, '0');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Mode Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setMode('session')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'session'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar size={16} />
            Séance unique
          </button>
          <button
            onClick={() => setMode('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'schedule'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Repeat size={16} />
            Programmer
          </button>
          {onSaveAsTemplate && (
            <button
              onClick={() => setMode('template')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'template'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Save size={16} />
              Sauvegarder
            </button>
          )}
        </div>
      </div>

      <form onSubmit={mode === 'session' ? handleSubmitSession : handleScheduleSubmit} className="space-y-8">
        {/* Configuration spécifique au mode */}
        {mode === 'session' && (
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
        )}

        {mode === 'schedule' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Programmation
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la séance programmée *
                </label>
                <input
                  type="text"
                  required
                  value={scheduleData.name}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Séance Haut du corps"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    required
                    value={formatDateForInput(scheduleData.startDate)}
                    onChange={(e) => setScheduleData(prev => ({
                      ...prev,
                      startDate: new Date(e.target.value + 'T12:00:00'),
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin (optionnel)
                  </label>
                  <input
                    type="date"
                    value={scheduleData.endDate ? formatDateForInput(scheduleData.endDate) : ''}
                    onChange={(e) => setScheduleData(prev => ({
                      ...prev,
                      endDate: e.target.value ? new Date(e.target.value + 'T12:00:00') : undefined,
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Récurrence
                  </label>
                  <select
                    value={scheduleData.recurrencePattern}
                    onChange={(e) => setScheduleData(prev => ({
                      ...prev,
                      recurrencePattern: e.target.value as RecurrencePattern,
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {(Object.keys(RECURRENCE_LABELS) as RecurrencePattern[]).map((pattern) => (
                      <option key={pattern} value={pattern}>
                        {RECURRENCE_LABELS[pattern]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure (optionnel)
                  </label>
                  <input
                    type="time"
                    value={scheduleData.scheduledTime || ''}
                    onChange={(e) => setScheduleData(prev => ({
                      ...prev,
                      scheduledTime: e.target.value || undefined,
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {scheduleData.recurrencePattern === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jours de la semaine
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {(Object.keys(WEEK_DAY_LABELS) as unknown as WeekDay[]).map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const weekDays = scheduleData.weekDays || [];
                          const newWeekDays = weekDays.includes(day)
                            ? weekDays.filter(d => d !== day)
                            : [...weekDays, day];
                          setScheduleData(prev => ({ ...prev, weekDays: newWeekDays }));
                        }}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          scheduleData.weekDays?.includes(day)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {WEEK_DAY_LABELS[day].slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoGenerate"
                  checked={scheduleData.autoGenerate}
                  onChange={(e) => setScheduleData(prev => ({
                    ...prev,
                    autoGenerate: e.target.checked,
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="autoGenerate" className="text-sm text-gray-700">
                  Générer automatiquement les séances dans le calendrier
                </label>
              </div>
            </div>
          </div>
        )}

        {mode === 'template' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Sauvegarder comme template
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du template *
                </label>
                <input
                  type="text"
                  required
                  value={templateData.name}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Séance Haut du corps - Intermédiaire"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={templateData.description}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Description du template..."
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Template réutilisable</p>
                    <p>Ce template pourra être utilisé pour créer rapidement de nouvelles séances ou programmer des séances récurrentes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exercises Section */}
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
          
          {mode === 'template' ? (
            <button
              type="button"
              onClick={handleSaveAsTemplate}
              disabled={!templateData.name.trim() || formData.exercises.length === 0}
              className="flex-1 px-6 py-3 text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sauvegarder le template
            </button>
          ) : (
            <button
              type="submit"
              disabled={formData.exercises.length === 0 || (mode === 'schedule' && !scheduleData.name.trim())}
              className="flex-1 px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'session' 
                ? (session ? 'Modifier la séance' : 'Créer la séance')
                : 'Programmer les séances'
              }
            </button>
          )}
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
