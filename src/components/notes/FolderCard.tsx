"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { NoteFolder } from "@/types/notes";
import { Folder, StickyNote, Settings, MoveRight, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useContextMenu } from "@/hooks/useContextMenu";
import { ContextMenu, ContextMenuItem } from "@/components/ui/ContextMenu";

interface FolderCardProps {
  folder: NoteFolder;
  index: number;
  subfolderCount?: number;
  isSelected?: boolean;
  totalFolders?: number;
  onClick?: (folder: NoteFolder, e: React.MouseEvent) => void;
  onConfig?: (folder: NoteFolder) => void;
  onMove?: (folder: NoteFolder) => void;
  onMoveUp?: (folder: NoteFolder) => void;
  onMoveDown?: (folder: NoteFolder) => void;
  onDelete?: (folder: NoteFolder) => void;
}

export function FolderCard({ 
  folder, 
  index, 
  subfolderCount = 0, 
  isSelected = false, 
  totalFolders = 1,
  onClick, 
  onConfig, 
  onMove, 
  onMoveUp,
  onMoveDown,
  onDelete 
}: FolderCardProps) {
  const { contextMenu, setContextMenu, contextMenuHandlers } = useContextMenu();

  const handleConfig = () => {
    setContextMenu(null);
    if (onConfig) {
      onConfig(folder);
    }
  };

  const handleMove = () => {
    setContextMenu(null);
    if (onMove) {
      onMove(folder);
    }
  };

  const handleDelete = () => {
    setContextMenu(null);
    if (onDelete) {
      onDelete(folder);
    }
  };

  const handleMoveUp = () => {
    setContextMenu(null);
    if (onMoveUp) onMoveUp(folder);
  };

  const handleMoveDown = () => {
    setContextMenu(null);
    if (onMoveDown) onMoveDown(folder);
  };

  const hasNotes = folder.noteCount !== undefined && folder.noteCount > 0;
  const hasSubfolders = subfolderCount > 0;

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={(e) => {
          if (!contextMenu) {
            onClick?.(folder, e);
          }
        }}
        {...contextMenuHandlers}
        className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-colors group select-none ${
          isSelected ? "bg-amber-50 ring-2 ring-amber-500" : "hover:bg-gray-50"
        }`}
      >
        {/* Folder Icon SVG */}
        <div className="relative w-16 h-12">
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

          {/* Counters badges */}
          {(hasNotes || hasSubfolders) && (
            <div className="absolute -top-2 -right-2 flex flex-col gap-1">
              {hasSubfolders && (
                <div className="flex items-center gap-1 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  <Folder size={10} strokeWidth={2.5} /> {subfolderCount}
                </div>
              )}
              {hasNotes && (
                <div className="flex items-center gap-1 bg-gray-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  <StickyNote size={10} strokeWidth={2.5} /> {folder.noteCount}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Folder name */}
        <p className="text-sm font-medium text-gray-800 text-center truncate w-full max-w-[100px]">
          {folder.name}
        </p>
      </motion.button>

      <ContextMenu position={contextMenu} onClose={() => setContextMenu(null)}>
        {onMoveUp && onMoveDown && (
          <>
            <ContextMenuItem
              onClick={handleMoveUp}
              icon={<ArrowUp size={16} />}
              label="Déplacer vers le haut"
              disabled={index === 0}
            />
            <ContextMenuItem
              onClick={handleMoveDown}
              icon={<ArrowDown size={16} />}
              label="Déplacer vers le bas"
              disabled={index === totalFolders - 1}
            />
          </>
        )}
        <ContextMenuItem
          onClick={handleMove}
          icon={<MoveRight size={16} />}
          label="Changer de dossier"
        />
        <ContextMenuItem
          onClick={handleConfig}
          icon={<Settings size={16} />}
          label="Paramétrer"
        />
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
