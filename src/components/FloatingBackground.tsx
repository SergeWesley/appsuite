"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { appModules } from "@/config/modules";

interface FloatingIconProps {
  Icon: React.ElementType;
  index: number;
  colorClass: string;
  maxOpacity?: number;
}

/**
 * Composant représentant une icône flottante individuelle avec des
 * animations de déplacement et de rotation aléatoires.
 */
const FloatingIcon = ({ Icon, index, colorClass, maxOpacity = 0.25 }: FloatingIconProps) => {
  const [mounted, setMounted] = useState(false);
  const [randomProps, setRandomProps] = useState({
    x: 0,
    y: 0,
    size: 0,
    duration: 0,
    delay: 0,
    amplitudeX: 0,
    distanceY: 0,
    rotation: 0,
  });

  useEffect(() => {
    setRandomProps({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 20,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * -10,
      amplitudeX: Math.random() * 60 - 30,
      distanceY: -(Math.random() * 300 + 200),
      rotation: Math.random() * 30 - 15,
    });
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className={`absolute pointer-events-none ${colorClass}`}
      style={{
        left: `${randomProps.x}%`,
        top: `${randomProps.y}%`,
      } as React.CSSProperties}
      animate={{
        y: [0, randomProps.distanceY],
        x: [0, randomProps.amplitudeX, -randomProps.amplitudeX, 0],
        rotate: [0, randomProps.rotation, -randomProps.rotation, 0],
        opacity: [0, maxOpacity, maxOpacity, 0],
      }}
      transition={{
        duration: randomProps.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: randomProps.delay,
      }}
    >
      <Icon size={randomProps.size} />
    </motion.div>
  );
};

/**
 * Arrière-plan animé affichant des icônes flottantes générées à
 * partir des modules de l'application.
 */
export const FloatingBackground = ({ opacity = 0.25 }: { opacity?: number }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Icônes flottantes */}
      {appModules.map((module, i) => (
        <FloatingIcon key={i} Icon={module.icon} index={i} colorClass={module.theme.text} maxOpacity={opacity} />
      ))}
      {/* On double le nombre d'icônes pour plus de densité visuelle */}
      {appModules.map((module, i) => (
        <FloatingIcon key={`second-${i}`} Icon={module.icon} index={i + appModules.length} colorClass={module.theme.text} maxOpacity={opacity} />
      ))}
    </div>
  );
};
