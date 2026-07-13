import React from "react";
import { motion } from "framer-motion";
import { Utensils, Globe, Tag, MonitorPlay, ChefHat } from "lucide-react";

export function MealList({ result }: { result: any }) {
  const data = result.data || [];
  const query = result.query || "";

  if (data.length === 0) {
    return (
      <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-sm text-orange-600 flex items-center gap-2">
        <ChefHat size={18} />
        Aucune recette trouvée pour : "{query}"
      </div>
    );
  }

  return (
    <div className="w-full my-4 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Utensils size={18} className="text-orange-500" />
        <h3 className="text-sm font-semibold text-gray-800">
          Recettes pour "{query}"
        </h3>
      </div>

      <div className="flex flex-col gap-6">
        {data.map((meal: any, index: number) => (
          <motion.div
            key={meal.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Section d'image */}
              <div className="md:w-1/3 h-64 md:h-auto bg-gray-100 relative shrink-0">
                {meal.imageUrl ? (
                  <img
                    src={`/api/image-proxy?url=${encodeURIComponent(meal.imageUrl)}`}
                    alt={meal.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Utensils size={32} />
                  </div>
                )}
              </div>

              {/* Section de contenu */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-bold text-gray-900 leading-tight">
                    {meal.name}
                  </h4>
                  {meal.youtubeUrl && (
                    <a
                      href={meal.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors shrink-0"
                      title="Voir sur YouTube"
                    >
                      <MonitorPlay size={20} />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-6 text-xs font-medium text-gray-600">
                  <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md">
                    <Tag size={12} />
                    {meal.category || "Inconnu"}
                  </div>
                  <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                    <Globe size={12} />
                    {meal.area || "Inconnu"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  {/* Ingrédients */}
                  <div>
                    <h5 className="text-sm font-bold text-gray-800 mb-3 border-b pb-1">
                      Ingrédients
                    </h5>
                    <ul className="space-y-1.5">
                      {meal.ingredients?.map((ing: any, i: number) => (
                        <li key={i} className="text-sm flex justify-between">
                          <span className="text-gray-700 font-medium">{ing.name}</span>
                          <span className="text-gray-500 text-xs">{ing.measure}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div className="flex flex-col">
                    <h5 className="text-sm font-bold text-gray-800 mb-3 border-b pb-1">
                      Instructions
                    </h5>
                    <div className="text-sm text-gray-600 whitespace-pre-line flex-1 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
                      {meal.instructions}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
