"use client";

import { motion } from "framer-motion";
import { Note } from "@/types/notes";
import { FileText, Trash2 } from "lucide-react";
import { useContextMenu } from "@/hooks/useContextMenu";
import { ContextMenu, ContextMenuItem } from "@/components/ui/ContextMenu";

interface NoteCardProps {
  note: Note;
  index: number;
  onClick?: (note: Note) => void;
  onDelete?: (note: Note) => void;
}

export function NoteCard({ note, index, onClick, onDelete }: NoteCardProps) {
  const { contextMenu, setContextMenu, contextMenuHandlers } = useContextMenu();
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleDelete = () => {
    setContextMenu(null);
    if (onDelete) {
      onDelete(note);
    }
  };

  // Obtenir un aperçu du contenu (premiers 100 caractères, supprimer tout markdown)
  const preview = note.content
    .replace(/[#*_~`>\-\[\]()]/g, "")
    .trim()
    .slice(0, 120);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          if (!contextMenu) {
            onClick?.(note);
          }
        }}
        {...contextMenuHandlers}
        className="relative w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all active:bg-gray-50"
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

      <ContextMenu position={contextMenu} onClose={() => setContextMenu(null)}>
        <ContextMenuItem
          onClick={handleDelete}
          icon={<Trash2 size={16} />}
          label="Supprimer"
          danger
        />
      </ContextMenu>
    </>
  );
}
