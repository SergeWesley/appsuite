"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Edit2, Trash2, LayoutTemplate, Type } from "lucide-react";
import { CustomFieldDefinition, NoteTemplate } from "@/types/notes";
import { FieldEditorSheet, TYPE_CONFIGS } from "./FieldEditorSheet";

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, fields: CustomFieldDefinition[]) => void;
  initialTemplate?: NoteTemplate | null;
}

export function TemplateEditorModal({ isOpen, onClose, onSave, initialTemplate }: TemplateEditorModalProps) {
  const [name, setName] = useState("");
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);

  const [isFieldSheetOpen, setIsFieldSheetOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTemplate) {
        setName(initialTemplate.name);
        setFields([...initialTemplate.fields]);
      } else {
        setName("");
        setFields([]);
      }
      setIsFieldSheetOpen(false);
      setEditingField(null);
    }
  }, [isOpen, initialTemplate]);

  const handleAddField = () => {
    setEditingField(null);
    setIsFieldSheetOpen(true);
  };

  const handleEditField = (field: CustomFieldDefinition) => {
    setEditingField(field);
    setIsFieldSheetOpen(true);
  };

  const handleDeleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSaveField = (savedField: CustomFieldDefinition) => {
    if (editingField) {
      setFields(fields.map(f => f.id === savedField.id ? savedField : f));
    } else {
      setFields([...fields, savedField]);
    }
    setIsFieldSheetOpen(false);
  };

  const handleSaveAll = () => {
    if (!name.trim()) return;
    onSave(name.trim(), fields);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white z-[60] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:px-6 border-b border-gray-200 bg-white shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <LayoutTemplate size={20} className="text-amber-500 hidden sm:block" />
                {initialTemplate ? "Modifier le template" : "Nouveau template"}
              </h2>
            </div>
            <button
              onClick={handleSaveAll}
              disabled={!name.trim()}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
            >
              Enregistrer
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-8">
              
              {/* Template Name */}
              <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nom du Template
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Lieux à visiter, Suivi de projet..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50/50"
                />
              </section>

              {/* Fields List */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Propriétés du modèle</h3>
                    <p className="text-sm text-gray-500">Définissez les données rattachées aux notes de ce type.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {fields.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                      <LayoutTemplate size={32} className="mx-auto text-gray-300 mb-3" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Aucune propriété</h3>
                      <p className="text-xs text-gray-500 mb-4 px-4">
                        Ajoutez des champs (texte, nombre, tableau) pour structurer vos notes.
                      </p>
                      <button
                        onClick={handleAddField}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 font-medium text-sm transition-colors"
                      >
                        <Plus size={16} />
                        Ajouter ma première propriété
                      </button>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {fields.map((field) => {
                        const TypeIcon = TYPE_CONFIGS[field.type]?.icon || Type;
                        return (
                          <motion.div
                            key={field.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 shadow-sm rounded-xl hover:border-amber-300 transition-colors cursor-pointer gap-4"
                            onClick={() => handleEditField(field)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl group-hover:bg-amber-50 group-hover:border-amber-200 transition-colors">
                                <TypeIcon size={20} className="text-gray-500 group-hover:text-amber-500 transition-colors" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{field.name}</h4>
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {TYPE_CONFIGS[field.type]?.label || field.type}
                                  {field.type === "select" && field.options && ` · ${field.options.length} options`}
                                  {field.type === "table" && field.columns && ` · ${field.columns.length} colonnes`}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 self-end sm:self-auto sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <span className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                                <Edit2 size={18} />
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteField(field.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                  
                  {fields.length > 0 && (
                    <button
                      onClick={handleAddField}
                      className="w-full flex items-center justify-center gap-2 p-4 mt-2 border-2 border-dashed border-amber-200 bg-amber-50/50 rounded-xl text-sm font-semibold text-amber-700 hover:border-amber-400 hover:bg-amber-50 transition-all shadow-sm"
                    >
                      <Plus size={18} />
                      Ajouter une propriété
                    </button>
                  )}
                </div>
              </section>

            </div>
          </div>
          
          {/* Field Editor Sheet */}
          <FieldEditorSheet
            isOpen={isFieldSheetOpen}
            onClose={() => setIsFieldSheetOpen(false)}
            onSave={handleSaveField}
            initialField={editingField}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
