"use client";

import { useEffect } from "react";

export function VersionChecker() {
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch("/api/version");
        if (!res.ok) return;
        const data = await res.json();
        const currentCommit = process.env.NEXT_PUBLIC_GIT_COMMIT;
        
        // Si on a un commit défini côté client et côté serveur, et qu'ils sont différents
        if (data.commit && currentCommit && data.commit !== currentCommit) {
          console.log("Nouvelle version détectée. Rechargement...");
          window.location.reload();
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de la version", err);
      }
    };

    // Vérifier quand l'application revient au premier plan (ou sort de veille)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkVersion();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    
    // Vérification initiale au montage (optionnel)
    checkVersion();

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
