"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
  fullPage?: boolean;
  color?: "green" | "amber" | "indigo" | "gray" | "blue";
}

/**
 * Un composant de chargement global qui recouvre l'écran.
 * Idéal pour les transitions de navigation ou les actions asynchrones longues.
 */
export function LoadingOverlay({
  isLoading,
  message = "Chargement en cours...",
  className = "",
  fullPage = false,
  color = "green",
}: LoadingOverlayProps) {
  // Définition des classes de couleur pour le composant de chargement
  const colorClasses = {
    green: "text-green-600 bg-green-400",
    amber: "text-amber-600 bg-amber-400",
    indigo: "text-indigo-600 bg-indigo-400",
    gray: "text-gray-600 bg-gray-400",
    blue: "text-blue-600 bg-blue-400",
  };
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[9999] flex items-center justify-center ${
            fullPage ? "bg-gray-50" : "bg-white/60 backdrop-blur-sm"
          } transition-all ${className}`}
        >

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center gap-4 max-w-xs w-full mx-4"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className={colorClasses[color].split(" ")[0]}
              >
                <Loader2 size={40} strokeWidth={2.5} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`absolute inset-0 ${colorClasses[color].split(" ")[1]} blur-xl opacity-20`}
              />
            </div>
            <p className="text-gray-900 font-semibold text-center">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
