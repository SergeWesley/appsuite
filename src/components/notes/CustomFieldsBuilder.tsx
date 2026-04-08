"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Edit2, Type, List, Hash, Calendar, CheckSquare, Palette, Star, Link, Euro, Table, Settings } from "lucide-react";
import { CustomFieldDefinition, CustomFieldType } from "@/types/notes";

interface CustomFieldsBuilderProps {
  fields: CustomFieldDefinition[];
  onChange: (fields: CustomFieldDefinition[]) => void;
}

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

export function CustomFieldsBuilder({ fields, onChange }: CustomFieldsBuilderProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<CustomFieldType>("text");
  const [newOptionsStr, setNewOptionsStr] = useState("");

  const [newColumns, setNewColumns] = useState<CustomFieldDefinition[]>([]);
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState<CustomFieldType>("text");
  const [newColOptionsStr, setNewColOptionsStr] = useState("");

  const resetNewForm = () => {
    setNewName("");
    setNewType("text");
    setNewOptionsStr("");
    setNewColumns([]);
    setNewColName("");
    setNewColType("text");
    setNewColOptionsStr("");
    setIsAdding(false);
    setEditingFieldId(null);
  };

  const handleEditField = (field: CustomFieldDefinition) => {
    setEditingFieldId(field.id);
    setNewName(field.name);
    setNewType(field.type);
    setNewOptionsStr(field.options?.join(", ") || "");
    setNewColumns(field.columns || []);
    setIsAdding(true);
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

  const handleSaveField = () => {
    if (!newName.trim()) return;

    const modifiedField: CustomFieldDefinition = {
      id: editingFieldId || `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: newName.trim(),
      type: newType,
    };

    if (newType === "select" && newOptionsStr.trim()) {
      modifiedField.options = newOptionsStr.split(",").map(o => o.trim()).filter(o => o.length > 0);
    }
    if (newType === "table") {
      modifiedField.columns = newColumns;
    }

    if (editingFieldId) {
      onChange(fields.map(f => f.id === editingFieldId ? modifiedField : f));
    } else {
      onChange([...fields, modifiedField]);
    }
    
    resetNewForm();
  };

  const handleRemoveField = (id: string) => {
    onChange(fields.filter(f => f.id !== id));
  };

  return (
    <div className="w-full">
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
                className="flex items-center justify-between p-4 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-amber-300 transition-colors group cursor-pointer"
                onClick={() => handleEditField(field)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg group-hover:bg-amber-50 group-hover:border-amber-200 transition-colors">
                    <TypeIcon size={18} className="text-gray-500 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{field.name}</h4>
                    <p className="text-sm text-gray-500">
                      {TYPE_CONFIGS[field.type].label} 
                      {field.type === "select" && field.options && ` · ${field.options.length} options`}
                      {field.type === "table" && field.columns && ` · ${field.columns.length} colonnes`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Modifier">
                    <Edit2 size={18} />
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveField(field.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10 relative"
                    title="Supprimer ce champ"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {fields.length === 0 && !isAdding && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <Settings size={32} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">Aucun champ personnalisé</h3>
            <p className="text-xs text-gray-500">
              Créez votre propre modèle de données pour ce dossier.
            </p>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout / Édition */}
      {isAdding ? (
        <div className="p-5 bg-white border border-amber-200 shadow-sm rounded-xl space-y-5">
          <h3 className="text-base font-semibold text-gray-900">
            {editingFieldId ? "Modifier le champ" : "Nouveau champ"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du champ</label>
              <input
                type="text"
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Durée, Difficulté..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de donnée</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as CustomFieldType)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {Object.entries(TYPE_CONFIGS).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          {newType === "select" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Options (séparées par une virgule)</label>
              <input
                type="text"
                value={newOptionsStr}
                onChange={(e) => setNewOptionsStr(e.target.value)}
                placeholder="Ex: Facile, Moyen, Difficile"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          )}

          {newType === "table" && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
              <label className="block text-sm font-medium text-gray-700">Colonnes du tableau ({newColumns.length})</label>
              
              {/* Liste des colonnes */}
              {newColumns.length > 0 && (
                <div className="space-y-2 mb-3">
                  {newColumns.map(col => (
                    <div key={col.id} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-lg text-sm shadow-sm">
                      <span><strong className="font-semibold">{col.name}</strong> <span className="text-gray-500">({TYPE_CONFIGS[col.type]?.label})</span></span>
                      <button 
                        onClick={() => setNewColumns(newColumns.filter(c => c.id !== col.id))}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Ajouter une colonne */}
              <div className="flex gap-2 items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                <input
                  type="text"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="Nom de la colonne"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value as CustomFieldType)}
                  className="w-[140px] px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                  className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 rounded-lg disabled:opacity-50 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              
              {newColType === "select" && (
                <input
                  type="text"
                  value={newColOptionsStr}
                  onChange={(e) => setNewColOptionsStr(e.target.value)}
                  placeholder="Options séparées par une virgule (ex: Option 1, Option 2)"
                  className="w-full px-3 py-2 mt-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                />
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 font-medium">
            <button
              onClick={resetNewForm}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 bg-white border border-gray-200 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveField}
              disabled={!newName.trim()}
              className="px-6 py-2 text-sm text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
            >
              {editingFieldId ? "Mettre à jour" : "Ajouter au modèle"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 mt-4 border-2 border-dashed border-amber-200 bg-amber-50/50 rounded-xl text-sm font-semibold text-amber-700 hover:border-amber-400 hover:bg-amber-50 transition-all shadow-sm"
        >
          <Plus size={20} />
          Ajouter une nouvelle propriété
        </button>
      )}
    </div>
  );
}
