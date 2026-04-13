"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Type, List, Hash, Calendar, CheckSquare, Palette, Star, Link, Euro, Table } from "lucide-react";
import { CustomFieldDefinition, CustomFieldType } from "@/types/notes";

export const TYPE_CONFIGS: Record<CustomFieldType, { label: string; icon: React.ElementType }> = {
  text: { label: "Texte court", icon: Type },
  textarea: { label: "Texte long", icon: List },
  number: { label: "Nombre", icon: Hash },
  currency: { label: "Monnaie", icon: Euro },
  checkbox: { label: "Case à cocher", icon: CheckSquare },
  date: { label: "Date", icon: Calendar },
  select: { label: "Liste déroulante", icon: List },
  color: { label: "Couleur", icon: Palette },
  rating: { label: "Note (étoiles)", icon: Star },
  url: { label: "Lien web", icon: Link },
  table: { label: "Tableau de données", icon: Table },
};

interface FieldEditorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: CustomFieldDefinition) => void;
  initialField?: CustomFieldDefinition | null;
}

export function FieldEditorSheet({ isOpen, onClose, onSave, initialField }: FieldEditorSheetProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CustomFieldType>("text");
  const [optionsStr, setOptionsStr] = useState("");

  const [columns, setColumns] = useState<CustomFieldDefinition[]>([]);
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState<CustomFieldType>("text");
  const [newColOptionsStr, setNewColOptionsStr] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialField) {
        setName(initialField.name);
        setType(initialField.type);
        setOptionsStr(initialField.options?.join(", ") || "");
        setColumns(initialField.columns || []);
      } else {
        setName("");
        setType("text");
        setOptionsStr("");
        setColumns([]);
      }
      setNewColName("");
      setNewColType("text");
      setNewColOptionsStr("");
    }
  }, [isOpen, initialField]);

  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    const col: CustomFieldDefinition = {
      id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: newColName.trim(),
      type: newColType,
    };
    if (newColType === "select" && newColOptionsStr.trim()) {
      col.options = newColOptionsStr.split(",").map(o => o.trim()).filter(o => o.length > 0);
    }
    setColumns([...columns, col]);
    setNewColName("");
    setNewColType("text");
    setNewColOptionsStr("");
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const newField: CustomFieldDefinition = {
      id: initialField?.id || `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      type: type,
    };

    if (type === "select" && optionsStr.trim()) {
      newField.options = optionsStr.split(",").map(o => o.trim()).filter(o => o.length > 0);
    }
    if (type === "table") {
      newField.columns = columns;
    }

    onSave(newField);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex justify-center items-end sm:items-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                {initialField ? "Modifier le champ" : "Nouveau champ"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content area: scrolls independently */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom du champ
                </label>
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Durée, Niveau..."
                  className="w-full px-4 py-3 sm:py-2 border border-gray-200 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Type de donnée
                </label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CustomFieldType)}
                    className="w-full px-4 py-3 sm:py-2 pl-10 border border-gray-200 rounded-xl text-base sm:text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none"
                  >
                    {Object.entries(TYPE_CONFIGS).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    {(() => {
                        const Icon = TYPE_CONFIGS[type].icon;
                        return <Icon size={18} />;
                    })()}
                  </div>
                </div>
              </div>

              {type === "select" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Options (séparées par une virgule)
                  </label>
                  <input
                    type="text"
                    value={optionsStr}
                    onChange={(e) => setOptionsStr(e.target.value)}
                    placeholder="Ex: Facile, Moyen, Difficile"
                    className="w-full px-4 py-3 sm:py-2 border border-gray-200 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </motion.div>
              )}

              {type === "table" && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-4"
                >
                  <label className="block text-sm font-medium text-amber-900 border-b border-amber-200 pb-2">
                    Configuration des colonnes ({columns.length})
                  </label>
                  
                  {columns.length > 0 && (
                    <div className="space-y-2">
                      {columns.map(col => (
                        <div key={col.id} className="flex justify-between items-center bg-white border border-amber-100 p-2 sm:p-3 rounded-lg text-sm shadow-sm">
                          <div className="flex items-center gap-2">
                            {(() => {
                                const ColIcon = TYPE_CONFIGS[col.type]?.icon || Type;
                                return <ColIcon size={16} className="text-amber-500" />;
                            })()}
                            <span><strong className="font-semibold text-gray-900">{col.name}</strong></span>
                          </div>
                          <button 
                            onClick={() => setColumns(columns.filter(c => c.id !== col.id))}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-3">
                    <div>
                      <input
                        type="text"
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                        placeholder="Nom de la nouvelle colonne"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <select
                        value={newColType}
                        onChange={(e) => setNewColType(e.target.value as CustomFieldType)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        {Object.entries(TYPE_CONFIGS)
                          .filter(([key]) => key !== "table")
                          .map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddColumn}
                        disabled={!newColName.trim()}
                        className="p-2 bg-amber-500 text-white hover:bg-amber-600 rounded-lg disabled:opacity-50 transition-colors shrink-0"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {newColType === "select" && (
                      <input
                        type="text"
                        value={newColOptionsStr}
                        onChange={(e) => setNewColOptionsStr(e.target.value)}
                        placeholder="Options (ex: A, B, C)"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50"
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer with actions fixed at bottom */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || (type === "table" && columns.length === 0)}
                className="px-6 py-2 sm:py-2.5 text-sm font-medium text-white bg-amber-500 rounded-xl hover:bg-amber-600 disabled:bg-gray-300 disabled:opacity-50 transition-colors shadow-sm"
              >
                Valider
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
