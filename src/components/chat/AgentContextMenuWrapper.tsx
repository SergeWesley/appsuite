"use client";

import React from "react";
import { useAgent } from "./AgentProvider";

interface AgentContextMenuWrapperProps {
  children: React.ReactNode;
  initialMessage?: string;
  systemContext?: string;
  className?: string;
}

/**
 * Un composant utilitaire qui enveloppe n'importe quel élément.
 * Au clic droit (ou appui long sur mobile), il ouvre l'assistant IA
 * avec le contexte pré-configuré.
 */
export function AgentContextMenuWrapper({
  children,
  initialMessage,
  systemContext,
  className = "",
}: AgentContextMenuWrapperProps) {
  const { openAgent } = useAgent();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openAgent({ initialMessage, systemContext });
  };

  return (
    <div onContextMenu={handleContextMenu} className={className}>
      {children}
    </div>
  );
}
