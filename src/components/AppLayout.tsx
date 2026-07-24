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
    <div className={`fixed top-0 left-0 w-full h-[100dvh] flex flex-col overflow-hidden overscroll-none ${bgClass}`}>
      <div className="shrink-0 z-40">
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
      </div>
      
      <main className={`flex-1 overflow-y-auto overscroll-y-contain ${maxWidth} mx-auto ${noPadding ? "" : padding}`}>
        {children}
      </main>
    </div>
  );
}
