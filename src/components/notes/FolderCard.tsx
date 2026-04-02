"use client";

import { motion } from "framer-motion";
import { NoteFolder } from "@/types/notes";

interface FolderCardProps {
  folder: NoteFolder;
  index: number;
  onClick?: (folder: NoteFolder) => void;
}

export function FolderCard({ folder, index, onClick }: FolderCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick?.(folder)}
      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
    >
      {/* Folder Icon SVG */}
      <div className="relative w-20 h-16">
        {/* Folder tab (the small flap on top) */}
        <svg
          viewBox="0 0 80 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md group-hover:drop-shadow-lg transition-all"
        >
          {/* Back panel */}
          <rect
            x="0"
            y="8"
            width="80"
            height="56"
            rx="6"
            fill={folder.color}
            opacity="0.85"
          />
          {/* Tab */}
          <path
            d="M0 14C0 10.6863 2.68629 8 6 8H28L34 0H6C2.68629 0 0 2.68629 0 6V14Z"
            fill={folder.color}
            opacity="0.95"
          />
          {/* Front panel (slightly lighter) */}
          <rect
            x="0"
            y="16"
            width="80"
            height="48"
            rx="6"
            fill={folder.color}
          />
          {/* Subtle highlight on top of front panel */}
          <rect
            x="0"
            y="16"
            width="80"
            height="6"
            rx="3"
            fill="white"
            opacity="0.2"
          />
        </svg>

        {/* Note count badge */}
        {folder.noteCount !== undefined && folder.noteCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {folder.noteCount}
          </div>
        )}
      </div>

      {/* Folder name */}
      <p className="text-sm font-medium text-gray-800 text-center truncate w-full max-w-[100px]">
        {folder.name}
      </p>
    </motion.button>
  );
}
