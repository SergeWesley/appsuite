'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Media } from '@/types/media';
import { X, Play, Square, Clock, Film, Tv } from 'lucide-react';

interface WatchingTimerProps {
  media: Media;
  isOpen: boolean;
  onClose: () => void;
  formatDuration?: (seconds: number) => string;
  getMediaStats?: (mediaId: string) => any;
  stopSession?: (mediaId: string, sessionData?: any) => Promise<any>;
  onSessionStopped?: () => void;
  startSession?: (mediaId: string, episode?: number, season?: number) => Promise<any>;
  isSessionActive?: (mediaId: string) => boolean;
  getCurrentSessionTime?: (mediaId: string) => number;
}

export function WatchingTimer({
  media,
  isOpen,
  onClose,
  formatDuration,
  stopSession,
  onSessionStopped,
  startSession,
  isSessionActive,
  getCurrentSessionTime
}: WatchingTimerProps) {
  const [sessionNotes, setSessionNotes] = useState('');
  const [episodeWatched, setEpisodeWatched] = useState<number | undefined>(undefined);
  const [seasonWatched, setSeasonWatched] = useState<number | undefined>(undefined);

  // Utiliser les hooks pour déterminer l'état
  const isRunning = isSessionActive ? isSessionActive(media.id) : false;
  const elapsedTime = getCurrentSessionTime ? getCurrentSessionTime(media.id) : 0;

  const formatTime = (seconds: number): string => {
    if (formatDuration) {
      return formatDuration(seconds);
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };

  const handleStart = async () => {
    if (!isRunning && startSession) {
      await startSession(media.id, episodeWatched, seasonWatched);
    }
  };

  const handleStop = async () => {
    if (isRunning && stopSession) {
      await stopSession(media.id, {
        notes: sessionNotes,
        episodeWatched,
        seasonWatched,
      });

      if (onSessionStopped) {
        await onSessionStopped();
      }
    }
    onClose();
  };

  const handleReset = () => {
    setSessionNotes('');
    setEpisodeWatched(undefined);
    setSeasonWatched(undefined);
  };

  const isSeriesType = media.type === 'series' || media.type === 'anime';

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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {media.type === 'movie' ? (
                    <Film className="h-6 w-6 text-purple-600" />
                  ) : (
                    <Tv className="h-6 w-6 text-purple-600" />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                      {media.title}
                    </h2>
                    <p className="text-sm text-gray-600">Session de visionnage</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
                  {formatTime(elapsedTime)}
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                  <Clock size={14} />
                  <span>Temps écoulé</span>
                </div>
              </div>

              {/* Episode/Season Info for Series */}
              {isSeriesType && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Épisode en cours
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Saison
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={seasonWatched || ''}
                        onChange={(e) => setSeasonWatched(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Épisode
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={episodeWatched || ''}
                        onChange={(e) => setEpisodeWatched(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center gap-3 mb-6">
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play size={18} />
                    Démarrer
                  </button>
                ) : (
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Square size={18} />
                    Arrêter
                  </button>
                )}
              </div>

              {/* Session Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes de session
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Ajoutez vos impressions, remarques..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Fermer
                </button>
              </div>

              {/* Quick Stats */}
              {elapsedTime > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-purple-50 rounded-lg"
                >
                  <div className="text-sm text-purple-700">
                    <p className="font-medium">Session actuelle</p>
                    <p>
                      Durée: {formatTime(elapsedTime)}
                      {isSeriesType && episodeWatched && (
                        <span> • S{seasonWatched || 1}E{episodeWatched}</span>
                      )}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
