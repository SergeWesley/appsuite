"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Plus, Trash2, Save, Type, List, Hash, Calendar, CheckSquare, Palette, Star, Link, Euro, Table } from "lucide-react";
import { NoteFolder, CustomFieldDefinition, CustomFieldType } from "@/types/notes";

interface FolderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fields: CustomFieldDefinition[]) => Promise<void>;
  folder: NoteFolder | null;
}

const TYPE_CONFIGS: Record<CustomFieldType, { label: string; icon: React.ElementType }> = {
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

export function FolderConfigModal({
  isOpen,
  onClose,
  onSave,
  folder,
}: FolderConfigModalProps) {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // States pour ajouter un nouveau champ
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<CustomFieldType>("text");
  const [newOptionsStr, setNewOptionsStr] = useState("");

  // States pour ajouter une colonne (si newType === "table")
  const [newColumns, setNewColumns] = useState<CustomFieldDefinition[]>([]);
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState<CustomFieldType>("text");
  const [newColOptionsStr, setNewColOptionsStr] = useState("");

  // Sync state when folder changes
  useEffect(() => {
    if (folder) {
      setFields(folder.customFields || []);
      setIsAdding(false);
      resetNewForm();
    }
  }, [folder]);

  if (!folder) return null;

  const resetNewForm = () => {
    setNewName("");
    setNewType("text");
    setNewOptionsStr("");
    setNewColumns([]);
    setNewColName("");
    setNewColType("text");
    setNewColOptionsStr("");
    setIsAdding(false);
  };

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
    setNewColumns([...newColumns, col]);
    setNewColName("");
    setNewColType("text");
    setNewColOptionsStr("");
  };

  const handleAddField = () => {
    if (!newName.trim()) return;

    const newField: CustomFieldDefinition = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: newName.trim(),
      type: newType,
    };

    if (newType === "select" && newOptionsStr.trim()) {
      newField.options = newOptionsStr.split(",").map(o => o.trim()).filter(o => o.length > 0);
    }
    if (newType === "table") {
      newField.columns = newColumns;
    }

    setFields([...fields, newField]);
    resetNewForm();
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(fields);
    setIsSaving(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50">
                    <Settings size={20} className="text-amber-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Configuration : {folder.name}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm text-gray-500 mb-6">
                Créez des champs sur-mesure pour vos notes. Chaque note dans "{folder.name}" vous demandera de remplir ces informations.
              </p>

              {/* Liste des champs existants */}
              <div className="space-y-3 mb-6">
                <AnimatePresence initial={false}>
                  {fields.map((field) => {
                    const TypeIcon = TYPE_CONFIGS[field.type].icon;
                    return (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-white border border-gray-200 rounded-md shadow-sm">
                            <TypeIcon size={16} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{field.name}</p>
                            <p className="text-xs text-gray-500">
                              {TYPE_CONFIGS[field.type].label} 
                              {field.type === "select" && field.options && ` (${field.options.length} options)`}
                              {field.type === "table" && field.columns && ` (${field.columns.length} colonnes)`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveField(field.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer ce champ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {fields.length === 0 && !isAdding && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">Aucun champ personnalisé configuré.</p>
                  </div>
                )}
              </div>

              {/* Formulaire d'ajout */}
              {isAdding ? (
                <div className="p-4 bg-gray-50 border border-amber-100 rounded-xl space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Nouveau champ</h3>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nom du champ</label>
                    <input
                      type="text"
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ex: Durée, Difficulté..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type de donnée</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as CustomFieldType)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {Object.entries(TYPE_CONFIGS).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  {newType === "select" && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Options (séparées par une virgule)</label>
                      <input
                        type="text"
                        value={newOptionsStr}
                        onChange={(e) => setNewOptionsStr(e.target.value)}
                        placeholder="Ex: Facile, Moyen, Difficile"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {newType === "table" && (
                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Colonnes du tableau ({newColumns.length})</label>
                      
                      {/* Liste des colonnes */}
                      {newColumns.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {newColumns.map(col => (
                            <div key={col.id} className="flex justify-between items-center bg-gray-50 p-2 rounded text-xs">
                              <span><strong>{col.name}</strong> ({TYPE_CONFIGS[col.type]?.label})</span>
                              <button 
                                onClick={() => setNewColumns(newColumns.filter(c => c.id !== col.id))}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Ajouter une colonne */}
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={newColName}
                          onChange={(e) => setNewColName(e.target.value)}
                          placeholder="Nom col."
                          className="min-w-0 flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        <select
                          value={newColType}
                          onChange={(e) => setNewColType(e.target.value as CustomFieldType)}
                          className="w-[100px] shrink-0 px-2 py-1.5 border border-gray-200 rounded text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          {Object.entries(TYPE_CONFIGS)
                            .filter(([key]) => key !== "table") // On ne met pas un tableau dans un tableau pour l'instant
                            .map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleAddColumn}
                          disabled={!newColName.trim()}
                          className="shrink-0 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      {newColType === "select" && (
                        <input
                          type="text"
                          value={newColOptionsStr}
                          onChange={(e) => setNewColOptionsStr(e.target.value)}
                          placeholder="Opts séparées par virgule"
                          className="w-full px-2 py-1.5 mt-2 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={resetNewForm}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddField}
                      disabled={!newName.trim()}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Ajouter ce champ
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  <Plus size={18} />
                  Créer un champ
                </button>
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end shrink-0 gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors font-medium text-sm disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? "Enregistrement..." : "Enregistrer la config"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
