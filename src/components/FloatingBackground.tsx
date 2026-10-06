"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { appModules } from "@/config/modules";

interface FloatingIconProps {
  Icon: React.ElementType;
  index: number;
  colorClass: string;
}

/**
 * Composant représentant une icône flottante individuelle avec des
 * animations de déplacement et de rotation aléatoires.
 */
const FloatingIcon = ({ Icon, index, colorClass }: FloatingIconProps) => {
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
      x: Math.random() * 100, // Position de départ aléatoire sur l'axe X (%)
      y: Math.random() * 100, // Position de départ aléatoire sur l'axe Y (%)
      size: Math.random() * 40 + 20, // Taille aléatoire entre 20 et 60px
      duration: Math.random() * 10 + 8, // Durée de l'animation aléatoire entre 8 et 18s (plus rapide)
      delay: Math.random() * -10, // Délai négatif ajusté proportionnellement
      amplitudeX: Math.random() * 60 - 30, // Balancier horizontal (bulles)
      distanceY: -(Math.random() * 300 + 200), // Distance de montée
      rotation: Math.random() * 30 - 15, // Léger balancement rotatif
    });
    setMounted(true);
  }, []);

  // Évite les erreurs d'hydratation (hydration mismatch) avec Next.js
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
        opacity: [0, 0.25, 0.25, 0],
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
export const FloatingBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Icônes flottantes */}
      {appModules.map((module, i) => (
        <FloatingIcon key={i} Icon={module.icon} index={i} colorClass={module.theme.text} />
      ))}
      {/* On double le nombre d'icônes pour plus de densité visuelle */}
      {appModules.map((module, i) => (
        <FloatingIcon key={`second-${i}`} Icon={module.icon} index={i + appModules.length} colorClass={module.theme.text} />
      ))}
    </div>
  );
};
