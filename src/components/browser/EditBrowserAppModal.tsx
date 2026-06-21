"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserApp, BrowserAppFormData } from "@/types/browser";
import { X, Globe, Link, Type, Image } from "lucide-react";

interface EditBrowserAppModalProps {
  isOpen: boolean;
  app: BrowserApp | null;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<BrowserAppFormData>) => void;
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return "";
  }
}

export function EditBrowserAppModal({
  isOpen,
  app,
  onClose,
  onSubmit,
}: EditBrowserAppModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [useCustomIcon, setUseCustomIcon] = useState(false);

  // Préremplir le formulaire quand l'app change
  useEffect(() => {
    if (app) {
      setName(app.name);
      setUrl(app.url);
      const autoFavicon = getFaviconUrl(app.url);
      if (app.icon_url && app.icon_url !== autoFavicon) {
        setIconUrl(app.icon_url);
        setUseCustomIcon(true);
      } else {
        setIconUrl("");
        setUseCustomIcon(false);
      }
    }
  }, [app]);

  const normalizedUrl = normalizeUrl(url);
  const autoFaviconUrl = normalizedUrl ? getFaviconUrl(normalizedUrl) : "";
  const resolvedIconUrl = useCustomIcon ? iconUrl : autoFaviconUrl;

  const isValidUrl = (() => {
    try {
      if (!normalizedUrl) return false;
      new URL(normalizedUrl);
      return true;
    } catch {
      return false;
    }
  })();

  const canSubmit = name.trim() !== "" && isValidUrl;

  const handleSubmit = () => {
    if (!canSubmit || !app) return;

    onSubmit(app.id, {
      name: name.trim(),
      url: normalizedUrl,
      icon_url: resolvedIconUrl || null,
    });

    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && app && (
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
                  <div className="p-2 rounded-lg bg-teal-50">
                    <Globe size={20} className="text-teal-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Modifier l&apos;application
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
              {/* Preview */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {resolvedIconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolvedIconUrl}
                      alt="Icône du site"
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Globe size={32} className="text-gray-300" />
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <Type size={14} />
                  Nom de l&apos;application
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Twitter, Mon Dashboard..."
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
              </div>

              {/* URL */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <Link size={14} />
                  URL du site
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Ex: google.com ou https://example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
                {url && !isValidUrl && (
                  <p className="text-xs text-red-500 mt-1">
                    Veuillez entrer une URL valide
                  </p>
                )}
              </div>

              {/* Custom Icon Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setUseCustomIcon(!useCustomIcon)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors"
                >
                  <Image size={14} />
                  {useCustomIcon
                    ? "Utiliser le favicon automatique"
                    : "Personnaliser l'icône"}
                </button>

                {useCustomIcon && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    <input
                      type="text"
                      value={iconUrl}
                      onChange={(e) => setIconUrl(e.target.value)}
                      placeholder="https://example.com/icon.png"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    />
                  </motion.div>
                )}
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
                disabled={!canSubmit}
                className="flex-1 px-4 py-3 text-white bg-teal-500 rounded-xl hover:bg-teal-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enregistrer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
