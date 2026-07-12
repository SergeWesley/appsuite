import { useState, useCallback, useRef } from 'react';

export interface NoteState {
  title: string;
  content: string;
  instances: Record<string, any>[];
}

export function useNoteHistory(initialState: NoteState) {
  const MAX_HISTORY_LENGTH = 50;

  const [past, setPast] = useState<NoteState[]>([]);
  const [future, setFuture] = useState<NoteState[]>([]);
  const lastPushTime = useRef<number>(0);
  const currentRef = useRef<NoteState>(initialState);

  // Maintient une référence à jour de l'état courant pour ne pas avoir à le passer en dépendance partout
  const updateCurrentRef = useCallback((state: NoteState) => {
    currentRef.current = state;
  }, []);

  // Ajoute l'état précédent à l'historique
  const pushHistory = useCallback((currentState: NoteState, force = false) => {
    const now = Date.now();
    // Force est true pour les actions immédiates (ajout/suppression dans un tableau)
    // Sinon on debounce (throttle) à 1 seconde pour éviter une entrée par caractère tapé
    if (force || now - lastPushTime.current > 1000) {
      setPast((prev) => {
        const newPast = [...prev, currentState];
        // On limite la taille pour ne pas saturer la mémoire du navigateur
        if (newPast.length > MAX_HISTORY_LENGTH) {
          return newPast.slice(newPast.length - MAX_HISTORY_LENGTH);
        }
        return newPast;
      });
      setFuture([]); // Toute nouvelle action vide le futur (redo)
      lastPushTime.current = now;
    }
  }, []);

  const undo = useCallback((): NoteState | null => {
    if (past.length === 0) return null;
    const newPast = [...past];
    const previous = newPast.pop()!;
    
    setPast(newPast);
    setFuture((prev) => [currentRef.current, ...prev]);
    lastPushTime.current = Date.now(); // Réinitialise le throttle
    return previous;
  }, [past]);

  const redo = useCallback((): NoteState | null => {
    if (future.length === 0) return null;
    const newFuture = [...future];
    const next = newFuture.shift()!;
    
    setPast((prev) => [...prev, currentRef.current]);
    setFuture(newFuture);
    lastPushTime.current = Date.now(); // Réinitialise le throttle
    return next;
  }, [future]);

  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
    lastPushTime.current = 0;
  }, []);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return { 
    pushHistory, 
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    updateCurrentRef, 
    clearHistory 
  };
}
