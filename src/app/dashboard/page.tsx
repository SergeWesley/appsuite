"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  User,
  LogOut,
  ArrowRight,
  Grid3X3,
  Zap,
  Film,
} from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/components/AuthProvider";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  color: string;
  bgColor: string;
  available: boolean;
}

const tools: Tool[] = [
  {
    id: "booker",
    name: "Booker",
    description:
      "Gérez votre bibliothèque personnelle et suivez votre progression de lecture",
    icon: BookOpen,
    href: "/booker",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    available: true,
  },
  {
    id: "tracker",
    name: "Tracker",
    description: "Suivez vos habitudes et objectifs quotidiens",
    icon: Zap,
    href: "/tracker",
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-400",
    available: true,
  },
  {
    id: "watcher",
    name: "Watcher",
    description:
      "Gérer votre collection de films et séries, suivez vos visionnages",
    icon: Film,
    href: "/watcher",
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
    available: true,
  },
  // Outils futurs (à implémenter)
  {
    id: "notes",
    name: "Notes",
    description: "Prenez des notes et organisez vos idées",
    icon: Grid3X3,
    href: "#",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
    available: false,
  },
];

export default function Dashboard() {
  const { user, signOut } = useAuthContext();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Grid3X3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-900">
                  AppSuite
                </h1>
              </div>
            </div>

            {/* Menu utilisateur */}
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <User size={20} />
                <span className="hidden sm:block">
                  {user?.user_metadata?.name || user?.email || "Utilisateur"}
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Bienvenue dans votre suite d'outils
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Choisissez l'outil que vous souhaitez utiliser. Plus d'outils seront
            ajoutés prochainement !
          </motion.p>
        </div>

        {/* Grille des outils */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`${
                tool.available
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-60"
              }`}
            >
              {tool.available ? (
                <Link href={tool.href}>
                  <div
                    className={`h-full p-6 rounded-xl border-2 ${tool.bgColor} hover:shadow-lg transition-all duration-200 hover:scale-105 group`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-white ${tool.color}`}>
                        <tool.icon size={24} />
                      </div>
                      <ArrowRight
                        className={`${tool.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                        size={20}
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {tool.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              ) : (
                <div
                  className={`h-full p-6 rounded-xl border-2 ${tool.bgColor} relative`}
                >
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-500 text-white rounded-full">
                      Bientôt
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-lg bg-white ${tool.color} inline-block mb-4`}
                  >
                    <tool.icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Section d'information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Plus d'outils à venir
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Cette suite d'outils est en constante évolution. Nous ajouterons
              régulièrement de nouvelles fonctionnalités pour vous aider à être
              plus productif et organisé. Restez à l'écoute !
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
