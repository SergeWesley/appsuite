"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NoteFolder } from "@/types/notes";
import { X, FolderOpen, ChevronRight, Home, MoveRight } from "lucide-react";

interface MoveFolderModalProps {
  isOpen: boolean;
  folder: NoteFolder | null;
  allFolders: NoteFolder[];
  onClose: () => void;
  onMove: (folderId: string, newParentId: string | null) => void;
}

export function MoveFolderModal({
  isOpen,
  folder,
  allFolders,
  onClose,
  onMove,
}: MoveFolderModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null | "root">(
    null,
  );
  const [moving, setMoving] = useState(false);

  // Get all descendant IDs of a folder (to exclude them as targets)
  const getDescendantIds = (folderId: string): string[] => {
    const children = allFolders.filter((f) => f.parentId === folderId);
    const ids: string[] = [];
    for (const child of children) {
      ids.push(child.id);
      ids.push(...getDescendantIds(child.id));
    }
    return ids;
  };

  const excludedIds = useMemo(() => {
    if (!folder) return new Set<string>();
    return new Set([folder.id, ...getDescendantIds(folder.id)]);
  }, [folder, allFolders]);

  // Build a flat list with indentation levels for display
  const folderTree = useMemo(() => {
    const result: { folder: NoteFolder; depth: number }[] = [];

    const addChildren = (parentId: string | null | undefined, depth: number) => {
      const children = allFolders
        .filter((f) => (f.parentId || null) === parentId)
        .filter((f) => !excludedIds.has(f.id));
      for (const child of children) {
        result.push({ folder: child, depth });
        addChildren(child.id, depth + 1);
      }
    };

    addChildren(null, 0);
    return result;
  }, [allFolders, excludedIds]);

  const handleMove = async () => {
    if (!folder || selectedTarget === null) return;
    setMoving(true);
    const newParentId = selectedTarget === "root" ? null : selectedTarget;
    await onMove(folder.id, newParentId);
    setMoving(false);
    setSelectedTarget(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedTarget(null);
    onClose();
  };

  // Determine the current parent name
  const currentParentName = folder?.parentId
    ? allFolders.find((f) => f.id === folder.parentId)?.name || "Inconnu"
    : "Racine";

  if (!isOpen || !folder) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <MoveRight size={20} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Déplacer le dossier
                </h2>
                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                  {folder.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Current location */}
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
              Emplacement actuel
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Home size={14} />
              <span>{currentParentName}</span>
            </div>
          </div>

          {/* Destination List */}
          <div className="flex-1 overflow-y-auto p-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2 px-2">
              Choisir la destination
            </p>

            {/* Root option */}
            <button
              onClick={() => setSelectedTarget("root")}
              disabled={!folder.parentId} // Already at root
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-1 ${
                selectedTarget === "root"
                  ? "bg-amber-50 ring-2 ring-amber-400 text-amber-800"
                  : !folder.parentId
                    ? "text-gray-300 cursor-not-allowed"
                    : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Home size={16} className={selectedTarget === "root" ? "text-amber-600" : "text-gray-400"} />
              </div>
              <span className="font-medium text-sm">Racine (niveau principal)</span>
              {selectedTarget === "root" && (
                <ChevronRight size={16} className="ml-auto text-amber-500" />
              )}
            </button>

            {/* Folder list */}
            {folderTree.map(({ folder: targetFolder, depth }) => {
              const isCurrentParent =
                (folder.parentId || null) === targetFolder.id;
              const isSelected = selectedTarget === targetFolder.id;

              return (
                <button
                  key={targetFolder.id}
                  onClick={() => setSelectedTarget(targetFolder.id)}
                  disabled={isCurrentParent}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-1 ${
                    isSelected
                      ? "bg-amber-50 ring-2 ring-amber-400 text-amber-800"
                      : isCurrentParent
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-gray-50 text-gray-700"
                  }`}
                  style={{ paddingLeft: `${12 + depth * 20}px` }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: targetFolder.color + "20" }}
                  >
                    <FolderOpen
                      size={16}
                      style={{ color: targetFolder.color }}
                    />
                  </div>
                  <span className="font-medium text-sm truncate">
                    {targetFolder.name}
                  </span>
                  {isCurrentParent && (
                    <span className="ml-auto text-xs text-gray-300 flex-shrink-0">
                      Actuel
                    </span>
                  )}
                  {isSelected && (
                    <ChevronRight
                      size={16}
                      className="ml-auto text-amber-500 flex-shrink-0"
                    />
                  )}
                </button>
              );
            })}

            {folderTree.length === 0 && !folder.parentId && (
              <p className="text-sm text-gray-400 text-center py-6">
                Aucun dossier disponible comme destination.
              </p>
            )}
          </div>

          {/* Footer with action buttons */}
          <div className="p-4 border-t border-gray-100 flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleMove}
              disabled={selectedTarget === null || moving}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {moving ? (
                <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
              ) : (
                <>
                  <MoveRight size={16} />
                  Déplacer
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
