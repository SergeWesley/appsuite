"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useNoteFolders } from "@/hooks/notes/useNoteFolders";
import { NoteFolder, NoteFolderFormData, NoteExportData } from "@/types/notes";
import { FolderCard } from "@/components/notes/FolderCard";
import { CreateFolderModal } from "@/components/notes/CreateFolderModal";
import { ImportNoteButton } from "@/components/notes/ImportNoteButton";
import { FloatingAddButton } from "@/components/tracker/FloatingAddButton";
import { NavigationMenu } from "@/components/NavigationMenu";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { StickyNote, LogOut, User, FolderOpen } from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export default function NotesPage() {
  const router = useRouter();
  const { user, signOut } = useAuthContext();
  const { folders, loading, addFolder, importNoteData, deleteFolder } = useNoteFolders();
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

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
        prev.includes(f.id) ? prev.filter((id) => id !== f.id) : [...prev, f.id]
      );
    } else {
      router.push(`/notes/${f.id}`);
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsNavMenuOpen(true)}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menu de navigation"
              >
                <StickyNote className="h-8 w-8 text-amber-500" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">
                  Notes
                </h1>
              </button>
            </div>

            <div className="flex items-center gap-4">
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
        {/* Page Title */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mes dossiers
            </h1>
            <p className="text-gray-600">
              {rootFolders.length} dossier{rootFolders.length > 1 ? "s" : ""}
            </p>
          </div>
          <div>
            <ImportNoteButton onImport={handleImport} />
          </div>
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
                subfolderCount={folders.filter(f => f.parentId === folder.id).length}
                onClick={handleFolderClick}
                onConfig={(f) => router.push(`/notes/${f.id}/settings`)}
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
      <ConfirmationModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Supprimer les dossiers sélectionnés"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedFolders.length} dossier(s) et toutes leurs notes ? Cette action est irréversible.`}
        confirmLabel={`Supprimer ${selectedFolders.length} dossier(s)`}
        confirmColor="bg-red-600 hover:bg-red-700"
      />
      {/* Navigation Menu */}
      <NavigationMenu
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        currentModule="notes"
      />
    </div>
  );
}
