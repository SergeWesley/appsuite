"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WorkoutStats as WorkoutStatsType } from "@/types/workout-session";
import { Activity, TrendingUp, Calendar, Target, ChevronDown } from "lucide-react";
import { useFilterPersistence } from "@/hooks/useFilterPersistence";

interface WorkoutStatsProps {
  stats: WorkoutStatsType;
}

export function WorkoutStats({ stats }: WorkoutStatsProps) {
  const statCards = [
    {
      id: "total-sessions",
      title: "Séances totales",
      value: stats.totalSessions,
      icon: Activity,
      color: "blue",
    },
    {
      id: "this-week",
      title: "Cette semaine",
      value: stats.sessionsThisWeek,
      icon: Calendar,
      color: "green",
    },
    {
      id: "this-month",
      title: "Ce mois",
      value: stats.sessionsThisMonth,
      icon: TrendingUp,
      color: "purple",
    },
    {
      id: "avg-exercises",
      title: "Exercices par séance",
      value: Math.round(stats.averageExercisesPerSession * 10) / 10,
      icon: Target,
      color: "orange",
    },
  ];

  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100",
    },
  };

  const { isStatsOpen, updateFilter } = useFilterPersistence("tracker-filters", {
    isStatsOpen: false,
  });

  return (
    <div className="mb-8">
      {/* En-tête cliquable */}
      <button
        onClick={() => updateFilter("isStatsOpen", !isStatsOpen)}
        className="flex items-center justify-between w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200"
      >
        <span className="text-lg font-semibold text-gray-800">
          Statistiques
        </span>
        <ChevronDown
          className={`h-5 w-5 text-gray-600 transform transition-transform duration-300 ${
            isStatsOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Contenu collapsible */}
      <AnimatePresence initial={false}>
        {isStatsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-4">
              {statCards.map((stat, index) => {
                const colorClass =
                  colorClasses[stat.color as keyof typeof colorClasses];
                const IconComponent = stat.icon;

                return (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-xl shadow-sm border ${colorClass.border} p-4`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${colorClass.bg}`}>
                        <IconComponent
                          size={20}
                          className={colorClass.text}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
