"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useNoteFolders } from "@/hooks/notes/useNoteFolders";
import { useNotes } from "@/hooks/notes/useNotes";
import { useNoteTemplates } from "@/hooks/notes/useNoteTemplates";
import { NoteFolder, CustomFieldDefinition } from "@/types/notes";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Trash2, Loader2, Check, Download, Sparkles } from "lucide-react";
import { DynamicPropertiesBanner } from "@/components/notes/DynamicPropertiesBanner";
import { NoteExportData } from "@/types/notes";
import { useAgent } from "@/components/chat/AgentProvider";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { AppHeader } from "@/components/AppHeader";

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
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

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
        setMetadata(note.metadata || {});
        setInitialized(true);
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
    async (newTitle: string, newContent: string, newMetadata: Record<string, any>) => {
      setSaving(true);
      setSaved(false);

      const finalTitle = newTitle.trim() || "Sans titre";

      await updateNote(noteId, {
        title: finalTitle,
        content: newContent,
        metadata: newMetadata,
      });

      setSaving(false);
      setSaved(true);

      // Hide the "saved" indicator after 2 seconds
      setTimeout(() => setSaved(false), 2000);
    },
    [noteId, updateNote],
  );

  const debouncedSave = useCallback(
    (newTitle: string, newContent: string, newMetadata: Record<string, any>) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveNote(newTitle, newContent, newMetadata);
      }, 1000);
    },
    [saveNote],
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSaved(false);
    debouncedSave(value, content, metadata);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setSaved(false);
    debouncedSave(title, value, metadata);
  };

  const handleMetadataChange = (key: string, value: any) => {
    const nextMeta = { ...metadata, [key]: value };
    setMetadata(nextMeta);
    setSaved(false);
    debouncedSave(title, content, nextMeta);
  };

  const handleExport = () => {
    if (!folder) return;

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
        metadata: metadata,
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
    saveNote(title, content, metadata);
    router.push(`/notes/${folderId}`);
  };

  useKeyboardShortcut([
    {
      key: "Backspace",
      metaKey: true,
      action: () => setShowDeleteConfirm(true),
    },
    {
      key: "Backspace",
      ctrlKey: true,
      action: () => setShowDeleteConfirm(true),
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <AppHeader
        title={folder?.name || "Retour"}
        currentModule="notes"
        height="h-14"
        onBack={handleBack}
        actions={
          <>
            {/* Save status indicator */}
            {saving && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 text-gray-400 text-sm"
              >
                <Loader2 size={14} className="animate-spin" />
                <span>Enregistrement...</span>
              </motion.div>
            )}
            {saved && !saving && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-green-600 text-sm"
              >
                <Check size={14} />
                <span>Enregistré</span>
              </motion.div>
            )}

            {/* AI Assistant button (admin only) */}
            {isAdmin && (
              <button
                onClick={() => {
                  openAgent({
                    systemContext: `L'utilisateur est dans le module Notes, en train d'éditer une note.`,
                  });
                }}
                className="p-2 text-gray-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
                aria-label="Assistant IA"
                title="Analyser avec l'IA"
              >
                <Sparkles size={18} />
              </button>
            )}

            {/* Export button */}
            <button
              onClick={handleExport}
              className="p-2 text-gray-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
              aria-label="Exporter la note"
              title="Exporter"
            >
              <Download size={18} />
            </button>

            {/* Delete button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              aria-label="Supprimer la note"
              title="Supprimer"
            >
              <Trash2 size={18} />
            </button>
          </>
        }
      />

      {/* Editor */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
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
          <>
            <DynamicPropertiesBanner 
              fields={activeFields} 
              metadata={metadata} 
              onChange={handleMetadataChange}
              noteId={noteId}
            />
            <hr className="my-6 border-gray-100" />
          </>
        )}

        {/* Content textarea */}
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Commencez à écrire..."
          className="w-full text-gray-700 placeholder-gray-300 border-none outline-none bg-transparent resize-none leading-relaxed text-base min-h-[60vh]"
        />
      </main>

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
    </div>
  );
}
