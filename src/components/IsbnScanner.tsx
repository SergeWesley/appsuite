'use client';

import { useState } from 'react';
import { useZxing } from 'react-zxing';
import { ScanLine, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IsbnScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

export function IsbnScanner({ onScan, onClose }: IsbnScannerProps) {
  const [error, setError] = useState<string | null>(null);

  const { ref } = useZxing({
    onDecodeResult(result) {
      const barcode = result.getText();
      // Vérifier si c'est un ISBN valide (EAN-13 commençant par 978 ou 979)
      if (/^(978|979)\d{10}$/.test(barcode)) {
        onScan(barcode);
        onClose();
      } else {
        setError("Ce n'est pas un code ISBN valide. Veuillez scanner un code-barres de livre.");
        setTimeout(() => setError(null), 3000);
      }
    },
    onError(error) {
      console.error("Erreur du scanner:", error);
      setError("Impossible d'accéder à la caméra. Vérifiez vos permissions.");
    },
    constraints: {
        video: {
          facingMode: 'environment'
        }
      },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black z-[60] flex flex-col"
    >
      {/* Header */}
      <div className="relative p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          <h2 className="text-lg font-medium">Scanner un ISBN</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scanner */}
      <div className="flex-1 relative">
        <video
          ref={ref}
          className="w-full h-full object-cover"
        />
        
        {/* Guide visuel */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-32 border-2 border-white/50 rounded-lg relative overflow-hidden">
            <motion.div
              className="absolute left-0 right-0 h-0.5 bg-blue-500"
              initial={{ top: "0%" }}
              animate={{ top: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
        </div>

        {/* Message d'erreur */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-8 left-4 right-4 bg-red-500 text-white p-4 rounded-lg text-center text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <div className="absolute bottom-20 left-4 right-4 text-center text-white/70 text-sm">
          Placez le code-barres du livre dans le cadre
        </div>
      </div>
    </motion.div>
  );
}
