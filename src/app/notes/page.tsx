"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useNoteFolders } from "@/hooks/notes/useNoteFolders";
import { NoteFolder, NoteFolderFormData, NoteExportData } from "@/types/notes";
import { FolderCard } from "@/components/notes/FolderCard";
import { CreateFolderModal } from "@/components/notes/CreateFolderModal";
import { MoveFolderModal } from "@/components/notes/MoveFolderModal";
import { ImportNoteButton } from "@/components/notes/ImportNoteButton";
import { FloatingAddButton } from "@/components/tracker/FloatingAddButton";
import { NavigationMenu } from "@/components/NavigationMenu";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { StickyNote, FolderOpen } from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { AppHeader } from "@/components/AppHeader";

export default function NotesPage() {
  const router = useRouter();
  const { user, signOut } = useAuthContext();
  const { folders, loading, addFolder, importNoteData, deleteFolder, moveFolder } =
    useNoteFolders();
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [folderToMove, setFolderToMove] = useState<NoteFolder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<NoteFolder | null>(null);

  const rootFolders = folders.filter((f) => !f.parentId);

  const handleCreateFolder = async (data: NoteFolderFormData) => {
    const folder = await addFolder(data);
    if (folder) {
      setShowCreateFolderModal(false);
    }
  };

  const handleImport = async (data: NoteExportData) => {
    const success = await importNoteData(data, null);
    if (success) {
      alert("Note importée avec succès !");
    }
  };

  const handleFolderClick = (f: NoteFolder, e: React.MouseEvent) => {
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

  const handleMoveFolder = async (folderId: string, newParentId: string | null) => {
    const success = await moveFolder(folderId, newParentId);
    if (!success) {
      alert("Erreur lors du déplacement du dossier.");
    }
  };

  const handleSingleDelete = async () => {
    if (!folderToDelete) return;
    const success = await deleteFolder(folderToDelete.id);
    if (!success) {
      alert("Erreur lors de la suppression du dossier.");
    }
    setFolderToDelete(null);
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
      shiftKey: true,
      action: () => setShowCreateFolderModal(true),
    },
    {
      key: "Backspace",
      metaKey: true,
      action: () => {
        if (selectedFolders.length > 0) setShowBulkDeleteConfirm(true);
      },
    },
    {
      key: "Backspace",
      ctrlKey: true,
      action: () => {
        if (selectedFolders.length > 0) setShowBulkDeleteConfirm(true);
      },
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Notes"
        icon={StickyNote}
        iconColor="text-amber-500"
        currentModule="notes"
        actions={
          <>
            <ImportNoteButton onImport={handleImport} />
          </>
        }
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">


        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mes dossiers
          </h1>
          <p className="text-gray-600">
            {rootFolders.length} dossier{rootFolders.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-amber-500 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des dossiers...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && folders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-20 mb-6 opacity-30">
              <svg
                viewBox="0 0 80 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <rect
                  x="0"
                  y="8"
                  width="80"
                  height="56"
                  rx="6"
                  fill="#9ca3af"
                  opacity="0.85"
                />
                <path
                  d="M0 14C0 10.6863 2.68629 8 6 8H28L34 0H6C2.68629 0 0 2.68629 0 6V14Z"
                  fill="#9ca3af"
                  opacity="0.95"
                />
                <rect
                  x="0"
                  y="16"
                  width="80"
                  height="48"
                  rx="6"
                  fill="#9ca3af"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun dossier
            </h3>
            <p className="text-gray-500 text-center mb-6 max-w-sm">
              Commencez par créer un dossier pour organiser vos notes.
            </p>
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium"
            >
              Créer un dossier
            </button>
          </motion.div>
        )}

        {/* Folders Grid */}
        {!loading && rootFolders.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {rootFolders.map((folder, index) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                index={index}
                isSelected={selectedFolders.includes(folder.id)}
                subfolderCount={
                  folders.filter((f) => f.parentId === folder.id).length
                }
                onClick={handleFolderClick}
                onConfig={(f) => router.push(`/notes/${f.id}/settings`)}
                onMove={(f) => setFolderToMove(f)}
                onDelete={(f) => setFolderToDelete(f)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <FloatingAddButton
        onClick={() => setShowCreateFolderModal(true)}
        label="Créer un dossier"
        color="bg-amber-500 hover:bg-amber-600"
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onSubmit={handleCreateFolder}
      />

      {/* Bulk Delete Confirmation Modal */}
      {/* Move Folder Modal */}
      <MoveFolderModal
        isOpen={!!folderToMove}
        folder={folderToMove}
        allFolders={folders}
        onClose={() => setFolderToMove(null)}
        onMove={handleMoveFolder}
      />

      <ConfirmationModal
        isOpen={!!folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onConfirm={handleSingleDelete}
        title="Supprimer le dossier"
        message={`Êtes-vous sûr de vouloir supprimer le dossier « ${folderToDelete?.name} » et toutes ses notes ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      <ConfirmationModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Supprimer les dossiers sélectionnés"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedFolders.length} dossier(s) et toutes leurs notes ? Cette action est irréversible.`}
        confirmLabel={`Supprimer ${selectedFolders.length} dossier(s)`}
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
