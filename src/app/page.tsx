'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuthContext();

  const { selectedApp } = useFilterPersistence('app-filters', {
      selectedApp: 'dashboard',
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(`/${selectedApp}`);
    }
  }, [isAuthenticated, loading, router, selectedApp]);

  // Afficher un écran de chargement pendant la redirection
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
}
