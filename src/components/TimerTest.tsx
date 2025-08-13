'use client';

import React from 'react';
import { useTimer } from '@/hooks/useTimer';
import { useAuth } from '@/hooks/useAuth';

interface TimerTestProps {
  bookId: string;
}

export function TimerTest({ bookId }: TimerTestProps) {
  const { user } = useAuth();
  const {
    isTimerActive,
    getFormattedTime,
    startTimer,
    stopTimer,
    loading,
    error
  } = useTimer();

  const isActive = isTimerActive(bookId);
  const currentTime = getFormattedTime(bookId);

  if (!user) {
    return <div>Utilisateur non connecté</div>;
  }

  if (loading) {
    return <div>Chargement des timers...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-4">Test Timer - Livre {bookId}</h3>
      
      {error && (
        <div className="text-red-600 mb-4">
          Erreur: {error}
        </div>
      )}
      
      <div className="mb-4">
        <p>État: {isActive ? 'Actif' : 'Inactif'}</p>
        <p>Temps: {currentTime}</p>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => startTimer(bookId)}
          disabled={isActive}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
        >
          Démarrer
        </button>
        <button
          onClick={() => stopTimer(bookId)}
          disabled={!isActive}
          className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-400"
        >
          Arrêter
        </button>
      </div>
    </div>
  );
}
