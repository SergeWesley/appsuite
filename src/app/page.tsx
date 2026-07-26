"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { useFilterPersistence } from "@/hooks/useFilterPersistence";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Grid3X3 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuthContext();

  const { selectedApp } = useFilterPersistence("app-filters", {
    selectedApp: "dashboard",
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(`/${selectedApp}`);
    }
  }, [isAuthenticated, loading, router, selectedApp]);

  // Afficher un écran de chargement pendant la redirection
  return <LoadingOverlay isLoading={true} message="" fullPage color="blue" icon={Grid3X3} animateType="pulse" />;
}
