"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useNoteFolders } from "@/hooks/notes/useNoteFolders";
import { useNotes } from "@/hooks/notes/useNotes";
import { NoteFolder } from "@/types/notes";
import { ConfirmationModal } from "@/components/tracker/ConfirmationModal";
import { Trash2, Loader2, ArrowLeft, Check, Download } from "lucide-react";
import { DynamicPropertiesBanner } from "@/components/notes/DynamicPropertiesBanner";
import { NoteExportData } from "@/types/notes";

export default function NoteEditorPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params.folderId as string;
  const noteId = params.noteId as string;

  const { folders } = useNoteFolders();
  const { notes, loading, updateNote, deleteNote } = useNotes(folderId);

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
        customFields: folder.customFields,
      },
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
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            >
              <ArrowLeft size={20} />
              <span className="text-sm hidden sm:block">
                {folder?.name || "Retour"}
              </span>
            </button>

            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Titre de la note"
          className="w-full text-2xl sm:text-3xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent mb-4 leading-tight"
        />

        {/* Dynamic Properties */}
        {folder?.customFields && folder.customFields.length > 0 && (
          <>
            <DynamicPropertiesBanner 
              fields={folder.customFields} 
              metadata={metadata} 
              onChange={handleMetadataChange} 
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
