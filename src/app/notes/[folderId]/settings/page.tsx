"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Settings, 
  Save, 
  Trash2,
  FolderOpen
} from "lucide-react";
import { useNoteFolders } from "@/hooks/notes/useNoteFolders";
import { FOLDER_COLORS, CustomFieldDefinition, NoteFolder } from "@/types/notes";
import { CustomFieldsBuilder } from "@/components/notes/CustomFieldsBuilder";
import { ConfirmationModal } from "@/components/tracker/ConfirmationModal";

export default function FolderSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params.folderId as string;

  const { folders, loading, updateFolder, updateFolderFields, deleteFolder } = useNoteFolders();
  
  const [folder, setFolder] = useState<NoteFolder | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("#f59e0b");
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialisation à partir des données réelles
  useEffect(() => {
    if (folders.length > 0) {
      const found = folders.find((f) => f.id === folderId);
      if (found) {
        setFolder(found);
        setFolderName(found.name);
        setFolderColor(found.color || "#f59e0b");
        setFields(found.customFields || []);
      } else {
        // Dossier introuvable
        router.push("/notes");
      }
    }
  }, [folders, folderId, router]);

  const handleSave = async () => {
    if (!folder) return;
    setIsSaving(true);
    try {
      // 1. Sauvegarde des infos de base
      if (folderName !== folder.name || folderColor !== folder.color) {
        await updateFolder(folder.id, { name: folderName, color: folderColor });
      }
      
      // 2. Sauvegarde des champs personnalisés
      await updateFolderFields(folder.id, fields);
      
      // Retour au parent
      const parentUrl = folder.parentId ? `/notes/${folder.parentId}` : "/notes";
      router.push(parentUrl);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde.");
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (!folder) return;
    const parentUrl = folder.parentId ? `/notes/${folder.parentId}` : "/notes";
    router.push(parentUrl);
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
      alert("Une erreur s'est produite lors de la suppression.");
    }
  };

  if (loading || !folder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HEADER FIXE */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Retour au dossier"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-500" />
                <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                  Paramètres du dossier
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium disabled:opacity-50 shadow-sm"
              >
                <Save size={16} />
                <span className="hidden sm:inline">
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* IDENTITÉ DU DOSSIER */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
              <FolderOpen size={20} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Identité & Apparence</h2>
              <p className="text-xs text-gray-500">Gérez le nom et la couleur de ce dossier.</p>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom du dossier</label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Couleur du dossier</label>
              <div className="flex flex-wrap gap-3">
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setFolderColor(c.value)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      folderColor === c.value ? "ring-2 ring-offset-4 ring-gray-400 scale-110 shadow-md" : "hover:scale-110 hover:shadow-sm"
                    }`}
                    title={c.label}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MODÈLE DE DONNÉES */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
              <Settings size={20} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Modèle de données</h2>
              <p className="text-xs text-gray-500">
                Créez des champs sur-mesure pour vos notes. Chaque note dans ce dossier héritera de cette structure.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-gray-50/30">
            <CustomFieldsBuilder 
              fields={fields} 
              onChange={setFields} 
            />
          </div>
        </section>

        {/* ZONE DE DANGER */}
        <section className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden mt-12">
          <div className="p-6 border-b border-red-100 bg-red-50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-red-100">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-red-900">Zone de danger</h2>
              <p className="text-xs text-red-500">Actions irréversibles pour ce dossier.</p>
            </div>
          </div>
          <div className="p-6">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 font-medium text-sm transition-colors"
            >
              Supprimer le dossier définitivement
            </button>
          </div>
        </section>

      </main>

      {/* MODALE DEDIEE */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteFolder}
        title="Supprimer le dossier"
        message="Êtes-vous sûr de vouloir supprimer ce dossier et toutes ses notes ? Cette action est irréversible."
        confirmLabel="Oui, supprimer"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
