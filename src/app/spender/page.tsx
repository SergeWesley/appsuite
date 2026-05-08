"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Wallet, LogOut, User, Plus, Receipt } from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { FloatingAddButton } from "@/components/tracker/FloatingAddButton";
import { useSubscriptions } from "@/hooks/spender/useSubscriptions";
import { SubscriptionCard } from "@/components/spender/SubscriptionCard";
import { CreateSubscriptionModal } from "@/components/spender/CreateSubscriptionModal";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { SubscriptionFormData } from "@/types/spender";

export default function SpenderPage() {
  const { user, signOut } = useAuthContext();
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  
  const { subscriptions, loading, addSubscription, deleteSubscription } = useSubscriptions();
  const [showAddModal, setShowAddModal] = useState(false);
  const [subToDelete, setSubToDelete] = useState<string | null>(null);

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  const handleAddSubscription = async (data: SubscriptionFormData) => {
    const success = await addSubscription(data);
    if (success) {
      setShowAddModal(false);
    }
  };

  const confirmDelete = async () => {
    if (subToDelete) {
      const success = await deleteSubscription(subToDelete);
      if (success) {
        setSubToDelete(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header collé (Sticky) */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsNavMenuOpen(true)}
                className="flex items-center p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menu de navigation"
              >
                <div className="p-1.5 bg-red-50 rounded-lg">
                  <Wallet className="h-6 w-6 text-red-500" />
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-900">
                  Spender
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Page Title & Total Summary */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mes abonnements
          </h1>
          <p className="text-gray-600 mb-6">
            Gérez vos dépenses et abonnements récurrents
          </p>

          <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm flex items-center gap-6">
            <div className="p-4 bg-red-50 rounded-xl">
              <Receipt size={32} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total mensuel</p>
              <p className="text-3xl font-bold text-gray-900">{totalMonthly.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-red-500 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des abonnements...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && subscriptions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="p-4 bg-red-50 rounded-full mb-6">
              <Wallet size={48} className="text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Votre portefeuille est vide
            </h3>
            <p className="text-gray-500 text-center mb-6 max-w-sm">
              Commencez par ajouter votre premier abonnement pour prendre le contrôle.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
            >
              <Plus size={20} />
              Ajouter un abonnement
            </button>
          </motion.div>
        )}

        {/* Subscriptions List */}
        {!loading && subscriptions.length > 0 && (
          <div className="space-y-3">
            {subscriptions.map((sub, index) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                index={index}
                onDelete={(id) => setSubToDelete(id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <FloatingAddButton
        onClick={() => setShowAddModal(true)}
        label="Ajouter"
        color="bg-red-500 hover:bg-red-600"
      />

      {/* Create Modal */}
      <CreateSubscriptionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubscription}
      />

      {/* Navigation Menu */}
      <NavigationMenu
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        currentModule="spender"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={subToDelete !== null}
        onClose={() => setSubToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'abonnement"
        message="Êtes-vous sûr de vouloir supprimer cet abonnement ? Toutes les données associées seront perdues."
        confirmLabel="Supprimer"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
