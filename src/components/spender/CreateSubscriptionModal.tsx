"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SubscriptionFormData, SUBSCRIPTION_CATEGORIES, SUBSCRIPTION_TEMPLATES, SubscriptionTemplate } from "@/types/spender";
import { X, WalletCards } from "lucide-react";

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubscriptionFormData) => void;
}

export function CreateSubscriptionModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [billingDate, setBillingDate] = useState<number>(1);
  const [category, setCategory] = useState(SUBSCRIPTION_CATEGORIES[0]);
  const [appLink, setAppLink] = useState("");
  const [color, setColor] = useState("#10B981"); // Default Emerald 500

  const handleSelectTemplate = (template: SubscriptionTemplate) => {
    setName(template.name);
    setCategory(template.category);
    setAppLink(template.app_link);
    setColor(template.color);
  };

  const handleSubmit = () => {
    if (!name.trim() || !amount) return;
    onSubmit({
      name: name.trim(),
      amount: parseFloat(amount),
      billing_date: billingDate,
      category,
      app_link: appLink.trim() || undefined,
      color,
    });
    // Reset
    setName("");
    setAmount("");
    setBillingDate(1);
    setCategory(SUBSCRIPTION_CATEGORIES[0]);
    setAppLink("");
    setColor("#10B981");
  };

  const handleClose = () => {
    setName("");
    setAmount("");
    setBillingDate(1);
    setCategory(SUBSCRIPTION_CATEGORIES[0]);
    setAppLink("");
    setColor("#10B981");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <WalletCards size={20} className="text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Nouvel abonnement
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Templates */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Suggestions rapides
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                  {SUBSCRIPTION_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className="px-3 py-1.5 rounded-full border border-gray-200 text-sm font-medium whitespace-nowrap transition-colors hover:bg-gray-50"
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom du service
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Netflix, Spotify, Salle de sport..."
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Amount and Billing Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Prix mensuel (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="9.99"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Jour de prélèvement
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={billingDate}
                    onChange={(e) => setBillingDate(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
                >
                  {SUBSCRIPTION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* App Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Lien de l'application (Optionnel)
                </label>
                <input
                  type="text"
                  value={appLink}
                  onChange={(e) => setAppLink(e.target.value)}
                  placeholder="Ex: netflix:// ou https://..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || !amount}
                className="flex-1 px-4 py-3 text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
