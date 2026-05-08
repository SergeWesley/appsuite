"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export interface OpenAgentOptions {
  initialMessage?: string;
  systemContext?: string; // Peut être passé au backend via des headers ou un state
}

interface AgentContextType {
  isOpen: boolean;
  openAgent: (options?: OpenAgentOptions) => void;
  closeAgent: () => void;
  options: OpenAgentOptions | null;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenAgentOptions | null>(null);
  const isAdmin = useIsAdmin();

  const openAgent = (newOptions?: OpenAgentOptions) => {
    if (!isAdmin) return; // Accès refusé pour les non-admins
    setOptions(newOptions || null);
    setIsOpen(true);
  };

  const closeAgent = () => {
    setIsOpen(false);
    // On efface le contexte après un léger délai pour laisser l'animation de fermeture se faire
    setTimeout(() => setOptions(null), 300);
  };

  // Écouteur global pour le raccourci Cmd+K / Ctrl+K (admins seulement)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!isAdmin) return;
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => {
          if (open) {
            setTimeout(() => setOptions(null), 300);
            return false;
          } else {
            setOptions(null); // On s'assure qu'on part d'un contexte propre
            return true;
          }
        });
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isAdmin]);

  return (
    <AgentContext.Provider value={{ isOpen, openAgent, closeAgent, options }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgent doit être utilisé à l'intérieur d'un AgentProvider");
  }
  return context;
}
