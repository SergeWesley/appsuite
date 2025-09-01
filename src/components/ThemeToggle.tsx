"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({ className = "", size = "md" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        shadow-sm hover:shadow-md
        flex items-center justify-center
        transition-all duration-200
        hover:scale-105 active:scale-95
        ${className}
      `}
      whileTap={{ scale: 0.95 }}
      aria-label={`Passer au mode ${theme === "light" ? "sombre" : "clair"}`}
      title={`Mode ${theme === "light" ? "sombre" : "clair"}`}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 90 }}
        transition={{ duration: 0.2 }}
      >
        {theme === "light" ? (
          <Moon 
            size={iconSizes[size]} 
            className="text-gray-600 dark:text-gray-300" 
          />
        ) : (
          <Sun 
            size={iconSizes[size]} 
            className="text-yellow-500" 
          />
        )}
      </motion.div>
    </motion.button>
  );
}
