"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronRight, HomeIcon, Sparkles } from "lucide-react";
import { useAgent } from "./chat/AgentProvider";
import { appModules } from "@/config/modules";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentModule:
    | "booker"
    | "watcher"
    | "tracker"
    | "notes"
    | "spender"
    | "cooker"
    | "browser"
    | "dashboard";
}

export function NavigationMenu({
  isOpen,
  onClose,
  currentModule,
}: NavigationMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const { openAgent } = useAgent();
  const isAdmin = useIsAdmin();

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fermer le menu avec Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  // Filtrer les modules pour ne pas afficher le module actuel
  const availableModules = appModules.filter(
    (module) => module.id !== currentModule,
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-25 z-50"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed top-16 left-4 sm:left-8 z-[60] w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900">Navigation</h3>
              <p className="text-xs text-gray-500 mt-1">
                Accédez aux autres modules
              </p>
            </div>

            {/* Menu items */}
            <div className="py-2">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
                onClick={() => router.push("/dashboard")} // ou '/' si tu préfères
                className="w-full px-4 py-3 flex items-center group text-left transition-colors bg-gray-100 hover:bg-gray-200"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center">
                  <HomeIcon size={20} className="text-gray-700" />
                </div>

                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    Tableau de bord
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Retour à la page principale
                  </p>
                </div>

                <ChevronRight
                  size={16}
                  className="text-gray-400 group-hover:text-gray-600 transition-colors"
                />
              </motion.button>

              {isAdmin && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  onClick={() => {
                    openAgent({
                      systemContext: `Utilisateur navigue actuellement dans le module: ${currentModule}`,
                    });
                    onClose();
                  }}
                  className="w-full px-4 py-3 flex items-center group text-left transition-colors bg-amber-50 hover:bg-amber-100 mb-2 border-y border-amber-100"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Sparkles size={20} className="text-amber-600" />
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 flex items-center gap-2">
                      Assistant IA
                      <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-800 rounded-full">
                        Beta
                      </span>
                    </p>
                    <p className="text-xs text-amber-700/70 truncate">
                      Posez vos questions ou exécutez des actions
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    className="text-amber-400 group-hover:text-amber-600 transition-colors"
                  />
                </motion.button>
              )}

              {availableModules.map((module, index) => {
                const IconComponent = module.icon;
                const { theme } = module;
                return (
                  <motion.button
                    key={module.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNavigation(module.path)}
                    className={`w-full px-4 py-3 flex items-center group text-left transition-colors ${theme.bgFaint} ${theme.bgHoverLight}`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg ${theme.bgFaint} flex items-center justify-center`}
                    >
                      <IconComponent size={20} className={theme.textDark} />
                    </div>

                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                        {module.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {module.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={16}
                      className="text-gray-400 group-hover:text-gray-600 transition-colors"
                    />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
