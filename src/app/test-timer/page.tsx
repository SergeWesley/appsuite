'use client';

import { TimerTest } from '@/components/TimerTest';
import { AuthProvider } from '@/components/AuthProvider';

export default function TestTimerPage() {
  return (
    <AuthProvider>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Test du système de Timer</h1>
        
        <div className="grid gap-6">
          <TimerTest bookId="test-book-1" />
          <TimerTest bookId="test-book-2" />
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Instructions de test</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Assurez-vous d'être connecté à Supabase</li>
              <li>Appliquez les migrations SQL du fichier <code>supabase-migrations.sql</code></li>
              <li>Démarrez un timer sur le livre 1</li>
              <li>Vérifiez que le temps s'incrémente toutes les secondes</li>
              <li>Essayez de démarrer un timer sur le livre 1 à nouveau (devrait arrêter l'ancien)</li>
              <li>Démarrez un timer sur le livre 2 (devrait fonctionner en parallèle)</li>
              <li>Arrêtez les timers et vérifiez que les données sont sauvegardées</li>
            </ol>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Fonctionnalités testées</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>✅ Timer en temps réel (mise à jour chaque seconde)</li>
              <li>✅ Session unique par livre</li>
              <li>✅ Arrêt automatique des sessions existantes</li>
              <li>✅ Sauvegarde dans Supabase avec fonctions sécurisées</li>
              <li>✅ Gestion d'erreurs et états de chargement</li>
              <li>✅ Interface utilisateur réactive</li>
            </ul>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
