import React, { useEffect, useState } from "react";
import { BookOpen, Loader2, Play } from "lucide-react";

interface ApiCatalogProps {
  onActionClick: (description: string) => void;
}

export function ApiCatalog({ onActionClick }: ApiCatalogProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch("/api/forge-catalog");
        if (!res.ok) throw new Error("Erreur de récupération du catalogue");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400 h-full">
        <Loader2 className="animate-spin mb-4" size={32} />
        <span className="text-sm font-medium">Chargement des APIs...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl m-4 border border-red-100">
        Erreur: {error || "Impossible de charger le catalogue."}
      </div>
    );
  }

  const paths = data.paths || {};
  // Regrouper les opérations par Tag
  const groups: Record<string, any[]> = {};
  
  Object.keys(paths).forEach((pathUrl) => {
    const methods = paths[pathUrl];
    Object.keys(methods).forEach((method) => {
      const operation = methods[method];
      
      // Filtrer pour ne garder que les routes destinées à la Generative UI
      const isGenerativeUI = 
        operation["x-generative-ui"]?.enabled === "true" || 
        operation["x-generative-ui"]?.enabled === true;
        
      if (!isGenerativeUI) return;

      const tag = operation.tags?.[0] || "Autres";
      
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push({
        path: pathUrl,
        method: method.toUpperCase(),
        summary: operation.summary || pathUrl,
        description: operation.description || "",
      });
    });
  });

  return (
    <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 flex items-center gap-2 shadow-sm">
        <BookOpen size={20} className="text-indigo-600" />
        <h2 className="font-bold text-gray-800">Catalogue Forge</h2>
      </div>

      <div className="p-4 space-y-6">
        {Object.entries(groups).map(([tag, operations]) => (
          <div key={tag}>
            <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3 px-1">
              {tag}
            </h3>
            <div className="space-y-3">
              {operations.map((op, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm group hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-700">
                      {op.method}
                    </span>
                    <span className="text-xs font-mono text-gray-500 truncate flex-1" title={op.path}>
                      {op.path}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
                    {op.summary}
                  </p>
                  {op.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                      {op.description}
                    </p>
                  )}
                  <button
                    onClick={() => onActionClick(`Peux-tu exécuter cette action : ${op.summary} ?`)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-indigo-600 bg-indigo-50/50 rounded-lg border border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                  >
                    Essayer <Play size={12} className="ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
