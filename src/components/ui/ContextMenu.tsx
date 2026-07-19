"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ContextMenuPosition {
  x: number;
  y: number;
}

interface ContextMenuProps {
  position: ContextMenuPosition | null;
  onClose: () => void;
  children: React.ReactNode;
}

export function ContextMenu({ position, onClose, children }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!position) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [position, onClose]);

  const getPositionStyle = () => {
    if (!position || typeof window === "undefined") return {};

    const isBottom = position.y > window.innerHeight / 2;
    const isRight = position.x > window.innerWidth / 2;

    return {
      ...(isBottom ? { bottom: window.innerHeight - position.y } : { top: position.y }),
      ...(isRight ? { right: window.innerWidth - position.x } : { left: position.x }),
      transformOrigin: `${isRight ? "right" : "left"} ${isBottom ? "bottom" : "top"}`,
    };
  };

  return (
    <AnimatePresence>
      {position && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.12 }}
          className="fixed z-[60] bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 min-w-[180px] overflow-hidden"
          style={getPositionStyle()}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ContextMenuItemProps {
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  label: string;
  danger?: boolean;
}

export function ContextMenuItem({ onClick, disabled, icon, label, danger }: ContextMenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
        danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {icon && (
        <span className={danger ? "text-red-400" : "text-gray-400"}>
          {icon}
        </span>
      )}
      {label}
    </button>
  );
}

export function ContextMenuSeparator() {
  return <div className="mx-3 border-t border-gray-100" />;
}
