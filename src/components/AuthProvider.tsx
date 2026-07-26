"use client";

import { createContext, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { TimerProvider } from "./TimerProvider";
import { Grid3X3 } from "lucide-react";
import { LoadingOverlay } from "@/components/LoadingOverlay";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any;
  session: any;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  useEffect(() => {
    // Si on est sur la page d'auth et qu'on est connecté, rediriger vers l'accueil
    if (isAuthenticated && pathname === "/auth") {
      router.push("/dashboard");
      return;
    }

    // Si on n'est pas connecté et qu'on n'est pas sur la page d'auth, rediriger vers auth
    if (!loading && !isAuthenticated && pathname !== "/auth") {
      router.push("/auth");
      return;
    }
  }, [isAuthenticated, loading, pathname, router]);

  const value = {
    isAuthenticated,
    loading,
    user,
    session,
    signOut,
  };

  // Écran de chargement pendant la vérification de l'authentification
  if (loading) {
    return <LoadingOverlay isLoading={true} message="" fullPage color="blue" icon={Grid3X3} animateType="pulse" />;
  }

  return (
    <AuthContext.Provider value={value}>
      <TimerProvider>{children}</TimerProvider>
    </AuthContext.Provider>
  );
}
