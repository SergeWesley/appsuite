"use client";

import { Globe, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useContextMenu } from "@/hooks/useContextMenu";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/ContextMenu";
import { motion } from "framer-motion";
import { BrowserApp } from "@/types/browser";

interface BrowserAppCardProps {
  app: BrowserApp;
  index: number;
  totalApps: number;
  onEdit: (app: BrowserApp) => void;
  onDelete: (app: BrowserApp) => void;
  onClick: (app: BrowserApp) => void;
  onMoveUp: (app: BrowserApp) => void;
  onMoveDown: (app: BrowserApp) => void;
}

export function BrowserAppCard({
  app,
  index,
  totalApps,
  onEdit,
  onDelete,
  onClick,
  onMoveUp,
  onMoveDown,
}: BrowserAppCardProps) {
  const isFirst = index === 0;
  const isLast = index === totalApps - 1;
  const { contextMenu, setContextMenu, contextMenuHandlers } = useContextMenu();

  const handleClick = () => {
    if (!contextMenu) {
      onClick(app);
    }
  };

  const handleMenuAction = (
    action: "edit" | "delete" | "moveUp" | "moveDown",
  ) => {
    setContextMenu(null);
    switch (action) {
      case "edit":
        onEdit(app);
        break;
      case "delete":
        onDelete(app);
        break;
      case "moveUp":
        onMoveUp(app);
        break;
      case "moveDown":
        onMoveDown(app);
        break;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all cursor-pointer group select-none"
        onClick={handleClick}
        {...contextMenuHandlers}
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
      <ContextMenu position={contextMenu} onClose={() => setContextMenu(null)}>
        <ContextMenuItem
          onClick={() => handleMenuAction("moveUp")}
          disabled={isFirst}
          icon={<ArrowUp size={16} />}
          label="Déplacer vers le haut"
        />
        <ContextMenuItem
          onClick={() => handleMenuAction("moveDown")}
          disabled={isLast}
          icon={<ArrowDown size={16} />}
          label="Déplacer vers le bas"
        />
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => handleMenuAction("edit")}
          icon={<Pencil size={16} />}
          label="Modifier"
        />
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => handleMenuAction("delete")}
          icon={<Trash2 size={16} />}
          label="Supprimer"
          danger
        />
      </ContextMenu>
    </>
  );
}
