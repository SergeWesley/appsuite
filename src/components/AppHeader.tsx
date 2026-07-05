"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogOut, User, ArrowLeft, type LucideIcon } from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { NavigationMenu } from "@/components/NavigationMenu";

interface AppHeaderProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  currentModule:
    | "booker"
    | "watcher"
    | "tracker"
    | "notes"
    | "spender"
    | "cooker"
    | "browser"
    | "dashboard"
    | "forge"
    | "split";
  actions?: React.ReactNode;
  maxWidth?: string;
  onBack?: () => void;
  height?: string;
}

export function AppHeader({
  title,
  icon: Icon,
  iconColor = "text-gray-900",
  currentModule,
  actions,
  maxWidth = "max-w-[1600px]",
  onBack,
  height = "h-16",
}: AppHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signOut } = useAuthContext();
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  const isSplitMode = searchParams.get("mode") === "split";

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
          <div className={`flex items-center justify-between ${height}`}>
            <div className="flex items-center gap-2 min-w-0 flex-1 mr-4">
              {onBack && !isSplitMode && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-1"
                  aria-label="Retour"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
              )}
              {!isSplitMode ? (
                <button
                  onClick={() => setIsNavMenuOpen(true)}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-0 flex-1 text-left"
                  aria-label="Menu de navigation"
                >
                  {Icon && <Icon className={`h-8 w-8 ${iconColor}`} />}
                  <div className="flex items-center gap-2">
                    <h1
                      className={`${Icon ? "ml-3" : ""} text-xl font-semibold text-gray-900 truncate`}
                    >
                      {title}
                    </h1>
                  </div>
                </button>
              ) : (
                <div className="flex items-center p-2 min-w-0 flex-1 text-left gap-2">
                  {Icon && <Icon className={`h-6 w-6 ${iconColor}`} />}
                  <h1
                    className={`${Icon ? "ml-3" : ""} text-lg font-semibold text-gray-900 truncate`}
                  >
                    {title}
                  </h1>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              {actions && (
                <div className="flex items-center gap-2 sm:gap-4">
                  {actions}
                </div>
              )}

              {/* Menu utilisateur caché en mode split pour gagner de l'espace */}
              {!isSplitMode && (
                <Menu as="div" className="relative inline-block text-left">
                  <MenuButton className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <User size={20} />
                    <span className="hidden sm:block text-sm">
                      {user?.user_metadata?.name ||
                        user?.email ||
                        "Utilisateur"}
                    </span>
                  </MenuButton>

                  <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 focus:outline-none">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.user_metadata?.name || "Utilisateur"}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <MenuItem
                        as="button"
                        onClick={signOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100"
                      >
                        <LogOut size={16} />
                        Se déconnecter
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Menu de navigation global - Inactif en split */}
      {!isSplitMode && (
        <NavigationMenu
          isOpen={isNavMenuOpen}
          onClose={() => setIsNavMenuOpen(false)}
          currentModule={currentModule}
        />
      )}
    </>
  );
}
