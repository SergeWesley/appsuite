'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '@/hooks/usePWA';

export function UpdateNotification() {
  const { updateAvailable, updateApp } = usePWA();

  if (!updateAvailable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between"
      >
        <p className="text-sm">Une nouvelle version de l'application est disponible !</p>
        <button
          onClick={updateApp}
          className="ml-4 px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          Mettre à jour
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
