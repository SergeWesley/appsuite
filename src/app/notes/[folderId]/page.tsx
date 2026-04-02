"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useNoteFolders } from "@/hooks/notes/useNoteFolders";
import { useNotes } from "@/hooks/notes/useNotes";
import { NoteFolder, Note } from "@/types/notes";
import { NoteCard } from "@/components/notes/NoteCard";
import { FloatingAddButton } from "@/components/tracker/FloatingAddButton";
import { NavigationMenu } from "@/components/NavigationMenu";
import {
  StickyNote,
  ArrowLeft,
  LogOut,
  User,
  FileText,
} from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export default function FolderPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params.folderId as string;
  const { user, signOut } = useAuthContext();

  const { folders } = useNoteFolders();
  const { notes, loading, addNote } = useNotes(folderId);
  const [folder, setFolder] = useState<NoteFolder | null>(null);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  // Find the folder info
  useEffect(() => {
    if (folders.length > 0) {
      const found = folders.find((f) => f.id === folderId);
      setFolder(found || null);
    }
  }, [folders, folderId]);

  const handleCreateNote = async () => {
    const note = await addNote({
      title: "Nouvelle note",
      content: "",
    });
    if (note) {
      router.push(`/notes/${folderId}/${note.id}`);
    }
  };

  const handleOpenNote = (note: Note) => {
    router.push(`/notes/${folderId}/${note.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/notes")}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Retour aux dossiers"
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Folder info */}
        <div className="mb-8">
          <p className="text-gray-500">
            {notes.length} note{notes.length > 1 ? "s" : ""}
          </p>
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

        {/* Empty state */}
        {!loading && notes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="p-4 bg-amber-50 rounded-2xl mb-6">
              <FileText size={40} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune note
            </h3>
            <p className="text-gray-500 text-center mb-6 max-w-sm">
              Ce dossier est vide. Créez votre première note !
            </p>
            <button
              onClick={handleCreateNote}
              className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium"
            >
              Créer une note
            </button>
          </motion.div>
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
        onClick={handleCreateNote}
        label="Créer une note"
        color="bg-amber-500 hover:bg-amber-600"
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
