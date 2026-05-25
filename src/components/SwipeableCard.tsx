"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo, HTMLMotionProps } from "framer-motion";
import { Trash2 } from "lucide-react";

interface SwipeableCardProps
  extends Omit<
    HTMLMotionProps<"div">,
    | "onClick"
    | "onDragEnd"
    | "drag"
    | "dragDirectionLock"
    | "dragConstraints"
    | "dragElastic"
    | "animate"
    | "transition"
    | "style"
  > {
  children: React.ReactNode;
  onDelete?: () => void;
  onClick?: (e: React.MouseEvent) => void;
  index?: number;
  containerClassName?: string;
  deleteLabel?: string;
}

export function SwipeableCard({
  children,
  onDelete,
  onClick,
  index = 0,
  className = "",
  containerClassName = "",
  deleteLabel = "Supprimer",
  ...props
}: SwipeableCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.6, 0]);
  const deleteScale = useTransform(x, [-100, -50, 0], [1, 0.8, 0.5]);

  const handleDragEnd = (_: never, info: PanInfo) => {
    if (info.offset.x < -80) {
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  const handleSnapBack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRevealed(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isRevealed) {
      handleSnapBack(e);
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-xl ${containerClassName}`}
    >
      {/* Delete background */}
      {onDelete && (
        <motion.div
          style={{
            opacity: isRevealed ? 1 : deleteOpacity,
            scale: isRevealed ? 1 : deleteScale,
          }}
          className="absolute inset-0 bg-red-500 rounded-xl flex items-center justify-end pr-6"
        >
          <button
            onClick={handleDelete}
            className="flex flex-col items-center gap-1 text-white"
            aria-label={deleteLabel}
          >
            <Trash2 size={24} />
            <span className="text-xs font-medium">{deleteLabel}</span>
          </button>
        </motion.div>
      )}

      {/* Card content */}
      <motion.div
        drag={onDelete ? "x" : false}
        dragDirectionLock
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: isRevealed ? -120 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        style={{ x: isRevealed ? undefined : x }}
        className={`relative bg-white rounded-xl shadow-sm border border-gray-100 touch-pan-y ${className}`}
        onClick={handleCardClick}
        {...props}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
