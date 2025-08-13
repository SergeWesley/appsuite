'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useTimer } from '@/hooks/useTimer';

// Créer le contexte pour les timers
const TimerContext = createContext<ReturnType<typeof useTimer> | null>(null);

interface TimerProviderProps {
  children: ReactNode;
}

export function TimerProvider({ children }: TimerProviderProps) {
  const timerData = useTimer();
  
  return (
    <TimerContext.Provider value={timerData}>
      {children}
    </TimerContext.Provider>
  );
}

// Hook pour utiliser le contexte des timers
export function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
}
