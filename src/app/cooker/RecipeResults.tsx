"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChefHat, RefreshCw, ChevronLeft, Loader2 } from "lucide-react";
import {
  RecipeCard,
  type GeneratedRecipe,
} from "@/components/cooker/RecipeCard";
import { useAuthContext } from "@/components/AuthProvider";

export default function RecipeResults({
  ingredients,
  onBack,
}: {
  ingredients: string[];
  onBack: () => void;
}) {
  const { session } = useAuthContext();
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cooker/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          accessToken: session?.access_token,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Échec de la génération");
      }
      const data = await response.json();
      setRecipes(data.recipes);
    } catch (err) {
      console.error(err);
      setError(
        "Désolé, une erreur est survenue lors de l'élaboration de vos recettes.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRecipes();
  }, [ingredients]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="min-h-full"
    >
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors group"
        >
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
          Retour aux ingrédients
        </button>
      </div>

      <div className="flex items-center gap-3 mb-10">
        <div className="bg-cyan-100 p-3 rounded-2xl text-cyan-600 shadow-sm">
          <ChefHat size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Suggestions du Chef
          </h2>
          <p className="text-gray-500 font-medium">
            Basé sur vos {ingredients.length} ingrédients sélectionnés
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl h-[550px] shadow-sm animate-pulse flex flex-col"
            >
              <div className="h-40 bg-gray-100 rounded-t-3xl" />
              <div className="p-8 space-y-6">
                <div className="h-8 bg-gray-100 rounded-lg w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="space-y-3 pt-4">
                  <div className="h-4 bg-gray-50 rounded" />
                  <div className="h-4 bg-gray-50 rounded" />
                  <div className="h-4 bg-gray-50 rounded w-5/6" />
                </div>
              </div>
            </div>
          ))}
          <div className="md:col-span-3 flex flex-col items-center py-10">
            <Loader2 className="animate-spin text-cyan-500 mb-2" size={32} />
            <p className="text-cyan-600 font-bold animate-pulse">
              Le Chef élabore vos menus...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-12 rounded-[40px] text-center max-w-2xl mx-auto">
          <p className="text-red-600 font-bold text-lg mb-6">{error}</p>
          <button
            onClick={generateRecipes}
            className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95"
          >
            Réessayer la génération
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
          {recipes.map((recipe, idx) => (
            <RecipeCard key={idx} recipe={recipe} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
