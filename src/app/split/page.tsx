"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { appModules } from "@/config/modules";
import { AppHeader } from "@/components/AppHeader";
import { SplitSquareVertical, X, ArrowRight, Layers } from "lucide-react";
import { motion } from "framer-motion";

function SplitScreenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const app1Id = searchParams.get("app1");
  const app2Id = searchParams.get("app2");
  
  const [selectedApp1, setSelectedApp1] = useState(app1Id || "");
  const [selectedApp2, setSelectedApp2] = useState(app2Id || "");

  const availableApps = appModules.filter((m) => m.id !== "split");

  const handleLaunch = () => {
    if (selectedApp1 && selectedApp2) {
      router.push(`/split?app1=${selectedApp1}&app2=${selectedApp2}`);
    }
  };

  const handleClose = () => {
    router.push("/dashboard");
  };

  // Mode Espace de Travail (Split Screen Actif)
  if (app1Id && app2Id) {
    const app1 = availableApps.find(m => m.id === app1Id);
    const app2 = availableApps.find(m => m.id === app2Id);

    if (!app1 || !app2) {
      return <div>Applications invalides.</div>;
    }

    return (
      <div className="h-screen w-full flex flex-col bg-gray-900 overflow-hidden relative">
        {/* Bouton de fermeture global */}
        <button 
          onClick={handleClose}
          className="absolute top-1/2 right-4 -translate-y-1/2 z-50 bg-gray-900/80 text-white p-3 rounded-full shadow-2xl hover:bg-red-600 transition-colors backdrop-blur-md border border-gray-700"
          title="Quitter le mode Split"
        >
          <X size={24} />
        </button>

        {/* Iframe 1 (Haut) */}
        <div className="flex-1 relative border-b-4 border-gray-900 shadow-xl z-10">
          <iframe 
            src={`${app1.path}?mode=split`} 
            className="w-full h-full bg-gray-50"
            title={`App 1: ${app1.name}`}
          />
        </div>

        {/* Diviseur esthétique (optionnel) */}
        <div className="h-2 w-full bg-gray-900 flex items-center justify-center relative z-20">
           <div className="w-16 h-1 bg-gray-600 rounded-full"></div>
        </div>

        {/* Iframe 2 (Bas) */}
        <div className="flex-1 relative shadow-xl z-10">
          <iframe 
            src={`${app2.path}?mode=split`} 
            className="w-full h-full bg-gray-50"
            title={`App 2: ${app2.name}`}
          />
        </div>
      </div>
    );
  }

  // Mode Sélection
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Split Mode"
        icon={SplitSquareVertical}
        iconColor="text-gray-600"
        currentModule="split"
        maxWidth="max-w-4xl"
      />
      
      <main className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md space-y-12">
          
          {/* Sélection Haut */}
          <div className="space-y-6">
            <h2 className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Écran du Haut</h2>
            <div className="flex justify-center gap-4 flex-wrap">
              {availableApps.map((app) => {
                const Icon = app.icon;
                const isSelected = selectedApp1 === app.id;
                const isDisabled = selectedApp2 === app.id;
                return (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApp1(app.id)}
                    disabled={isDisabled}
                    className={`p-4 rounded-2xl transition-all flex items-center justify-center ${
                      isSelected 
                        ? `${app.theme.bg} text-white shadow-lg scale-110` 
                        : isDisabled
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                        : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm hover:scale-105"
                    }`}
                    title={app.name}
                  >
                    <Icon size={28} strokeWidth={isSelected ? 2.5 : 2} />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="h-px w-32 bg-gray-200"></div>
          </div>

          {/* Sélection Bas */}
          <div className="space-y-6">
            <h2 className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Écran du Bas</h2>
            <div className="flex justify-center gap-4 flex-wrap">
              {availableApps.map((app) => {
                const Icon = app.icon;
                const isSelected = selectedApp2 === app.id;
                const isDisabled = selectedApp1 === app.id;
                return (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApp2(app.id)}
                    disabled={isDisabled}
                    className={`p-4 rounded-2xl transition-all flex items-center justify-center ${
                      isSelected 
                        ? `${app.theme.bg} text-white shadow-lg scale-110` 
                        : isDisabled
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                        : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm hover:scale-105"
                    }`}
                    title={app.name}
                  >
                    <Icon size={28} strokeWidth={isSelected ? 2.5 : 2} />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-8 flex justify-center">
            <button
              onClick={handleLaunch}
              disabled={!selectedApp1 || !selectedApp2}
              className={`flex items-center gap-2 px-10 py-4 rounded-full font-bold text-lg transition-all ${
                selectedApp1 && selectedApp2
                  ? "bg-gray-900 text-white hover:scale-105 shadow-xl hover:bg-black"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Lancer
              <ArrowRight size={20} />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function SplitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Chargement...</div>}>
      <SplitScreenContent />
    </Suspense>
  );
}
