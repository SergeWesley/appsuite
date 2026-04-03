"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Film,
  ChevronRight,
  Activity,
  HomeIcon,
  StickyNote,
  Wallet,
} from "lucide-react";

interface NavigationMenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  description: string;
}

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentModule: "booker" | "watcher" | "tracker" | "notes" | "spender";
}

const modules: NavigationMenuItem[] = [
  {
    name: "Booker",
    path: "/booker",
    icon: BookOpen,
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    description: "Gérez votre bibliothèque de livres",
  },
  {
    name: "Tracker",
    path: "/tracker",
    icon: Activity,
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100",
    description: "Suivez vos séances de sport",
  },
  {
    name: "Watcher",
    path: "/watcher",
    icon: Film,
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100",
    description: "Suivez vos films et séries",
  },
  {
    name: "Notes",
    path: "/notes",
    icon: StickyNote,
    color: "text-amber-600",
    bgColor: "bg-amber-50 hover:bg-amber-100",
    description: "Organisez vos notes et idées",
  },
  {
    name: "Spender",
    path: "/spender",
    icon: Wallet,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 hover:bg-emerald-100",
    description: "Gérez vos dépenses et abonnements",
  },
];

export function NavigationMenu({
  isOpen,
  onClose,
  currentModule,
}: NavigationMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

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
  const availableModules = modules.filter(
    (module) => module.path !== `/${currentModule}`,
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
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed top-16 left-4 sm:left-8 z-50 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
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
                    Tableu de bord
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

              {availableModules.map((module, index) => {
                const IconComponent = module.icon;
                return (
                  <motion.button
                    key={module.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNavigation(module.path)}
                    className={`w-full px-4 py-3 flex items-center group text-left transition-colors ${module.bgColor}`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg ${module.bgColor.replace("hover:", "")} flex items-center justify-center`}
                    >
                      <IconComponent size={20} className={module.color} />
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
