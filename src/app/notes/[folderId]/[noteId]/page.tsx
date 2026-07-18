"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useNoteFolders } from "@/hooks/notes/useNoteFolders";
import { useNotes } from "@/hooks/notes/useNotes";
import { useNoteTemplates } from "@/hooks/notes/useNoteTemplates";
import { NoteFolder, CustomFieldDefinition, Note, NoteExportData } from "@/types/notes";
import { getNoteLocalStorageData } from "@/hooks/useFilterPersistence";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Trash2, Loader2, Check, Download, Sparkles, MoreVertical, Plus, Minus, Undo2, Redo2, Lock, Unlock } from "lucide-react";
import { DynamicPropertiesBanner } from "@/components/notes/DynamicPropertiesBanner";
import { useAgent } from "@/components/chat/AgentProvider";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { AppLayout } from "@/components/AppLayout";
import { useNoteHistory } from "@/hooks/notes/useNoteHistory";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export default function NoteEditorPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params.folderId as string;
  const noteId = params.noteId as string;

  const { folders } = useNoteFolders();
  const { notes, loading, updateNote, deleteNote } = useNotes(folderId);
  const { templates } = useNoteTemplates(folderId);
  const { openAgent } = useAgent();
  const isAdmin = useIsAdmin();

  const [folder, setFolder] = useState<NoteFolder | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [instances, setInstances] = useState<Record<string, any>[]>([{}]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const { pushHistory, undo, redo, canUndo, canRedo, updateCurrentRef, clearHistory } = useNoteHistory({ title, content, instances });

  useEffect(() => {
    updateCurrentRef({ title, content, instances });
  }, [title, content, instances, updateCurrentRef]);

  // Find the folder
  useEffect(() => {
    if (folders.length > 0) {
      const found = folders.find((f) => f.id === folderId);
      setFolder(found || null);
    }
  }, [folders, folderId]);

  // Resolve the active fields: template fields > legacy folder customFields
  const currentNote = notes.find((n) => n.id === noteId);
  const noteTemplate = currentNote?.templateId
    ? templates.find((t) => t.id === currentNote.templateId)
    : null;
  const activeFields: CustomFieldDefinition[] =
    noteTemplate?.fields || folder?.customFields || [];

  // Initialize note content
  useEffect(() => {
    if (!loading && notes.length >= 0 && !initialized) {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        setTitle(note.title === "Nouvelle note" ? "" : note.title);
        setContent(note.content);
        const meta = note.metadata;
        if (Array.isArray(meta)) {
          setInstances(meta.length > 0 ? meta : [{}]);
        } else if (meta && Object.keys(meta).length > 0) {
          setInstances([meta]);
        } else {
          setInstances([{}]);
        }
        setIsLocked(note.isLocked || false);
        setInitialized(true);
        // On attend que les React states se mettent à jour pour clear l'historique proprement
        setTimeout(() => clearHistory(), 0);
      }
    }
  }, [notes, noteId, loading, initialized]);

  // Écouter les rafraîchissements globaux (ex: quand l'IA modifie la note et qu'on ferme la modale)
  // On repasse initialized à false pour que le useEffect au-dessus reprenne les nouvelles données
  useEffect(() => {
    const handleRefresh = () => {
      setInitialized(false);
    };
    window.addEventListener("appsuite:refresh-data", handleRefresh);
    return () => window.removeEventListener("appsuite:refresh-data", handleRefresh);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = contentRef.current.scrollHeight + "px";
    }
  }, [content]);

  // Auto-save with debounce
  const saveNote = useCallback(
    async (newTitle: string, newContent: string, newInstances: Record<string, any>[]) => {
      setSaving(true);
      setSaved(false);

      const finalTitle = newTitle.trim() || "Sans titre";

      await updateNote(noteId, {
        title: finalTitle,
        content: newContent,
        metadata: newInstances,
      });

      setSaving(false);
      setSaved(true);

      // Hide the "saved" indicator after 2 seconds
      setTimeout(() => setSaved(false), 2000);
    },
    [noteId, updateNote],
  );

  const debouncedSave = useCallback(
    (newTitle: string, newContent: string, newInstances: Record<string, any>[]) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveNote(newTitle, newContent, newInstances);
      }, 1000);
    },
    [saveNote],
  );

  const handleTitleChange = (value: string) => {
    pushHistory({ title, content, instances });
    setTitle(value);
    setSaved(false);
    debouncedSave(value, content, instances);
  };

  const handleContentChange = (value: string) => {
    pushHistory({ title, content, instances });
    setContent(value);
    setSaved(false);
    debouncedSave(title, value, instances);
  };

  const handleMetadataChange = (index: number, key: string, value: any) => {
    pushHistory({ title, content, instances }, true);
    const nextInstances = [...instances];
    nextInstances[index] = { ...nextInstances[index], [key]: value };
    setInstances(nextInstances);
    setSaved(false);
    debouncedSave(title, content, nextInstances);
  };

  const handleAddInstance = () => {
    pushHistory({ title, content, instances }, true);
    const nextInstances = [...instances, {}];
    setInstances(nextInstances);
    debouncedSave(title, content, nextInstances);
  };

  const handleRemoveInstance = (index: number) => {
    pushHistory({ title, content, instances }, true);
    const nextInstances = instances.filter((_, i) => i !== index);
    const finalInstances = nextInstances.length > 0 ? nextInstances : [{}];
    setInstances(finalInstances);
    debouncedSave(title, content, finalInstances);
  };

  const handleUndo = useCallback(() => {
    const previous = undo();
    if (previous) {
      setTitle(previous.title);
      setContent(previous.content);
      setInstances(previous.instances);
      setSaved(false);
      debouncedSave(previous.title, previous.content, previous.instances);
    }
  }, [undo, debouncedSave]);

  const handleRedo = useCallback(() => {
    const next = redo();
    if (next) {
      setTitle(next.title);
      setContent(next.content);
      setInstances(next.instances);
      setSaved(false);
      debouncedSave(next.title, next.content, next.instances);
    }
  }, [redo, debouncedSave]);


  const handleExport = () => {
    if (!folder) return;

    // Récupérer les données du LocalStorage associées à cette note (ex: tailles de colonnes)
    const lsData = getNoteLocalStorageData(noteId);

    const exportData: NoteExportData = {
      version: 1,
      type: "appsuite_note_export",
      folder: {
        name: folder.name,
        color: folder.color,
        customFields: activeFields.length > 0 ? activeFields : undefined,
      },
      template: noteTemplate
        ? { name: noteTemplate.name, fields: noteTemplate.fields }
        : undefined,
      note: {
        title: title.trim() || "Sans titre",
        content: content,
        metadata: instances,
        localStorageData: Object.keys(lsData).length > 0 ? lsData : undefined,
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title.trim() || "note").toLowerCase().replace(/[^a-z0-9]/g, "_")}.appsuite`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    const success = await deleteNote(noteId);
    if (success) {
      router.push(`/notes/${folderId}`);
    }
  };

  const handleBack = () => {
    // Save immediately before leaving
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveNote(title, content, instances);
    router.push(`/notes/${folderId}`);
  };

  useKeyboardShortcut([
    {
      key: "Backspace",
      metaKey: true,
      action: () => { if (!isLocked) setShowDeleteConfirm(true); },
    },
    {
      key: "Backspace",
      ctrlKey: true,
      action: () => { if (!isLocked) setShowDeleteConfirm(true); },
    },
    {
      key: "z",
      metaKey: true,
      action: handleUndo,
    },
    {
      key: "z",
      metaKey: true,
      shiftKey: true,
      action: handleRedo,
    },
    {
      key: "z",
      ctrlKey: true,
      action: handleUndo,
    },
    {
      key: "y",
      ctrlKey: true,
      action: handleRedo,
    },
  ]);

  if (loading && !initialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-amber-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la note...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      title={folder?.name || "Retour"}
      currentModule="notes"
      height="h-14"
      onBack={handleBack}
      bgClass="min-h-screen bg-white"
      padding="px-4 sm:px-6 py-6"
      actions={
        <>
          {/* Undo / Redo Buttons */}
          <div className="flex items-center gap-1 sm:mr-2 sm:border-r border-gray-200 sm:pr-2">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded transition-colors ${canUndo ? "text-gray-600 hover:bg-gray-100 hover:text-amber-600" : "text-gray-300 cursor-not-allowed"}`}
              title="Annuler (Ctrl+Z)"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded transition-colors ${canRedo ? "text-gray-600 hover:bg-gray-100 hover:text-amber-600" : "text-gray-300 cursor-not-allowed"}`}
              title="Rétablir (Ctrl+Shift+Z)"
            >
              <Redo2 size={18} />
            </button>
          </div>

          {/* Save status indicator */}
          <div className="w-5 h-5 flex items-center justify-center" title={saving ? "Enregistrement en cours..." : "Synchronisé"}>
            {saving ? (
              <Loader2 size={14} className="animate-spin text-amber-500/50" />
            ) : saved ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Check size={14} className="text-emerald-500/70" />
              </motion.div>
            ) : null}
          </div>


          {/* AI, Export, Delete buttons grouped in a Menu */}
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="p-2 text-gray-500 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50">
              <MoreVertical size={20} />
            </MenuButton>

            <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 focus:outline-none">
              <div className="py-1">
                {isAdmin && (
                  <MenuItem
                    as="button"
                    onClick={() => {
                      openAgent({
                        systemContext: `L'utilisateur est dans le module Notes, en train d'éditer une note.`,
                      });
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2 hover:bg-gray-100"
                  >
                    <Sparkles size={16} />
                    Assistant IA
                  </MenuItem>
                )}
                <MenuItem
                  as="button"
                  onClick={handleExport}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2 hover:bg-gray-100"
                >
                  <Download size={16} />
                  Exporter
                </MenuItem>

                <MenuItem
                  as="button"
                  disabled={isLocked}
                  onClick={() => setShowDeleteConfirm(true)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                    isLocked 
                      ? "text-gray-400 cursor-not-allowed" 
                      : "text-red-600 hover:bg-red-50"
                  }`}
                  title={isLocked ? "Déverrouillez la note pour la supprimer" : ""}
                >
                  <Trash2 size={16} />
                  Supprimer
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </>
      }
    >
        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Titre de la note"
          className="w-full text-2xl sm:text-3xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent mb-4 leading-tight"
        />

        {/* Dynamic Properties */}
        {activeFields.length > 0 && (
          <div className="space-y-6">
            {instances.map((instance, index) => (
              <div key={index} className="relative group">
                <DynamicPropertiesBanner 
                  fields={activeFields} 
                  metadata={instance} 
                  onChange={(key, value) => handleMetadataChange(index, key, value)}
                  noteId={noteId}
                />
                {instances.length > 1 && (
                  <button
                    onClick={() => handleRemoveInstance(index)}
                    className="absolute top-4 right-0 p-1.5 text-gray-400 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-md hover:bg-red-50"
                    title="Supprimer cette occurrence"
                  >
                    <Minus size={16} />
                  </button>
                )}
                <hr className="my-6 border-gray-100" />
              </div>
            ))}
            <div className="flex justify-center pb-6">
              <button
                onClick={handleAddInstance}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
              >
                <Plus size={16} /> Ajouter une occurrence
              </button>
            </div>
          </div>
        )}

        {/* Content textarea */}
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Commencez à écrire..."
          className="w-full text-gray-700 placeholder-gray-300 border-none outline-none bg-transparent resize-none leading-relaxed text-base min-h-[60vh]"
        />


      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer la note"
        message="Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible."
        confirmLabel="Supprimer"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </AppLayout>
  );
}
