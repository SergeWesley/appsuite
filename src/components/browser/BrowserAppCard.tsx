"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserApp } from "@/types/browser";
import { Globe, Pencil, Trash2 } from "lucide-react";

interface BrowserAppCardProps {
  app: BrowserApp;
  index: number;
  onEdit: (app: BrowserApp) => void;
  onDelete: (app: BrowserApp) => void;
  onClick: (app: BrowserApp) => void;
}

interface ContextMenuPosition {
  x: number;
  y: number;
}

export function BrowserAppCard({
  app,
  index,
  onEdit,
  onDelete,
  onClick,
}: BrowserAppCardProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu contextuel quand on clique ailleurs
  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [contextMenu]);

  // Clic droit (desktop)
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY });
    },
    [],
  );

  // Long press (mobile)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      longPressTimerRef.current = setTimeout(() => {
        setContextMenu({ x: touch.clientX, y: touch.clientY });
      }, 500);
    },
    [],
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleClick = () => {
    if (!contextMenu) {
      onClick(app);
    }
  };

  const handleMenuAction = (action: "edit" | "delete") => {
    setContextMenu(null);
    if (action === "edit") {
      onEdit(app);
    } else {
      onDelete(app);
    }
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all cursor-pointer group select-none"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden group-hover:shadow-md transition-shadow">
          {app.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={app.icon_url}
              alt={app.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
              }}
            />
          ) : (
            <Globe size={24} className="text-gray-400" />
          )}
        </div>
        <span className="text-xs text-gray-700 text-center font-medium truncate w-full">
          {app.name}
        </span>
      </motion.div>

      {/* Menu contextuel */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="fixed z-[60] bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 min-w-[180px] overflow-hidden"
            style={{
              left: `min(${contextMenu.x}px, calc(100vw - 200px))`,
              top: `min(${contextMenu.y}px, calc(100vh - 120px))`,
            }}
          >
            <button
              onClick={() => handleMenuAction("edit")}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Pencil size={16} className="text-gray-400" />
              Modifier
            </button>
            <div className="mx-3 border-t border-gray-100" />
            <button
              onClick={() => handleMenuAction("delete")}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <Trash2 size={16} className="text-red-400" />
              Supprimer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
