import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface ApiCatalogProps {
  // Propriétés du composant ApiCatalog
  onActionClick: (description: string) => void;
}

export function ApiCatalog({ onActionClick }: ApiCatalogProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fonction asynchrone pour récupérer le catalogue
    async function fetchCatalog() {
      try {
        const res = await fetch("/api/forge-catalog");
        if (!res.ok) throw new Error("Erreur de récupération du catalogue");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        // En cas d'erreur, on stocke le message d'erreur
        setError(err.message);
      } finally {
        // Quoi qu'il arrive, on met fin au chargement
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  if (loading || error || !data) {
    // On ne montre rien si erreur ou chargement pour ne pas polluer le chat
    return null;
  }

  const paths = data.paths || {};
  const operations: any[] = [];
  
  // On itère sur les chemins et les méthodes pour trouver les opérations génératives
  Object.keys(paths).forEach((pathUrl) => {
    const methods = paths[pathUrl];
    Object.keys(methods).forEach((method) => {
      const operation = methods[method];
      const isGenerativeUI = 
        operation["x-generative-ui"]?.enabled === "true" || 
        operation["x-generative-ui"]?.enabled === true;
        
      // On ne garde que les opérations génératives
      if (!isGenerativeUI) return;

      operations.push({
        summary: operation.summary || pathUrl,
      });
    });
  });

  if (operations.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex gap-2 items-center">
        <Sparkles size={16} className="text-indigo-400 shrink-0 mr-1" />
        {operations.map((op, idx) => (
          <button
            key={idx}
            onClick={() => onActionClick(`${op.summary}`)}
            className="shrink-0 bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors"
          >
            {op.summary}
          </button>
        ))}
      </div>
    </div>
  );
}
