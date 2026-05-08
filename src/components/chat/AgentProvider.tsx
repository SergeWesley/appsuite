"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

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

  const toggleAgent = () => {
    setIsOpen((open) => {
      if (open) {
        setTimeout(() => setOptions(null), 300);
        return false;
      } else {
        setOptions(null); // On s'assure qu'on part d'un contexte propre
        return true;
      }
    });
  };

  // Écouteur global pour le raccourci Cmd+K (Mac) / Ctrl+K (PC)
  useKeyboardShortcut([
    {
      key: "k",
      metaKey: true,
      enabled: isAdmin,
      action: toggleAgent,
    },
    {
      key: "k",
      ctrlKey: true,
      enabled: isAdmin,
      action: toggleAgent,
    },
  ]);

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
