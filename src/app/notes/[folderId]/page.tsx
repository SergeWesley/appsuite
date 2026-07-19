"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useNoteFolders } from "@/hooks/notes/useNoteFolders";
import { useNotes } from "@/hooks/notes/useNotes";
import { useNoteTemplates } from "@/hooks/notes/useNoteTemplates";
import { NoteFolder, Note } from "@/types/notes";
import { NoteCard } from "@/components/notes/NoteCard";
import { FolderCard } from "@/components/notes/FolderCard";
import { CreateFolderModal } from "@/components/notes/CreateFolderModal";
import { MoveFolderModal } from "@/components/notes/MoveFolderModal";
import { useImportNote } from "@/components/notes/ImportNoteButton";
import { NoteFolderFormData, NoteExportData } from "@/types/notes";
import { FloatingAddButton } from "@/components/tracker/FloatingAddButton";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { TemplatePickerModal } from "@/components/notes/TemplatePickerModal";
import {
  Trash2,
  FolderPlus,
  Settings,
  MoreVertical,
  Upload,
  LayoutGrid,
  List,
  ArrowDownAZ,
  ArrowUpZA,
  ArrowUpDown
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useFilterPersistence } from "@/hooks/useFilterPersistence";
import { sortFolders, getNextSortOrder, SortOrder } from "@/lib/folder-utils";

export default function FolderPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params.folderId as string;

  const {
    folders,
    deleteFolder,
    addFolder,
    importNoteData,
    moveFolder,
    reorderFolder,
  } = useNoteFolders();
  const { triggerImport, ImportInput } = useImportNote((data) => handleImport(data));
  const { notes, loading, addNote, deleteNote, updateNote } = useNotes(folderId);
  const { templates } = useNoteTemplates(folderId);
  const [folder, setFolder] = useState<NoteFolder | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [folderToMove, setFolderToMove] = useState<NoteFolder | null>(null);
  const [subFolderToDelete, setSubFolderToDelete] = useState<NoteFolder | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const { selectedViewMode, folderSortOrder, updateFilter } = useFilterPersistence("appsuite_notes_folder_view", { selectedViewMode: "grid", folderSortOrder: "custom" });
  const viewMode = (selectedViewMode as "grid" | "list") || "grid";
  const sortOrder = (folderSortOrder as SortOrder) || "custom";

  const handleViewModeChange = (mode: "grid" | "list") => {
    updateFilter("selectedViewMode", mode);
  };

  const handleSortToggle = () => {
    updateFilter("folderSortOrder", getNextSortOrder(sortOrder));
  };

  const subFolders = folders.filter((f) => f.parentId === folderId);
  const displayedSubFolders = sortFolders(subFolders, sortOrder);

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

  const handleDeleteSubFolder = async () => {
    if (!subFolderToDelete) return;
    const success = await deleteFolder(subFolderToDelete.id);
    if (!success) {
      alert("Une erreur s'est produite lors de la suppression du sous-dossier.");
    }
    setSubFolderToDelete(null);
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    const success = await deleteNote(noteToDelete.id);
    if (!success) {
      alert("Une erreur s'est produite lors de la suppression de la note.");
    }
    setNoteToDelete(null);
  };

  const handleToggleLock = async (note: Note) => {
    const success = await updateNote(note.id, { isLocked: !note.isLocked });
    if (!success) {
      alert("Erreur lors de la modification du verrouillage de la note.");
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
    <AppLayout
      title={folder?.name || "Dossier"}
      currentModule="notes"
      onBack={() => {
        if (folder?.parentId) {
          router.push(`/notes/${folder.parentId}`);
        } else {
          router.push("/notes");
        }
      }}
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
                  Importer une note
                </MenuItem>
                <MenuItem
                  as="button"
                  onClick={() => router.push(`/notes/${folderId}/settings`)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2 hover:bg-gray-100"
                >
                  <Settings size={16} />
                  Paramètres
                </MenuItem>
                <MenuItem
                  as="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 flex items-center gap-2 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Supprimer
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
          <ImportInput />
        </>
      }
    >


        {/* Sub-folders Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Sous-dossiers ({subFolders.length})
            </h2>
            <div className="flex items-center gap-2">
              {subFolders.length > 0 && (
                <>
                  <button
                    onClick={handleSortToggle}
                    className={`p-1 rounded-md transition-all flex items-center gap-1 border ${
                      sortOrder !== "custom" 
                        ? "bg-amber-50 text-amber-600 border-amber-200" 
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                    title={sortOrder === "asc" ? "Trié de A à Z" : sortOrder === "desc" ? "Trié de Z à A" : "Tri personnalisé"}
                  >
                    {sortOrder === "asc" && <ArrowDownAZ size={14} />}
                    {sortOrder === "desc" && <ArrowUpZA size={14} />}
                    {sortOrder === "custom" && <ArrowUpDown size={14} />}
                  </button>
                  <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg border border-gray-200/50 mr-1">
                  <button
                    onClick={() => handleViewModeChange("grid")}
                    className={`p-1 rounded-md transition-all ${
                      viewMode === "grid" 
                        ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                    }`}
                    title="Vue grille"
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    onClick={() => handleViewModeChange("list")}
                    className={`p-1 rounded-md transition-all ${
                      viewMode === "list" 
                        ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                    }`}
                    title="Vue liste"
                  >
                    <List size={14} />
                  </button>
                </div>
                </>
              )}
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
            <div className={viewMode === "grid" ? "grid grid-cols-3 sm:grid-cols-3 gap-2 mb-6" : "flex flex-col gap-2 mb-6"}>
              {displayedSubFolders.map((sf, index) => (
                <FolderCard
                  key={sf.id}
                  folder={sf}
                  index={index}
                  isSelected={selectedFolders.includes(sf.id)}
                  totalFolders={displayedSubFolders.length}
                  subfolderCount={
                    folders.filter((f) => f.parentId === sf.id).length
                  }
                  onClick={handleFolderClick}
                  onConfig={(f) => router.push(`/notes/${f.id}/settings`)}
                  onMove={(f) => setFolderToMove(f)}
                  onMoveUp={sortOrder === "custom" ? (f) => reorderFolder(f.id, "up") : undefined}
                  onMoveDown={sortOrder === "custom" ? (f) => reorderFolder(f.id, "down") : undefined}
                  onDelete={(f) => setSubFolderToDelete(f)}
                  viewMode={viewMode}
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
                onDelete={(n) => setNoteToDelete(n)}
                onToggleLock={handleToggleLock}
              />
            ))}
          </div>
        )}


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

      {/* Delete Confirmation Modal for Current Folder */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteFolder}
        title="Supprimer le dossier"
        message="Êtes-vous sûr de vouloir supprimer ce dossier et toutes ses notes ? Cette action est irréversible."
        confirmLabel="Supprimer"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {/* Delete Confirmation Modal for SubFolder from Context Menu */}
      <ConfirmationModal
        isOpen={!!subFolderToDelete}
        onClose={() => setSubFolderToDelete(null)}
        onConfirm={handleDeleteSubFolder}
        title="Supprimer le sous-dossier"
        message={`Êtes-vous sûr de vouloir supprimer le sous-dossier « ${subFolderToDelete?.name} » et toutes ses notes ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {/* Delete Confirmation Modal for Note from Context Menu */}
      <ConfirmationModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleDeleteNote}
        title="Supprimer la note"
        message={`Êtes-vous sûr de vouloir supprimer la note « ${noteToDelete?.title || "Sans titre"} » ? Cette action est irréversible.`}
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
    </AppLayout>
  );
}
