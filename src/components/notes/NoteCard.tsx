"use client";

import { motion } from "framer-motion";
import { Note } from "@/types/notes";
import { FileText } from "lucide-react";

interface NoteCardProps {
  note: Note;
  index: number;
  onClick?: (note: Note) => void;
}

export function NoteCard({ note, index, onClick }: NoteCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get a preview of the content (first 100 chars, strip any markdown)
  const preview = note.content
    .replace(/[#*_~`>\-\[\]()]/g, "")
    .trim()
    .slice(0, 120);

  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(note)}
      className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all active:bg-gray-50"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-50 rounded-lg mt-0.5 flex-shrink-0">
          <FileText size={16} className="text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {note.title || "Sans titre"}
          </h3>
          {preview && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {preview}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {formatDate(note.dateUpdated)}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
