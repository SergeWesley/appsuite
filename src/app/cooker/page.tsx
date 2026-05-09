"use client";

import { useState, useMemo, useEffect } from "react";
import { NavigationMenu } from "@/components/NavigationMenu";
import RecipeResults from "./RecipeResults";
import {
  Search,
  Check,
  Utensils,
  LogOut,
  User as UserIcon,
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
  Flame,
  Zap,
  X,
  Trash2,
  ArrowUp,
} from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useFilterPersistence } from "@/hooks/useFilterPersistence";

interface FoodItem {
  id: string;
  name: string;
  category: string;
  kcal: string;
  protein: string;
  carbs: string;
  fat: string;
}

interface FoodCategory {
  name: string;
  items: FoodItem[];
}

export default function CookerPage() {
  const { user, signOut } = useAuthContext();
  const [foodData, setFoodData] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    filters,
    updateFilter,
    searchQuery: search,
    selectedCategory,
    cookerSelectedItems,
  } = useFilterPersistence("cooker-filters", {
    searchQuery: "",
    selectedCategory: "Toutes les catégories",
    cookerSelectedItems: [],
  });

  // Derived state for selected items Set (for performance)
  const selectedItems = useMemo(
    () => new Set(cookerSelectedItems),
    [cookerSelectedItems],
  );

  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] =
    useState<FoodItem | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showRecipes, setShowRecipes] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    async function loadFoodData() {
      try {
        const response = await fetch("/data/food-essentials-fr.csv");
        const text = await response.text();
        const lines = text.split("\n");

        const categoriesMap = new Map<string, FoodItem[]>();

        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const columns = line.split(";");
          if (columns.length < 4) continue;

          const categoryName = columns[1];
          const item: FoodItem = {
            id: `${columns[2]}-${i}`, // Use index to ensure uniqueness if codes repeat
            name: columns[3],
            category: categoryName,
            kcal: columns[5]?.trim() || "0",
            protein: columns[9]?.trim() || "0",
            carbs: columns[11]?.trim() || "0",
            fat: columns[12]?.trim() || "0",
          };

          if (!categoriesMap.has(categoryName)) {
            categoriesMap.set(categoryName, []);
          }
          categoriesMap.get(categoryName)?.push(item);
        }

        const sortedCategories = Array.from(categoriesMap.entries())
          .map(([name, items]) => ({ name, items }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setFoodData(sortedCategories);
      } catch (error) {
        console.error("Failed to load food data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFoodData();
  }, []);

  const filteredData = useMemo(() => {
    let data = foodData;

    if (selectedCategory !== "Toutes les catégories") {
      data = foodData.filter((cat) => cat.name === selectedCategory);
    }

    if (!search.trim()) return data;

    const query = search.toLowerCase();
    return data
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            cat.name.toLowerCase().includes(query),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [foodData, search, selectedCategory]);

  const allCategoryNames = useMemo(() => {
    return ["Toutes les catégories", ...foodData.map((c) => c.name)];
  }, [foodData]);

  const toggleItem = (id: string) => {
    const newItems = new Set(selectedItems);
    if (newItems.has(id)) {
      newItems.delete(id);
    } else {
      newItems.add(id);
    }
    updateFilter("cookerSelectedItems", Array.from(newItems));
  };

  const clearSelection = () => {
    updateFilter("cookerSelectedItems", []);
  };

  // Helper to count selected items in a category
  const getSelectedCountInPool = (items: FoodItem[]) => {
    return items.filter((item) => selectedItems.has(item.id)).length;
  };

  const selectedIngredientNames = useMemo(() => {
    return foodData
      .flatMap((cat) => cat.items)
      .filter((item) => selectedItems.has(item.id))
      .map((item) => item.name);
  }, [foodData, selectedItems]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsNavMenuOpen(true)}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menu de navigation"
              >
                <Utensils className="h-8 w-8 text-cyan-600" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">
                  Cooker
                </h1>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <Menu as="div" className="relative inline-block text-left">
                <MenuButton className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <UserIcon size={20} />
                  <span className="hidden sm:block">
                    {user?.user_metadata?.name || user?.email || "Utilisateur"}
                  </span>
                </MenuButton>

                <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 focus:outline-none">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.user_metadata?.name || "Utilisateur"}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <MenuItem
                      as="button"
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100"
                    >
                      <LogOut size={16} />
                      Se déconnecter
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-cyan-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium animate-pulse">
              Initialisation des données...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!showRecipes ? (
              <motion.div
                key="ingredients"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Page Title & Search */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="flex-1">
                    <p className="text-gray-600">
                      Sélectionnez vos ingrédients parmi les aliments de base
                      les plus populaires.
                    </p>
                  </div>

                  <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                    {/* Category Select */}
                    <div className="relative w-full sm:w-64">
                      <select
                        value={selectedCategory}
                        onChange={(e) =>
                          updateFilter("selectedCategory", e.target.value)
                        }
                        className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none appearance-none transition-all text-gray-700 font-medium"
                      >
                        {allCategoryNames.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown size={20} />
                      </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[280px]">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search size={20} />
                      </div>
                      <input
                        type="text"
                        placeholder="Rechercher un aliment (ex: riz, oeuf...)"
                        value={search}
                        onChange={(e) =>
                          updateFilter("searchQuery", e.target.value)
                        }
                        className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-gray-700"
                      />
                      {search && (
                        <button
                          onClick={() => updateFilter("searchQuery", "")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all"
                          title="Effacer la recherche"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Counter / Action Bar */}
                <AnimatePresence>
                  {selectedItems.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className="mb-6 sticky top-4 z-20"
                    >
                      <div className="bg-cyan-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 p-2 rounded-lg">
                            <Check className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold">
                              {selectedItems.size} ingrédient
                              {selectedItems.size > 1 ? "s" : ""} sélectionné
                              {selectedItems.size > 1 ? "s" : ""}
                            </p>
                            <p className="text-xs text-cyan-100">
                              Prêt pour la génération de recettes
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={clearSelection}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
                          >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">
                              Tout effacer
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              window.scrollTo({ top: 0, behavior: "smooth" });
                              setShowRecipes(true);
                            }}
                            className="bg-white text-cyan-600 px-5 py-2 rounded-xl font-bold hover:bg-cyan-50 transition-colors shadow-sm active:scale-95"
                          >
                            Générer
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-12 pb-20">
                  {filteredData.map((category) => {
                    const categorySelectedCount = getSelectedCountInPool(
                      category.items,
                    );

                    return (
                      <div key={category.name} className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                          <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-gray-900">
                              {category.name}
                            </h2>
                            {categorySelectedCount > 0 && (
                              <span className="bg-cyan-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                <Check size={10} strokeWidth={4} />
                                {categorySelectedCount}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 font-medium">
                            {category.items.length} aliment
                            {category.items.length > 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {category.items.map((item) => {
                            const isSelected = selectedItems.has(item.id);
                            return (
                              <motion.div
                                key={item.id}
                                layout
                                onClick={() => toggleItem(item.id)}
                                className={`group relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-cyan-500 bg-cyan-50/40 shadow-sm"
                                    : "border-gray-100 bg-white hover:border-cyan-200 hover:shadow-md"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <span
                                    className={`text-sm font-bold leading-snug transition-colors ${
                                      isSelected
                                        ? "text-cyan-900"
                                        : "text-gray-700 group-hover:text-gray-900"
                                    }`}
                                  >
                                    {item.name}
                                  </span>
                                  <div
                                    className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                                      isSelected
                                        ? "bg-cyan-500 border-cyan-500 scale-110 shadow-sm"
                                        : "border-gray-200"
                                    }`}
                                  >
                                    {isSelected && (
                                      <Check
                                        size={10}
                                        className="text-white"
                                        strokeWidth={4}
                                      />
                                    )}
                                  </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                      {item.kcal} kcal
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedItemDetails(item);
                                    }}
                                    className="text-[10px] font-bold text-cyan-600 hover:text-cyan-700 px-2 py-1 rounded-lg hover:bg-cyan-50 transition-colors"
                                  >
                                    Détails
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {filteredData.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                      <p className="text-gray-400 font-medium">
                        Aucun ingrédient trouvé pour cette recherche.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <RecipeResults
                ingredients={selectedIngredientNames}
                onBack={() => setShowRecipes(false)}
              />
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-cyan-600 text-white rounded-full shadow-2xl hover:bg-cyan-700 transition-colors z-50 group active:scale-95"
            aria-label="Retour en haut"
          >
            <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItemDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedItemDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-cyan-600 p-6 text-white relative">
                <button
                  onClick={() => setSelectedItemDetails(null)}
                  className="absolute top-4 right-4 p-1 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
                >
                  <X size={20} />
                </button>
                <h4 className="text-xs uppercase font-bold tracking-widest text-cyan-200 mb-1">
                  {selectedItemDetails.category}
                </h4>
                <h3 className="text-xl font-bold">
                  {selectedItemDetails.name}
                </h3>
              </div>

              <div className="p-6">
                <h5 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Valeurs nutritionnelles (pour 100g)
                </h5>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                      Énergie
                    </p>
                    <p className="text-2xl font-black text-gray-800">
                      {selectedItemDetails.kcal}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        kcal
                      </span>
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                      Protéines
                    </p>
                    <p className="text-2xl font-black text-gray-800">
                      {selectedItemDetails.protein}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        g
                      </span>
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                      Glucides
                    </p>
                    <p className="text-2xl font-black text-gray-800">
                      {selectedItemDetails.carbs}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        g
                      </span>
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                      Lipides
                    </p>
                    <p className="text-2xl font-black text-gray-800">
                      {selectedItemDetails.fat}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        g
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedItemDetails(null)}
                  className="w-full mt-6 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-colors shadow-lg active:scale-[0.98] transition-transform"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <NavigationMenu
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        currentModule="cooker"
      />
    </div>
  );
}
