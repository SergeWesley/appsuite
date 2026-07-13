"use client";

import { useFilterPersistence } from "@/hooks/useFilterPersistence";
import { AnimatePresence, motion } from "framer-motion";
import { Film, Play, CheckCircle, Clock, Heart, ChevronDown } from "lucide-react";
interface MediaStatsProps {
  total: number;
  watching: number;
  completed: number;
  toWatch: number;
  wishlist: number;
}

export function MediaStats({
  total,
  watching,
  completed,
  toWatch,
  wishlist,
}: MediaStatsProps) {
  const stats = [
    {
      label: "Total",
      value: total,
      icon: Film,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
    {
      label: "En cours",
      value: watching,
      icon: Play,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "Terminés",
      value: completed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "À voir",
      value: toWatch,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "Souhaits",
      value: wishlist,
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
  ];
  const { isStatsOpen, updateFilter } = useFilterPersistence("watcher-filters", {
    isStatsOpen: false
  });

  return (
    <div className="mb-8">
      {/* En-tête cliquable */}
      <button
        onClick={() => {
          updateFilter("isStatsOpen", !isStatsOpen)
        }}
        className="flex items-center justify-between w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200"
      >
        <span className="text-lg font-semibold text-gray-800">Statistiques</span>
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 mb-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon size={20} className={stat.color} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
