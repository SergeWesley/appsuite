"use client";

import { useEffect, useRef } from "react";

export interface ShortcutConfig {
  key: string;               // La touche à presser (ex: "Enter", "Escape", "k")
  ctrlKey?: boolean;         // Requis : Ctrl
  metaKey?: boolean;         // Requis : Cmd (Mac) / Win (PC)
  shiftKey?: boolean;        // Requis : Shift
  altKey?: boolean;          // Requis : Alt / Option
  action: (e: KeyboardEvent) => void; // L'action à exécuter
  enabled?: boolean;         // Si false, le raccourci est ignoré (pratique pour les modales)
  preventDefault?: boolean;  // Par défaut true (empêche l'action par défaut du navigateur)
  stopPropagation?: boolean; // Par défaut true (empêche la propagation de l'événement)
}

export function useKeyboardShortcut(shortcuts: ShortcutConfig[]) {
  // On utilise un ref pour toujours avoir accès aux dernières versions des actions
  // sans avoir à réattacher l'écouteur d'événement à chaque rendu React
  const shortcutsRef = useRef(shortcuts);
  
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue;

        // Vérification de la combinaison de touches (e.key change sur Mac quand on presse Option)
        // On vérifie donc e.key ou bien e.code (qui correspond à la touche physique, ex: "KeyN")
        const normalizedKey = shortcut.key.toLowerCase();
        const expectedCode = normalizedKey.length === 1 && /[a-z]/.test(normalizedKey) 
          ? `key${normalizedKey}` 
          : null;
          
        const keyMatch = 
          e.key.toLowerCase() === normalizedKey || 
          (expectedCode && e.code.toLowerCase() === expectedCode);
          
        const ctrlMatch = !!shortcut.ctrlKey === e.ctrlKey;
        const metaMatch = !!shortcut.metaKey === e.metaKey;
        const shiftMatch = !!shortcut.shiftKey === e.shiftKey;
        const altMatch = !!shortcut.altKey === e.altKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          if (shortcut.preventDefault !== false) e.preventDefault();
          if (shortcut.stopPropagation !== false) e.stopPropagation();
          
          shortcut.action(e);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}
