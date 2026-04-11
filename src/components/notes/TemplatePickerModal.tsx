"use client";

import { motion, AnimatePresence } from "framer-motion";
import { NoteTemplate } from "@/types/notes";
import { FileText, LayoutTemplate, X } from "lucide-react";

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: NoteTemplate[];
  onSelect: (templateId: string | null) => void;
}

export function TemplatePickerModal({
  isOpen,
  onClose,
  templates,
  onSelect,
}: TemplatePickerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Créer une note
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Choisissez un modèle ou créez une note libre.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Options */}
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {/* Note libre */}
              <button
                onClick={() => onSelect(null)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all text-left group"
              >
                <div className="p-2.5 bg-gray-100 rounded-xl group-hover:bg-amber-100 transition-colors">
                  <FileText size={22} className="text-gray-500 group-hover:text-amber-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">Note libre</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pas de structure — texte libre uniquement.
                  </p>
                </div>
              </button>

              {/* Templates */}
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelect(template.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all text-left group"
                >
                  <div className="p-2.5 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                    <LayoutTemplate size={22} className="text-amber-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{template.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {template.fields.length} champ{template.fields.length > 1 ? "s" : ""} 
                      {template.fields.length > 0 && (
                        <> — {template.fields.map(f => f.name).join(", ")}</>
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
