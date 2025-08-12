'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '@/hooks/usePWA';
import { ArrowDownCircle } from 'lucide-react';

export function UpdateNotification() {
  const { updateAvailable, updateApp } = usePWA();

  if (!updateAvailable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 mx-auto max-w-md p-4 z-50"
      >
        <motion.div 
          className="bg-gradient-to-tr from-blue-600 to-blue-500 text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-4 backdrop-blur-sm bg-opacity-95"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex-1 flex items-center gap-3">
            <ArrowDownCircle className="w-5 h-5 text-blue-100" />
            <p className="text-sm font-medium">
              Une nouvelle version de l'application est disponible !
            </p>
          </div>
          <button
            onClick={updateApp}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium backdrop-blur-sm transition-colors flex items-center justify-center gap-2"
          >
            Mettre à jour
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
