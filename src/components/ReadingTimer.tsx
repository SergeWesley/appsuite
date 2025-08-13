'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Clock, BookOpen, X } from 'lucide-react';
import { Book } from '@/types/book';
import { ReadingSessionFormData } from '@/types/reading-session';
import { useBooksWithSessions } from '@/hooks/useBooksWithSessions';
import { useTimerContext } from './TimerProvider';

interface ReadingTimerProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

export function ReadingTimer({ book, isOpen, onClose }: ReadingTimerProps) {
  const {
    formatDuration,
    getBookStats,
    refreshBooks,
    stopSession
  } = useBooksWithSessions();

  const {
    isTimerActive,
    getFormattedTime,
    startTimer,
    stopTimer,
    loading: timerLoading,
    error: timerError
  } = useTimerContext();

  const [sessionData, setSessionData] = useState<ReadingSessionFormData>({
    notes: '',
    pagesRead: undefined,
  });
  const [showStopForm, setShowStopForm] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const isActive = isTimerActive(book.id);
  const bookStats = getBookStats(book.id);
  const currentTime = getFormattedTime(book.id);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await startTimer(book.id);
    } catch (error) {
      console.error('Erreur lors du démarrage du timer:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = () => {
    if (isActive) {
      setShowStopForm(true);
    }
  };

  const handleConfirmStop = async () => {
    setIsStopping(true);
    try {
      // Utiliser stopSession qui déclenche automatiquement la synchronisation
      const session = await stopSession(book.id, sessionData);
      const timerSuccess = await stopTimer(book.id, sessionData.notes, sessionData.pagesRead);

      if (session && timerSuccess) {
        setShowStopForm(false);
        setSessionData({ notes: '', pagesRead: undefined });

        // Double sécurité : rafraîchir les livres même si la synchronisation automatique échoue
        setTimeout(() => {
          refreshBooks();
        }, 300);
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du timer:', error);
    } finally {
      setIsStopping(false);
    }
  };

  const handleCancelStop = () => {
    setShowStopForm(false);
    setSessionData({ notes: '', pagesRead: undefined });
  };


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Session de lecture</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Book info */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
            {book.coverUrl && (
              <img
                src={book.coverUrl}
                alt={`Couverture de ${book.title}`}
                className="w-12 h-16 object-cover rounded-lg shadow-sm"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
              <p className="text-sm text-gray-600">{book.author}</p>
            </div>
          </div>

          {!showStopForm ? (
            <>
              {/* Timer display */}
              <div className="text-center mb-8">
                <div className="text-5xl font-mono font-bold text-gray-900 mb-2 min-h-[4rem] flex items-center justify-center">
                  {isActive ? (
                    <motion.div
                      key={currentTime}
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="text-green-600"
                    >
                      {currentTime}
                    </motion.div>
                  ) : (
                    <span className="text-gray-400">00:00:00</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {isActive ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Session en cours...
                    </span>
                  ) : (
                    'Prêt à commencer'
                  )}
                </p>
                {timerError && (
                  <p className="text-sm text-red-600 mt-2">
                    {timerError}
                  </p>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4 mb-6">
                {!isActive ? (
                  <button
                    onClick={handleStart}
                    disabled={isStarting || timerLoading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {isStarting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play size={20} />
                    )}
                    {isStarting ? 'Démarrage...' : 'Démarrer'}
                  </button>
                ) : (
                  <button
                    onClick={handleStop}
                    disabled={isStopping}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Square size={20} />
                    Arrêter
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen size={16} />
                  Statistiques
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Sessions totales:</span>
                    <div className="font-semibold">{bookStats.totalSessions}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Temps total:</span>
                    <div className="font-semibold">
                      {formatDuration(bookStats.totalReadingTime)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Temps moyen:</span>
                    <div className="font-semibold">
                      {formatDuration(Math.round(bookStats.averageSessionTime))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Pages lues:</span>
                    <div className="font-semibold">{bookStats.totalPagesRead}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Stop form */
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Terminer la session</h3>
              <p className="text-sm text-gray-600">
                Temps de lecture: <span className="font-semibold text-green-600">{currentTime}</span>
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pages lues (optionnel)
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre de pages"
                  value={sessionData.pagesRead || ''}
                  onChange={(e) => setSessionData({
                    ...sessionData,
                    pagesRead: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Vos impressions sur cette session..."
                  value={sessionData.notes || ''}
                  onChange={(e) => setSessionData({
                    ...sessionData,
                    notes: e.target.value
                  })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleConfirmStop}
                  disabled={isStopping}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isStopping ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  {isStopping ? 'Arrêt...' : 'Terminer'}
                </button>
                <button
                  onClick={handleCancelStop}
                  disabled={isStopping}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
