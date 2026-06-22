"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/AppHeader";
import { AddBrowserAppModal } from "@/components/browser/AddBrowserAppModal";
import { EditBrowserAppModal } from "@/components/browser/EditBrowserAppModal";
import { BrowserAppCard } from "@/components/browser/BrowserAppCard";
import { FloatingAddButton } from "@/components/tracker/FloatingAddButton";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useBrowserApps } from "@/hooks/browser/useBrowserApps";
import { BrowserApp, BrowserAppFormData } from "@/types/browser";
import { Globe } from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";

export default function BrowserPage() {
  const { user } = useAuthContext();
  const { apps, loading, addApp, updateApp, deleteApp, reorderApp } = useBrowserApps();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState<BrowserApp | null>(null);
  const [deletingApp, setDeletingApp] = useState<BrowserApp | null>(null);

  const handleAddApp = async (data: BrowserAppFormData) => {
    const app = await addApp(data);
    if (app) {
      setShowAddModal(false);
    }
  };

  const handleEditApp = async (id: string, updates: Partial<BrowserAppFormData>) => {
    await updateApp(id, updates);
    setEditingApp(null);
  };

  const handleDeleteApp = async () => {
    if (!deletingApp) return;
    await deleteApp(deletingApp.id);
    setDeletingApp(null);
  };

  const handleAppClick = (app: BrowserApp) => {
    window.open(app.url, "_blank");
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Browser"
        icon={Globe}
        iconColor="text-teal-500"
        currentModule="browser"
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mes Web Apps
          </h1>
          <p className="text-gray-600">
            {apps.length > 0
              ? `${apps.length} application${apps.length > 1 ? "s" : ""}`
              : "Retrouvez tous vos sites favoris au même endroit"}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-teal-500 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des applications...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && apps.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-24 mb-6 opacity-30 text-teal-400">
              <Globe className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune application web
            </h3>
            <p className="text-gray-500 text-center mb-6 max-w-sm">
              Commencez par ajouter un site web pour l&apos;utiliser comme une
              application.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium"
            >
              Ajouter un site
            </button>
          </motion.div>
        )}

        {/* Apps grid */}
        {!loading && apps.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {apps.map((app, index) => (
              <BrowserAppCard
                key={app.id}
                app={app}
                index={index}
                totalApps={apps.length}
                onClick={handleAppClick}
                onEdit={(app) => setEditingApp(app)}
                onDelete={(app) => setDeletingApp(app)}
                onMoveUp={(app) => reorderApp(app.id, "up")}
                onMoveDown={(app) => reorderApp(app.id, "down")}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <FloatingAddButton
        onClick={() => setShowAddModal(true)}
        label="Ajouter un site"
        color="bg-teal-500 hover:bg-teal-600"
      />

      {/* Add App Modal */}
      <AddBrowserAppModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddApp}
      />

      {/* Edit App Modal */}
      <EditBrowserAppModal
        isOpen={!!editingApp}
        app={editingApp}
        onClose={() => setEditingApp(null)}
        onSubmit={handleEditApp}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingApp}
        onClose={() => setDeletingApp(null)}
        onConfirm={handleDeleteApp}
        title="Supprimer l'application"
        message={`Êtes-vous sûr de vouloir supprimer « ${deletingApp?.name} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
