"use client";

import { useState, useMemo, useEffect } from "react";
import { NavigationMenu } from "@/components/NavigationMenu";
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
} from "lucide-react";
import { useAuthContext } from "@/components/AuthProvider";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedItemDetails, setSelectedItemDetails] =
    useState<FoodItem | null>(null);

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
    if (!search.trim()) return foodData;

    const query = search.toLowerCase();
    return foodData
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            cat.name.toLowerCase().includes(query),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [foodData, search]);

  // Auto-expand categories when searching
  useEffect(() => {
    if (search.trim() && filteredData.length > 0) {
      setExpandedCategories(new Set(filteredData.map(c => c.name)));
    }
  }, [search, filteredData]);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) newSet.delete(name);
      else newSet.add(name);
      return newSet;
    });
  };

  // Helper to count selected items in a category
  const getSelectedCountInPool = (items: FoodItem[]) => {
    return items.filter(item => selectedItems.has(item.id)).length;
  };

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
        {/* Page Title & Search */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <p className="text-gray-600">
              {loading
                ? "Chargement des essentiels..."
                : "Sélectionnez vos ingrédients parmi les aliments de base les plus populaires."}
            </p>
          </div>

          <div className="w-full md:w-96 relative group">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher un aliment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all"
                title="Effacer la recherche"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-cyan-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium animate-pulse">
              Initialisation des données...
            </p>
          </div>
        ) : (
          <>
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
                        <span className="hidden sm:inline">Tout effacer</span>
                      </button>
                      <button className="bg-white text-cyan-600 px-5 py-2 rounded-xl font-bold hover:bg-cyan-50 transition-colors shadow-sm active:scale-95">
                        Générer des recettes
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {filteredData.map((category) => {
                const isExpanded = expandedCategories.has(category.name);
                const categorySelectedCount = getSelectedCountInPool(category.items);
                
                return (
                  <div
                    key={category.name}
                    className={`bg-white rounded-2xl shadow-sm border transition-all ${
                      isExpanded ? 'border-cyan-200 ring-1 ring-cyan-50' : 'border-gray-100 hover:shadow-md'
                    }`}
                  >
                    {/* Category Header (Collapsible Trigger) */}
                    <button 
                      onClick={() => toggleCategory(category.name)}
                      className="w-full p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-8 rounded-full transition-all ${
                          categorySelectedCount > 0 
                            ? 'bg-cyan-500' 
                            : isExpanded ? 'bg-cyan-400 scale-y-100' : 'bg-gray-200 scale-y-75'
                        }`}></div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-800">
                              {category.name}
                            </h3>
                            {categorySelectedCount > 0 && (
                              <span className="bg-cyan-100 text-cyan-700 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check size={10} strokeWidth={4} />
                                {categorySelectedCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 font-medium">
                            {category.items.length} aliment{category.items.length > 1 ? 's' : ''} disponible{category.items.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-cyan-50 text-cyan-600 rotate-180' : 'bg-gray-50 text-gray-400'}`}>
                        <ChevronDown size={20} />
                      </div>
                    </button>

                    {/* Collapsible Content */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="divide-y divide-gray-50 border-t border-gray-50 max-h-[500px] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:gap-x-4">
                              {category.items.map((item) => {
                                const isSelected = selectedItems.has(item.id);
                                return (
                                  <div
                                    key={item.id}
                                    className={`flex items-center gap-3 p-4 transition-all hover:bg-gray-50 cursor-pointer border-gray-50 md:border-b ${
                                      isSelected ? "bg-cyan-50/30" : ""
                                    }`}
                                    onClick={() => toggleItem(item.id)}
                                  >
                                    <div
                                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                        isSelected
                                          ? "bg-cyan-500 border-cyan-500 shadow-sm"
                                          : "border-gray-200 bg-white"
                                      }`}
                                    >
                                      {isSelected && (
                                        <Check className="w-4 h-4 text-white" />
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`text-sm font-semibold truncate ${isSelected ? "text-cyan-900" : "text-gray-700"}`}
                                      >
                                        {item.name}
                                      </p>
                                      <div className="flex items-center gap-3 mt-1 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                        <span className="flex items-center gap-1">
                                          <Flame size={10} className="text-orange-400" />
                                          {item.kcal} kcal
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Zap size={10} className="text-blue-400" />
                                          {item.protein}g prot
                                        </span>
                                      </div>
                                    </div>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedItemDetails(item);
                                      }}
                                      className="p-1.5 text-gray-300 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-all"
                                    >
                                      <Info size={16} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Aucun aliment trouvé
                </h3>
                <p className="text-gray-500">
                  Essayez de modifier votre recherche ou de parcourir les
                  catégories.
                </p>
              </div>
            )}
          </>
        )}
      </main>

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
                <h3 className="text-xl font-bold">{selectedItemDetails.name}</h3>
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
                      <span className="text-xs font-normal text-gray-400">kcal</span>
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                      Protéines
                    </p>
                    <p className="text-2xl font-black text-gray-800">
                      {selectedItemDetails.protein}{" "}
                      <span className="text-xs font-normal text-gray-400">g</span>
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                      Glucides
                    </p>
                    <p className="text-2xl font-black text-gray-800">
                      {selectedItemDetails.carbs}{" "}
                      <span className="text-xs font-normal text-gray-400">g</span>
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                      Lipides
                    </p>
                    <p className="text-2xl font-black text-gray-800">
                      {selectedItemDetails.fat}{" "}
                      <span className="text-xs font-normal text-gray-400">g</span>
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
