'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
  const { signIn, signUp, loading, error } = useAuth();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setAuthError(null);
      await signIn(email, password);
      router.push('/');
    } catch (err) {
      // L'erreur est déjà gérée dans useAuth
      setAuthError(error);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      setAuthError(null);
      await signUp(email, password, name);
      // Après inscription, rediriger vers la page d'accueil
      router.push('/');
    } catch (err) {
      // L'erreur est déjà gérée dans useAuth
      setAuthError(error);
    }
  };

  return (
    <AuthForm
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      loading={loading}
      error={authError || error}
    />
  );
}
