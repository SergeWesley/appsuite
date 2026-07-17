import React from "react";
import { AppHeader } from "@/components/AppHeader";
import { LucideIcon } from "lucide-react";
import { ModuleId } from "@/config/modules";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  currentModule: ModuleId | "dashboard";
  actions?: React.ReactNode;
  onBack?: () => void;
  maxWidth?: string;
  padding?: string;
  noPadding?: boolean;
  bgClass?: string;
  height?: string;
}

export function AppLayout({
  children,
  title,
  icon,
  iconColor,
  currentModule,
  actions,
  onBack,
  maxWidth = "w-full",
  padding = "px-4 sm:px-6 lg:px-8 py-8",
  noPadding = false,
  bgClass = "bg-gray-50",
  height,
}: AppLayoutProps) {
  return (
    <div className={`min-h-screen ${bgClass}`}>
      <AppHeader
        title={title}
        icon={icon}
        iconColor={iconColor}
        currentModule={currentModule as any}
        actions={actions}
        onBack={onBack}
        maxWidth="w-full" // L'en-tête est toujours en largeur maximale fluide
        height={height}
      />
      
      <main className={`${maxWidth} mx-auto ${noPadding ? "" : padding}`}>
        {children}
      </main>
    </div>
  );
}
