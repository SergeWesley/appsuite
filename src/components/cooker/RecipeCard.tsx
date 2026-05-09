"use client";

import { motion } from "framer-motion";
import { ChefHat, Clock, Sparkles } from "lucide-react";

export interface GeneratedRecipe {
  title: string;
  description: string;
  steps: string[];
  nutritionBenefits: string;
  difficulty: string;
  prepTime: string;
}

export const RecipeCard = ({ recipe }: { recipe: GeneratedRecipe }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full hover:shadow-2xl transition-shadow"
    >
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {recipe.difficulty}
          </span>
          <div className="flex items-center gap-1 text-cyan-100 text-xs font-medium">
            <Clock size={14} />
            {recipe.prepTime}
          </div>
        </div>
        <h3 className="text-xl font-black leading-tight">{recipe.title}</h3>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <p className="text-gray-600 text-sm mb-6 line-clamp-3 italic">
          "{recipe.description}"
        </p>

        <div className="space-y-4 mb-6 flex-1">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <ChefHat size={14} /> Étapes
          </h4>
          <ul className="space-y-3">
            {recipe.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-cyan-50 p-4 rounded-2xl">
          <h4 className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Sparkles size={12} /> Bienfaits nutritionnels
          </h4>
          <p className="text-xs text-cyan-800 leading-relaxed">
            {recipe.nutritionBenefits}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
