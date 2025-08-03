'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function InstallPWA() {
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {isInstallable && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50"
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">
                  Installer Booker
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Accédez rapidement à votre bibliothèque depuis votre écran d'accueil
                </p>
              </div>
              <div className="flex-shrink-0 flex gap-2">
                <button
                  onClick={installApp}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Installer
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Indicateur de statut de connexion */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-4 right-4 z-40"
      >
        <div className={`p-2 rounded-full ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 