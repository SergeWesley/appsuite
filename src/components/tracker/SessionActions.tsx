"use client";

import { motion } from "framer-motion";
import { Edit, Copy, Trash2 } from "lucide-react";

interface SessionActionsProps {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function SessionActions({
  onEdit,
  onDuplicate,
  onDelete,
}: SessionActionsProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEdit}
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
      >
        <Edit size={16} className="sm:mr-2" />
        <div className="hidden sm:block">Modifier</div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDuplicate}
        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
      >
        <Copy size={16} className="sm:mr-2" />
        <div className="hidden sm:block">Dupliquer</div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDelete}
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
      >
        <Trash2 size={16} className="sm:mr-2" />
        <div className="hidden sm:block">Supprimer</div>
      </motion.button>
    </div>
  );
}
