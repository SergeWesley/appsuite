"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Heart,
  Star,
  TrendingUp,
} from "lucide-react";

interface StatsProps {
  total: number;
  reading: number;
  completed: number;
  toRead: number;
  wishlist: number;
  averageRating: number;
}

export function Stats({
  total,
  reading,
  completed,
  toRead,
  wishlist,
  averageRating,
}: StatsProps) {
  const stats = [
    {
      label: "Total",
      value: total,
      icon: BookOpen,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      label: "En cours",
      value: reading,
      icon: Clock,
      color: "bg-orange-500",
      textColor: "text-orange-600",
    },
    {
      label: "Terminés",
      value: completed,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      label: "À lire",
      value: toRead,
      icon: BookOpen,
      color: "bg-gray-500",
      textColor: "text-gray-600",
    },
    {
      label: "Souhaits",
      value: wishlist,
      icon: Heart,
      color: "bg-red-400",
      textColor: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
              <stat.icon size={20} className={stat.textColor} />
            </div>
          </div>
        </motion.div>
      ))}

      {averageRating > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-2 md:col-span-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Note moyenne</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-yellow-600">
                  {averageRating.toFixed(1)}
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={`${
                        star <= Math.round(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-yellow-500 bg-opacity-10">
              <TrendingUp size={20} className="text-yellow-600" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
