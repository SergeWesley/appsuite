"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useNoteFolders } from "@/hooks/notes/useNoteFolders";
import { useNotes } from "@/hooks/notes/useNotes";
import { useNoteTemplates } from "@/hooks/notes/useNoteTemplates";
import { NoteFolder, Note } from "@/types/notes";
import { NoteCard } from "@/components/notes/NoteCard";
import { FolderCard } from "@/components/notes/FolderCard";
import { CreateFolderModal } from "@/components/notes/CreateFolderModal";
import { ImportNoteButton } from "@/components/notes/ImportNoteButton";
import { NoteFolderFormData, NoteExportData } from "@/types/notes";
import { FloatingAddButton } from "@/components/tracker/FloatingAddButton";
import { NavigationMenu } from "@/components/NavigationMenu";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { TemplatePickerModal } from "@/components/notes/TemplatePickerModal";
import {
  StickyNote,
  ArrowLeft,
  LogOut,
  User,
  FileText,
  Trash2,
  FolderPlus,
  Settings,
} from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

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
  } = useNoteFolders();
  const { notes, loading, addNote } = useNotes(folderId);
  const { templates } = useNoteTemplates(folderId);
  const [folder, setFolder] = useState<NoteFolder | null>(null);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);

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
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      setSelectedFolders((prev) =>
        prev.includes(f.id) ? prev.filter((id) => id !== f.id) : [...prev, f.id]
      );
    } else {
      router.push(`/notes/${f.id}`);
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
      alert(`Certains dossiers n'ont pas pu être supprimés (${successCount}/${selectedFolders.length}).`);
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (folder?.parentId) {
                    router.push(`/notes/${folder.parentId}`);
                  } else {
                    router.push("/notes");
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Retour"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>

              <button
                onClick={() => setIsNavMenuOpen(true)}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menu de navigation"
              >
                <StickyNote className="h-6 w-6 text-amber-500" />
                <div className="ml-2">
                  <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                    {folder?.name || "Dossier"}
                  </h1>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
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
              <Menu as="div" className="relative inline-block text-left">
                <MenuButton className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <User size={20} />
                  <span className="hidden sm:block">
                    {user?.user_metadata?.name || user?.email || "Utilisateur"}
                  </span>
                </MenuButton>

                <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 focus:outline-none">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.user_metadata?.name || "Utilisateur"}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <MenuItem
                      as="button"
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100"
                    >
                      <LogOut size={16} />
                      Se déconnecter
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
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
                  subfolderCount={folders.filter((f) => f.parentId === sf.id).length}
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

      {/* Navigation Menu */}
      <NavigationMenu
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        currentModule="notes"
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
