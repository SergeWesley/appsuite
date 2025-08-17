'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Activity } from 'lucide-react';
import { WorkoutSession, WorkoutOccurrence } from '@/types/workout-session';
import { useWorkoutTemplates } from '@/hooks/tracker/useWorkoutTemplates';

interface WorkoutCalendarProps {
  sessions: WorkoutSession[];
  onSessionClick?: (session: WorkoutSession) => void;
  onOccurrenceClick?: (occurrence: WorkoutOccurrence) => void;
}

export function WorkoutCalendar({ sessions, onSessionClick, onOccurrenceClick }: WorkoutCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { generateAllOccurrences } = useWorkoutTemplates();
  
  // Obtenir le premier jour du mois et calculer les jours à afficher
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Premier jour du mois
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Premier lundi de la semaine contenant le premier du mois
    const firstMondayOfCalendar = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lundi = 0
    firstMondayOfCalendar.setDate(firstDayOfMonth.getDate() - daysToSubtract);
    
    // Générer 42 jours (6 semaines × 7 jours)
    const calendarDays: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(firstMondayOfCalendar);
      day.setDate(firstMondayOfCalendar.getDate() + i);
      calendarDays.push(day);
    }
    
    return {
      year,
      month,
      firstDayOfMonth,
      lastDayOfMonth,
      calendarDays
    };
  }, [currentDate]);
  
  // Générer les occurrences de templates pour le mois courant
  const templateOccurrences = useMemo(() => {
    const startOfMonth = new Date(calendarData.year, calendarData.month, 1);
    const endOfMonth = new Date(calendarData.year, calendarData.month + 1, 0);

    return generateAllOccurrences(startOfMonth, endOfMonth);
  }, [calendarData.year, calendarData.month, generateAllOccurrences]);

  // Grouper les séances par date
  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, WorkoutSession[]> = {};

    sessions.forEach(session => {
       // Utiliser une clé de date locale pour éviter les problèmes de fuseau horaire
      const year = session.date.getFullYear();
      const month = String(session.date.getMonth() + 1).padStart(2, '0');
      const day = String(session.date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });

    return grouped;
  }, [sessions]);

  // Grouper les occurrences de templates par date
  const occurrencesByDate = useMemo(() => {
    const grouped: Record<string, WorkoutOccurrence[]> = {};

    templateOccurrences.forEach(occurrence => {
      const year = occurrence.date.getFullYear();
      const month = String(occurrence.date.getMonth() + 1).padStart(2, '0');
      const day = String(occurrence.date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      // Ne pas ajouter l'occurrence si une séance existe déjà pour cette date et ce template
      const existingSessions = sessionsByDate[dateKey] || [];
      const hasSessionFromTemplate = existingSessions.some(session =>
        session.templateId === occurrence.templateId
      );

      if (!hasSessionFromTemplate) {
        grouped[dateKey].push(occurrence);
      }
    });

    return grouped;
  }, [templateOccurrences, sessionsByDate]);
  
  // Navigation du calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Obtenir les séances pour une date donnée
  const getSessionsForDate = (date: Date): WorkoutSession[] => {
    // Utiliser la même logique de génération de clé que pour sessionsByDate
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    return sessionsByDate[dateKey] || [];
  };
  
  // Vérifier si une date est aujourd'hui
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  // Vérifier si une date est dans le mois courant
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === calendarData.month && date.getFullYear() === calendarData.year;
  };
  
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* En-tête du calendrier */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[calendarData.month]} {calendarData.year}
            </h2>
          </div>
          
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            Aujourd'hui
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Mois suivant"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-1">
        {/* En-têtes des jours */}
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center">
            <span className="text-sm font-medium text-gray-500">{day}</span>
          </div>
        ))}
        
        {/* Jours du calendrier */}
        <AnimatePresence mode="wait">
          {calendarData.calendarDays.map((date, index) => {
            const sessionsForDate = getSessionsForDate(date);
            const hasActivities = sessionsForDate.length > 0;
            const isCurrentMonthDate = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            
            return (
              <motion.div
                key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`
                  relative min-h-24 p-2 border border-gray-100 rounded-lg transition-all duration-200 hover:bg-gray-50
                  ${!isCurrentMonthDate ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                  ${isTodayDate ? 'ring-2 ring-green-500 bg-green-50' : ''}
                  ${hasActivities && isCurrentMonthDate ? 'cursor-pointer hover:shadow-md' : ''}
                `}
                onClick={() => {
                  if (hasActivities && sessionsForDate[0] && onSessionClick) {
                    onSessionClick(sessionsForDate[0]);
                  }
                }}
              >
                {/* Numéro du jour */}
                <div className="flex items-center justify-between">
                  <span className={`
                    text-sm font-medium
                    ${isTodayDate ? 'text-green-700 font-bold' : ''}
                    ${!isCurrentMonthDate ? 'text-gray-400' : 'text-gray-900'}
                  `}>
                    {date.getDate()}
                  </span>
                  
                  {/* Indicateur d'activité */}
                  {hasActivities && isCurrentMonthDate && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium text-green-600">
                        {sessionsForDate.length}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Liste des activités */}
                {hasActivities && isCurrentMonthDate && (
                  <div className="mt-1 space-y-1">
                    {sessionsForDate.slice(0, 2).map((session, sessionIndex) => (
                      <div
                        key={session.id}
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded truncate"
                        title={`${session.totalExercises} exercices${session.notes ? ` - ${session.notes}` : ''}`}
                      >
                        {session.totalExercises} exercice{session.totalExercises > 1 ? 's' : ''}
                      </div>
                    ))}
                    
                    {/* Indicateur s'il y a plus d'activités */}
                    {sessionsForDate.length > 2 && (
                      <div className="text-xs text-green-600 font-medium">
                        +{sessionsForDate.length - 2} autre{sessionsForDate.length - 2 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Légende */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
          <span>Séance d'entraînement</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-green-500 rounded"></div>
          <span>Aujourd'hui</span>
        </div>
      </div>
    </div>
  );
}
