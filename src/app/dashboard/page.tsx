"use client";

import { motion } from "framer-motion";
import { ArrowRight, Grid3X3, LayoutGrid, LayoutList } from "lucide-react";
import Link from "next/link";
import { appModules } from "@/config/modules";
import { useFilterPersistence } from "@/hooks/useFilterPersistence";
import { AppHeader } from "@/components/AppHeader";

export default function Dashboard() {
  const { selectedViewMode, updateFilter } = useFilterPersistence("dashboard-view", {
    selectedViewMode: "cards",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AppHeader
        title="AppSuite"
        icon={Grid3X3}
        iconColor="text-blue-600"
        currentModule="dashboard"
        maxWidth="max-w-7xl"
      />

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

        {/* Toggle Vue */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => updateFilter("selectedViewMode", "cards")}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedViewMode === "cards"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Vue détaillée"
            >
              <LayoutList size={16} className="sm:mr-2" />
              <span className="hidden sm:inline">Détaillée</span>
            </button>
            <button
              onClick={() => updateFilter("selectedViewMode", "simple")}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedViewMode === "simple"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Vue simple"
            >
              <LayoutGrid size={16} className="sm:mr-2" />
              <span className="hidden sm:inline">Simple</span>
            </button>
          </div>
        </div>

        {/* Grille des outils */}
        {selectedViewMode === "simple" ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
            {appModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="cursor-pointer"
              >
                <Link href={module.path}>
                  <div
                    className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border border-gray-100 ${module.theme.bgFaint} hover:shadow-md transition-all duration-200 hover:scale-105 group text-center h-full aspect-square`}
                  >
                    <div className={`p-2.5 sm:p-3 rounded-xl bg-white ${module.theme.text} mb-2 sm:mb-3 shadow-sm`}>
                      <module.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                      {module.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="cursor-pointer"
              >
                <Link href={module.path}>
                  <div
                    className={`h-full p-6 rounded-xl border border-gray-100 ${module.theme.bgFaint} hover:shadow-lg transition-all duration-200 hover:scale-105 group relative`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-3 rounded-lg bg-white ${module.theme.text}`}
                      >
                        <module.icon size={24} />
                      </div>
                      <ArrowRight
                        className={`${module.theme.text} opacity-0 group-hover:opacity-100 transition-opacity`}
                        size={20}
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {module.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
