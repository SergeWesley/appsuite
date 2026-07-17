"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Settings,
  Save,
  Trash2,
  FolderOpen,
  Plus,
  LayoutTemplate,
  Edit2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNoteFolders } from "@/hooks/notes/useNoteFolders";
import { useNoteTemplates } from "@/hooks/notes/useNoteTemplates";
import { FOLDER_COLORS, CustomFieldDefinition, NoteFolder, NoteTemplate } from "@/types/notes";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { TemplateEditorModal } from "@/components/notes/TemplateEditorModal";
import { AppLayout } from "@/components/AppLayout";

export default function FolderSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params.folderId as string;

  const { folders, loading: foldersLoading, updateFolder, deleteFolder } = useNoteFolders();
  const { templates, loading: templatesLoading, addTemplate, updateTemplate, deleteTemplate } = useNoteTemplates(folderId);

  const [folder, setFolder] = useState<NoteFolder | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("#f59e0b");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Template editing
  const [editingTemplate, setEditingTemplate] = useState<NoteTemplate | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  // Init folder data
  useEffect(() => {
    if (folders.length > 0) {
      const found = folders.find((f) => f.id === folderId);
      if (found) {
        setFolder(found);
        setFolderName(found.name);
        setFolderColor(found.color || "#f59e0b");
      } else {
        router.push("/notes");
      }
    }
  }, [folders, folderId, router]);

  const handleSaveIdentity = async () => {
    if (!folder) return;
    setIsSaving(true);
    try {
      if (folderName !== folder.name || folderColor !== folder.color) {
        await updateFolder(folder.id, { name: folderName, color: folderColor });
      }
      router.back();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde.");
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (!folder) return;
    router.back();
  };

  const handleDeleteFolder = async () => {
    const parentId = folder?.parentId;
    const success = await deleteFolder(folderId);
    if (success) {
      router.push(parentId ? `/notes/${parentId}` : "/notes");
    } else {
      alert("Une erreur s'est produite lors de la suppression.");
    }
  };

  // ---------- Template CRUD ----------
  const openNewTemplate = () => {
    setEditingTemplate(null);
    setIsTemplateModalOpen(true);
  };

  const openEditTemplate = (template: NoteTemplate) => {
    setEditingTemplate(template);
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = async (name: string, fields: CustomFieldDefinition[]) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, { name, fields });
    } else {
      await addTemplate(name, fields);
    }
    setIsTemplateModalOpen(false);
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    await deleteTemplate(templateToDelete);
    setTemplateToDelete(null);
  };

  const loading = foldersLoading || templatesLoading;

  if (loading || !folder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AppLayout
      title="Paramètres du dossier"
      icon={Settings}
      iconColor="text-amber-500"
      currentModule="notes"
      onBack={handleBack}
      bgClass="min-h-screen bg-gray-50 pb-24"
      actions={
        <button
          onClick={handleSaveIdentity}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium disabled:opacity-50 shadow-sm"
        >
          <Save size={16} />
          <span className="hidden sm:inline">
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </span>
        </button>
      }
    >
      <div className="space-y-8">

        {/* IDENTITÉ DU DOSSIER */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
              <FolderOpen size={20} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Identité & Apparence</h2>
              <p className="text-xs text-gray-500">Gérez le nom et la couleur de ce dossier.</p>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom du dossier</label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Couleur du dossier</label>
              <div className="flex flex-wrap gap-3">
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setFolderColor(c.value)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      folderColor === c.value
                        ? "ring-2 ring-offset-4 ring-gray-400 scale-110 shadow-md"
                        : "hover:scale-110 hover:shadow-sm"
                    }`}
                    title={c.label}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TEMPLATES */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                <LayoutTemplate size={20} className="text-gray-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Templates</h2>
                <p className="text-xs text-gray-500">
                  Créez différents modèles de données pour vos notes.
                </p>
              </div>
            </div>
            <button
              onClick={openNewTemplate}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nouveau</span>
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Liste des templates existants */}
            {templates.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <LayoutTemplate size={32} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">Aucun template</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Créez des modèles pour structurer vos notes dans ce dossier.
                </p>
                <button
                  onClick={openNewTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Créer un premier template
                </button>
              </div>
            )}

            <AnimatePresence initial={false}>
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      setExpandedTemplateId(
                        expandedTemplateId === template.id ? null : template.id,
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-amber-50 rounded-lg">
                        <LayoutTemplate size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-500">
                          {template.fields.length} champ{template.fields.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditTemplate(template);
                        }}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTemplateToDelete(template.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                      {expandedTemplateId === template.id ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded view: list of fields */}
                  <AnimatePresence>
                    {expandedTemplateId === template.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 bg-gray-50/50 px-4 py-3"
                      >
                        {template.fields.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">Aucun champ défini.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {template.fields.map((field) => (
                              <div
                                key={field.id}
                                className="flex items-center gap-2 text-xs text-gray-600"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                <span className="font-medium">{field.name}</span>
                                <span className="text-gray-400">({field.type})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Inline Editor removed in favor of TemplateEditorModal */}
          </div>
        </section>

        {/* ZONE DE DANGER */}
        <section className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden mt-12">
          <div className="p-4 sm:p-6 border-b border-red-100 bg-red-50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-red-100">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-red-900">Zone de danger</h2>
              <p className="text-xs text-red-500">Actions irréversibles pour ce dossier.</p>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 font-medium text-sm transition-colors"
            >
              Supprimer le dossier définitivement
            </button>
          </div>
        </section>
      </div>

      {/* Modale suppr dossier */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteFolder}
        title="Supprimer le dossier"
        message="Êtes-vous sûr de vouloir supprimer ce dossier et toutes ses notes ? Cette action est irréversible."
        confirmLabel="Oui, supprimer"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {/* Modale suppr template */}
      <ConfirmationModal
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={handleDeleteTemplate}
        title="Supprimer le template"
        message="Supprimer ce template ? Les notes existantes utilisant ce template conserveront leurs données, mais ne seront plus liées à un modèle."
        confirmLabel="Supprimer"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {/* MODALS */}
      <TemplateEditorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
        initialTemplate={editingTemplate}
      />
    </AppLayout>
  );
}
