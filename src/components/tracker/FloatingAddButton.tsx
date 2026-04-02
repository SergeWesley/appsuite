"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface FloatingAddButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  color?: string;
}

export function FloatingAddButton({
  onClick,
  loading = false,
  label = "Ajouter",
  color = "bg-green-600 hover:bg-green-700",
}: FloatingAddButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={loading}
      className={`fixed bottom-6 right-6 w-14 h-14 text-white rounded-full shadow-lg transition-colors flex items-center justify-center z-40 disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
      aria-label={label}
    >
      {loading ? (
        <div className="animate-spin h-6 w-6 border-2 border-white rounded-full border-t-transparent"></div>
      ) : (
        <Plus size={28} />
      )}
    </motion.button>
  );
}
