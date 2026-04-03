"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Subscription } from "@/types/spender";
import { Trash2, CreditCard, ExternalLink } from "lucide-react";

interface SubscriptionCardProps {
  subscription: Subscription;
  index: number;
  onDelete?: (id: string) => void;
}

const SWIPE_THRESHOLD = -80;

export function SubscriptionCard({ subscription, index, onDelete }: SubscriptionCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.6, 0]);
  const deleteScale = useTransform(x, [-100, -50, 0], [1, 0.8, 0.5]);

  const handleDragEnd = (_: never, info: PanInfo) => {
    if (info.offset.x < SWIPE_THRESHOLD) {
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(subscription.id);
    }
  };

  const handleSnapBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRevealed(false);
  };

  const hasColor = !!subscription.color;
  const iconColor = subscription.color || "#10B981"; // Emerald-500 fallback

  // Convert hex to rgb for background with opacity
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '16, 185, 129';
  };

  const bgColor = `rgba(${hexToRgb(iconColor)}, 0.1)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="relative overflow-hidden rounded-xl w-full"
    >
      {/* Delete background (revealed on swipe) */}
      <motion.div
        style={{ opacity: isRevealed ? 1 : deleteOpacity, scale: isRevealed ? 1 : deleteScale }}
        className="absolute inset-0 bg-red-500 rounded-xl flex items-center justify-end pr-6"
      >
        <button
          onClick={handleDelete}
          className="flex flex-col items-center gap-1 text-white"
          aria-label="Supprimer l'abonnement"
        >
          <Trash2 size={24} />
          <span className="text-xs font-medium">Supprimer</span>
        </button>
      </motion.div>

      {/* Card content (draggable) */}
      <motion.div
        drag={onDelete ? "x" : false}
        dragDirectionLock
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: isRevealed ? -100 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        style={{ x: isRevealed ? undefined : x }}
        className={`w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all touch-pan-y ${onDelete ? "cursor-grab active:cursor-grabbing" : ""}`}
        onClick={isRevealed ? handleSnapBack : undefined}
      >
        <div className="flex items-center gap-4">
          <div 
            className="p-3 rounded-xl flex-shrink-0"
            style={{ backgroundColor: bgColor }}
          >
            <CreditCard size={24} style={{ color: iconColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-900 truncate pr-2 text-lg">
                {subscription.name}
              </h3>
              <div className="text-right">
                <p className="font-bold text-gray-900">{subscription.amount.toFixed(2)} €</p>
                <p className="text-xs text-gray-500">/ mois</p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="inline-block px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border">
                {subscription.category}
              </span>
              <p className="text-sm text-gray-500">
                Le {subscription.billing_date} du mois
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-1 sm:ml-2">
            {subscription.app_link && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(subscription.app_link, "_blank", "noopener,noreferrer");
                }}
                className="p-2 text-gray-400 hover:text-emerald-500 transition-colors rounded-lg active:bg-emerald-50 sm:hover:bg-emerald-50"
                aria-label="Ouvrir l'application"
                title="Ouvrir l'application"
              >
                <ExternalLink size={20} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="hidden sm:flex text-gray-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                aria-label="Supprimer"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
