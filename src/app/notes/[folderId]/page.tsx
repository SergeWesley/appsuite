"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useNoteFolders } from "@/hooks/notes/useNoteFolders";
import { useNotes } from "@/hooks/notes/useNotes";
import { useNoteTemplates } from "@/hooks/notes/useNoteTemplates";
import { NoteFolder, Note } from "@/types/notes";
import { NoteCard } from "@/components/notes/NoteCard";
import { FolderCard } from "@/components/notes/FolderCard";
import { CreateFolderModal } from "@/components/notes/CreateFolderModal";
import { MoveFolderModal } from "@/components/notes/MoveFolderModal";
import { ImportNoteButton } from "@/components/notes/ImportNoteButton";
import { NoteFolderFormData, NoteExportData } from "@/types/notes";
import { FloatingAddButton } from "@/components/tracker/FloatingAddButton";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { TemplatePickerModal } from "@/components/notes/TemplatePickerModal";
import {
  StickyNote,
  FileText,
  Trash2,
  FolderPlus,
  Settings,
  MoveRight,
} from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { AppHeader } from "@/components/AppHeader";

export default function FolderPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params.folderId as string;
  const { user, signOut } = useAuthContext();

  const {
    folders,
    deleteFolder,
    addFolder,
    updateFolderFields,
    updateFolder,
    importNoteData,
    moveFolder,
  } = useNoteFolders();
  const { notes, loading, addNote } = useNotes(folderId);
  const { templates } = useNoteTemplates(folderId);
  const [folder, setFolder] = useState<NoteFolder | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [moveMode, setMoveMode] = useState(false);
  const [folderToMove, setFolderToMove] = useState<NoteFolder | null>(null);

  const subFolders = folders.filter((f) => f.parentId === folderId);

  // Find the folder info
  useEffect(() => {
    if (folders.length > 0) {
      const found = folders.find((f) => f.id === folderId);
      setFolder(found || null);
    }
  }, [folders, folderId]);

  const handleCreateSubFolder = async (data: NoteFolderFormData) => {
    const newFolder = await addFolder({ ...data, parentId: folderId });
    if (newFolder) {
      setShowCreateFolderModal(false);
    }
  };

  const handleImport = async (data: NoteExportData) => {
    const success = await importNoteData(data, folderId);
    if (success) {
      alert("Note importée avec succès dans ce dossier !");
    }
  };

  const handleCreateNote = async (templateId?: string | null) => {
    const note = await addNote({
      title: "Nouvelle note",
      content: "",
      templateId: templateId || null,
    });
    if (note) {
      router.push(`/notes/${folderId}/${note.id}`);
    }
  };

  const handleFloatingAdd = () => {
    // S'il y a des templates, on montre le picker
    if (templates.length > 0) {
      setShowTemplatePicker(true);
    } else {
      // Sinon, note libre directement
      handleCreateNote(null);
    }
  };

  const handleFolderClick = (f: NoteFolder, e: React.MouseEvent) => {
    if (moveMode) {
      e.preventDefault();
      setFolderToMove(f);
      return;
    }
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      setSelectedFolders((prev) =>
        prev.includes(f.id)
          ? prev.filter((id) => id !== f.id)
          : [...prev, f.id],
      );
    } else {
      router.push(`/notes/${f.id}`);
    }
  };

  const handleMoveFolder = async (fId: string, newParentId: string | null) => {
    const success = await moveFolder(fId, newParentId);
    if (!success) {
      alert("Erreur lors du déplacement du dossier.");
    }
  };

  const handleOpenNote = (note: Note) => {
    router.push(`/notes/${folderId}/${note.id}`);
  };

  const handleDeleteFolder = async () => {
    const parentId = folder?.parentId;
    const success = await deleteFolder(folderId);
    if (success) {
      if (parentId) {
        router.push(`/notes/${parentId}`);
      } else {
        router.push("/notes");
      }
    } else {
      alert("Une erreur s'est produite lors de la suppression du dossier.");
    }
  };

  const handleBulkDelete = async () => {
    let successCount = 0;
    for (const id of selectedFolders) {
      const success = await deleteFolder(id);
      if (success) successCount++;
    }
    setSelectedFolders([]);
    setShowBulkDeleteConfirm(false);
    if (successCount < selectedFolders.length) {
      alert(
        `Certains dossiers n'ont pas pu être supprimés (${successCount}/${selectedFolders.length}).`,
      );
    }
  };

  useKeyboardShortcut([
    {
      key: "n",
      altKey: true,
      shiftKey: false, // Explicitly false for note creation
      action: handleFloatingAdd,
    },
    {
      key: "n",
      altKey: true,
      shiftKey: true, // Shift for subfolder creation
      action: () => setShowCreateFolderModal(true),
    },
    {
      key: "Backspace",
      metaKey: true,
      action: () => {
        if (selectedFolders.length > 0) setShowBulkDeleteConfirm(true);
        else setShowDeleteConfirm(true);
      },
    },
    {
      key: "Backspace",
      ctrlKey: true,
      action: () => {
        if (selectedFolders.length > 0) setShowBulkDeleteConfirm(true);
        else setShowDeleteConfirm(true);
      },
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title={folder?.name || "Dossier"}
        icon={StickyNote}
        iconColor="text-amber-500"
        currentModule="notes"
        onBack={() => {
          if (folder?.parentId) {
            router.push(`/notes/${folder.parentId}`);
          } else {
            router.push("/notes");
          }
        }}
        actions={
          <>
            <button
              onClick={() => setMoveMode((prev) => !prev)}
              className={`p-2 rounded-lg transition-colors ${
                moveMode
                  ? "bg-amber-500 text-white shadow-md"
                  : "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
              }`}
              aria-label={moveMode ? "Quitter le mode déplacement" : "Mode déplacement"}
              title={moveMode ? "Quitter le mode déplacement" : "Mode déplacement"}
            >
              <MoveRight size={20} />
            </button>
            <button
              onClick={() => router.push(`/notes/${folderId}/settings`)}
              className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              aria-label="Paramètres du dossier"
              title="Paramètres du dossier"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Supprimer le dossier"
              title="Supprimer le dossier"
            >
              <Trash2 size={20} />
            </button>
            <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1"></div>
          </>
        }
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Move Mode Banner */}
        {moveMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3"
          >
            <MoveRight size={18} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 flex-1">
              <strong>Mode déplacement :</strong> Cliquez sur un sous-dossier pour le déplacer.
            </p>
            <button
              onClick={() => setMoveMode(false)}
              className="text-xs font-medium text-amber-600 hover:text-amber-800 px-3 py-1 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Quitter
            </button>
          </motion.div>
        )}

        {/* Sub-folders Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Sous-dossiers ({subFolders.length})
            </h2>
            <div className="flex items-center gap-2">
              <ImportNoteButton onImport={handleImport} />
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-2 py-1 rounded transition-colors"
              >
                <FolderPlus size={16} />
                Nouveau
              </button>
            </div>
          </div>
          {subFolders.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 mb-6">
              {subFolders.map((sf, index) => (
                <FolderCard
                  key={sf.id}
                  folder={sf}
                  index={index}
                  isSelected={selectedFolders.includes(sf.id)}
                  subfolderCount={
                    folders.filter((f) => f.parentId === sf.id).length
                  }
                  onClick={handleFolderClick}
                  onConfig={(f) => router.push(`/notes/${f.id}/settings`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Notes Section Info */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Notes ({notes.length})
          </h2>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-amber-500 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des notes...</p>
            </div>
          </div>
        )}

        {/* Notes list */}
        {!loading && notes.length > 0 && (
          <div className="space-y-3">
            {notes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                index={index}
                onClick={handleOpenNote}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <FloatingAddButton
        onClick={handleFloatingAdd}
        label="Créer une note"
        color="bg-amber-500 hover:bg-amber-600"
      />

      {/* Create SubFolder Modal */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onSubmit={handleCreateSubFolder}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteFolder}
        title="Supprimer le dossier"
        message="Êtes-vous sûr de vouloir supprimer ce dossier et toutes ses notes ? Cette action est irréversible."
        confirmLabel="Supprimer"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Supprimer les dossiers sélectionnés"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedFolders.length} dossier(s) et toutes leurs notes ? Cette action est irréversible.`}
        confirmLabel={`Supprimer ${selectedFolders.length} dossier(s)`}
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {/* Move Folder Modal */}
      <MoveFolderModal
        isOpen={!!folderToMove}
        folder={folderToMove}
        allFolders={folders}
        onClose={() => setFolderToMove(null)}
        onMove={handleMoveFolder}
      />

      {/* Template Picker Modal */}
      <TemplatePickerModal
        isOpen={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        templates={templates}
        onSelect={(templateId) => {
          setShowTemplatePicker(false);
          handleCreateNote(templateId);
        }}
      />
    </div>
  );
}
