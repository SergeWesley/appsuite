"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { NavigationMenu } from "@/components/NavigationMenu";
import { AppLayout } from "@/components/AppLayout";
import { Wallet, LogOut, User, Plus, Receipt } from "lucide-react";
import { FloatingAddButton } from "@/components/tracker/FloatingAddButton";
import { useSubscriptions } from "@/hooks/spender/useSubscriptions";
import { SubscriptionCard } from "@/components/spender/SubscriptionCard";
import { CreateSubscriptionModal } from "@/components/spender/CreateSubscriptionModal";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { SubscriptionFormData } from "@/types/spender";

export default function SpenderPage() {
  
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
    <AppLayout
      title="Spender"
      icon={Wallet}
      iconColor="text-red-500"
      currentModule="spender"
      padding="px-4 sm:px-6 lg:px-8 py-8 pb-24"
    >
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
    </AppLayout>
  );
}
