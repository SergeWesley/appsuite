"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useNoteFolders } from "@/hooks/notes/useNoteFolders";
import { NoteFolder, NoteFolderFormData, NoteExportData } from "@/types/notes";
import { FolderCard } from "@/components/notes/FolderCard";
import { CreateFolderModal } from "@/components/notes/CreateFolderModal";
import { MoveFolderModal } from "@/components/notes/MoveFolderModal";
import { useImportNote } from "@/components/notes/ImportNoteButton";
import { FloatingAddButton } from "@/components/tracker/FloatingAddButton";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { StickyNote, MoreVertical, Upload, LayoutGrid, List, ArrowDownAZ, ArrowUpZA, ArrowUpDown } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useFilterPersistence } from "@/hooks/useFilterPersistence";
import { sortFolders, getNextSortOrder, SortOrder } from "@/lib/folder-utils";

export default function NotesPage() {
  // Cette page affiche la liste des dossiers de notes de l'utilisateur
  const router = useRouter();
  const { folders, loading, addFolder, importNoteData, deleteFolder, moveFolder, reorderFolder } =
    useNoteFolders();
  const { triggerImport, ImportInput } = useImportNote((data) => handleImport(data));
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [folderToMove, setFolderToMove] = useState<NoteFolder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<NoteFolder | null>(null);

  // Filtre les dossiers racines
  const rootFolders = folders.filter((f) => !f.parentId);

  const { selectedViewMode, folderSortOrder, updateFilter } = useFilterPersistence("appsuite_notes_root_view", { selectedViewMode: "grid", folderSortOrder: "custom" });
  const viewMode = (selectedViewMode as "grid" | "list") || "grid";
  const sortOrder = (folderSortOrder as SortOrder) || "custom";

  const handleViewModeChange = (mode: "grid" | "list") => {
    updateFilter("selectedViewMode", mode);
  };

  const handleSortToggle = () => {
    updateFilter("folderSortOrder", getNextSortOrder(sortOrder));
  };

  const displayedFolders = sortFolders(rootFolders, sortOrder);

  // Gère la création d'un nouveau dossier
  const handleCreateFolder = async (data: NoteFolderFormData) => {
    // Ajoute le dossier et ferme la modale de création
    const folder = await addFolder(data);
    if (folder) {
      setShowCreateFolderModal(false);
    }
  };

  // Gère l'importation de notes
  const handleImport = async (data: NoteExportData) => {
    // Importe les notes et affiche un message de succès
    const success = await importNoteData(data, null);
    if (success) {
      alert("Note importée avec succès !");
    }
  };

  // Gère le clic sur un dossier
  const handleFolderClick = (f: NoteFolder, e: React.MouseEvent) => {
    // Sélectionne ou désélectionne le dossier si le clic est effectué avec Ctrl ou Meta
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      setSelectedFolders((prev) =>
        prev.includes(f.id)
          ? prev.filter((id) => id !== f.id)
          : [...prev, f.id],
      );
    } else {
      // Navigue vers la page du dossier
      router.push(`/notes/${f.id}`);
    }
  };

  // Gère le déplacement d'un dossier
  const handleMoveFolder = async (folderId: string, newParentId: string | null) => {
    // Déplace le dossier et affiche un message d'erreur si nécessaire
    const success = await moveFolder(folderId, newParentId);
    if (!success) {
      alert("Erreur lors du déplacement du dossier.");
    }
  };

  // Gère la suppression d'un dossier
  const handleSingleDelete = async () => {
    // Supprime le dossier sélectionné
    if (!folderToDelete) return;
    const success = await deleteFolder(folderToDelete.id);
    if (!success) {
      alert("Erreur lors de la suppression du dossier.");
    }
    setFolderToDelete(null);
  };

  // Gère la suppression de plusieurs dossiers
  const handleBulkDelete = async () => {
    // Supprime les dossiers sélectionnés et affiche un message d'erreur si nécessaire
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

  // Définit les raccourcis clavier
  useKeyboardShortcut([
    {
      key: "n",
      altKey: true,
      shiftKey: false,
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
    <AppLayout
      title="Notes"
      icon={StickyNote}
      iconColor="text-amber-500"
      currentModule="notes"
      padding="px-4 sm:px-6 lg:px-8 py-8 pb-24"
      actions={
        <>
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="p-2 text-gray-500 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50">
              <MoreVertical size={20} />
            </MenuButton>

            <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 focus:outline-none">
              <div className="py-1">
                <MenuItem
                  as="button"
                  onClick={triggerImport}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2 hover:bg-gray-100"
                >
                  <Upload size={16} />
                  Importer
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
          <ImportInput />
        </>
      }
    >


        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mes dossiers
            </h1>
            <p className="text-gray-600">
              {rootFolders.length} dossier{rootFolders.length > 1 ? "s" : ""}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSortToggle}
              className={`p-1.5 rounded-md transition-all flex items-center gap-1 border ${
                sortOrder !== "custom" 
                  ? "bg-amber-50 text-amber-600 border-amber-200" 
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
              title={sortOrder === "asc" ? "Trié de A à Z" : sortOrder === "desc" ? "Trié de Z à A" : "Tri personnalisé"}
            >
              {sortOrder === "asc" && <ArrowDownAZ size={18} />}
              {sortOrder === "desc" && <ArrowUpZA size={18} />}
              {sortOrder === "custom" && <ArrowUpDown size={18} />}
            </button>
            <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg border border-gray-200/50">
            <button
              onClick={() => handleViewModeChange("grid")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid" 
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
              title="Vue grille"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => handleViewModeChange("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list" 
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              <List size={18} />
            </button>
          </div>
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
          <div className={viewMode === "grid" ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2" : "flex flex-col gap-2"}>
            {displayedFolders.map((folder, index) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                index={index}
                isSelected={selectedFolders.includes(folder.id)}
                totalFolders={displayedFolders.length}
                subfolderCount={
                  folders.filter((f) => f.parentId === folder.id).length
                }
                onClick={handleFolderClick}
                onConfig={(f) => router.push(`/notes/${f.id}/settings`)}
                onMove={(f) => setFolderToMove(f)}
                onMoveUp={sortOrder === "custom" ? (f) => reorderFolder(f.id, "up") : undefined}
                onMoveDown={sortOrder === "custom" ? (f) => reorderFolder(f.id, "down") : undefined}
                onDelete={(f) => setFolderToDelete(f)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}


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
    </AppLayout>
  );
}
