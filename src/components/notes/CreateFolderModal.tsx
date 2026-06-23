"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NoteFolderFormData, FOLDER_COLORS } from "@/types/notes";
import { X, FolderPlus } from "lucide-react";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NoteFolderFormData) => void;
}

export function CreateFolderModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateFolderModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[0].value);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), color });
    setName("");
    setColor(FOLDER_COLORS[0].value);
  };

  const handleClose = () => {
    setName("");
    setColor(FOLDER_COLORS[0].value);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50">
                    <FolderPlus size={20} className="text-amber-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Nouveau dossier
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Preview */}
              <div className="flex justify-center">
                <div className="relative w-24 h-20">
                  <svg
                    viewBox="0 0 80 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-lg"
                  >
                    <rect
                      x="0"
                      y="8"
                      width="80"
                      height="56"
                      rx="6"
                      fill={color}
                      opacity="0.85"
                    />
                    <path
                      d="M0 14C0 10.6863 2.68629 8 6 8H28L34 0H6C2.68629 0 0 2.68629 0 6V14Z"
                      fill={color}
                      opacity="0.95"
                    />
                    <rect
                      x="0"
                      y="16"
                      width="80"
                      height="48"
                      rx="6"
                      fill={color}
                    />
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
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom du dossier
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Travail, Personnel, Idées..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur
                </label>
                <div className="flex flex-wrap gap-3">
                  {FOLDER_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={`w-9 h-9 rounded-full transition-all ${
                        color === c.value
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.value }}
                      aria-label={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="flex-1 px-4 py-3 text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
