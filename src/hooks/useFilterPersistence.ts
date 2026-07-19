import { useState, useEffect, useCallback } from "react";

export interface FilterState {
  selectedStatus?: string | string[];
  selectedPeriod?: string;
  selectedViewMode?: string;
  selectedType?: string | string[];
  searchQuery?: string;
  selectedApp?: string;
  isStatsOpen?: boolean;
  selectedExerciseId?: string;
  tableColumnSizing?: Record<string, number>;
  selectedCategory?: string;
  cookerSelectedItems?: string[];
  folderSortOrder?: "custom" | "asc" | "desc";
}

/**
 * Extrait toutes les données du LocalStorage associées à une note spécifique.
 * Utile pour l'exportation d'une note.
 */
export const getNoteLocalStorageData = (noteId: string): Record<string, any> => {
  const lsData: Record<string, any> = {};
  if (typeof window !== "undefined") {
    const prefix = `table-editor-${noteId}-`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const val = localStorage.getItem(key);
          if (val) {
            const parsed = JSON.parse(val);
            // On extrait uniquement l'ID du champ (la partie après le prefix)
            const fieldId = key.substring(prefix.length);
            lsData[fieldId] = parsed;
          }
        } catch (e) {
          console.error("Erreur de lecture du LS pour l'export:", e);
        }
      }
    }
  }
  return lsData;
};

/**
 * Hook pour gérer la persistance des filtres dans localStorage
 * @param storageKey - Clé unique pour le localStorage (ex: 'booker-filters', 'watcher-filters')
 * @param defaultValues - Valeurs par défaut pour les filtres
 * @returns Object avec les valeurs et les setters
 */
export const useFilterPersistence = (
  storageKey: string,
  defaultValues: FilterState = {},
) => {
  const [filters, setFilters] = useState<FilterState>(defaultValues);

  // Charger les filtres depuis localStorage au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedFilters = JSON.parse(saved);
        setFilters({ ...defaultValues, ...parsedFilters });
      }
    } catch (error) {
      console.warn(
        `Erreur lors du chargement des filtres ${storageKey}:`,
        error,
      );
    }
  }, [storageKey]);

  // Sauvegarder dans localStorage quand les filtres changent
  const updateFilter = useCallback(
    (key: keyof FilterState, value: any) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value };
        try {
          localStorage.setItem(storageKey, JSON.stringify(newFilters));
        } catch (error) {
          console.warn(
            `Erreur lors de la sauvegarde des filtres ${storageKey}:`,
            error,
          );
        }
        return newFilters;
      });
    },
    [storageKey],
  );

  // Réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setFilters(defaultValues);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn(
        `Erreur lors de la suppression des filtres ${storageKey}:`,
        error,
      );
    }
  }, [storageKey, defaultValues]);


  // Utilitaires pour la multi-sélection
  const toggleArrayFilter = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => {
        const currentValue = prev[key] as string[] | string | undefined;
        let newValue: string[];

        if (Array.isArray(currentValue)) {
          // Si la valeur est déjà dans l'array, on la retire, sinon on l'ajoute
          if (currentValue.includes(value)) {
            newValue = currentValue.filter(v => v !== value);
          } else {
            newValue = [...currentValue, value];
          }
        } else {
          // Conversion d'une valeur string vers array
          if (currentValue === value || (currentValue === "all" && value !== "all")) {
            newValue = [];
          } else {
            newValue = [value];
          }
        }

        const newFilters = { ...prev, [key]: newValue };
        try {
          localStorage.setItem(storageKey, JSON.stringify(newFilters));
        } catch (error) {
          console.warn(
            `Erreur lors de la sauvegarde des filtres ${storageKey}:`,
            error,
          );
        }
        return newFilters;
      });
    },
    [storageKey],
  );

  const isFilterSelected = useCallback(
    (key: keyof FilterState, value: string) => {
      const currentValue = filters[key] as string[] | string | undefined;
      if (Array.isArray(currentValue)) {
        return currentValue.includes(value);
      }
      return currentValue === value;
    },
    [filters],
  );

  return {
    filters,
    updateFilter,
    toggleArrayFilter,
    isFilterSelected,
    resetFilters,
    // Getters individuels pour faciliter l'utilisation
    selectedStatus:
      filters.selectedStatus || defaultValues.selectedStatus || "all",
    selectedPeriod:
      filters.selectedPeriod || defaultValues.selectedPeriod || "all",
    selectedViewMode:
      filters.selectedViewMode || defaultValues.selectedViewMode || "calendar",
    selectedType:
      filters.selectedType || defaultValues.selectedType || "all",
    searchQuery:
      filters.searchQuery || defaultValues.searchQuery || "",
    selectedApp:
      filters.selectedApp || defaultValues.selectedApp || "dashboard",
    isStatsOpen:
      filters.isStatsOpen ?? defaultValues.isStatsOpen ?? true,
    selectedExerciseId:
      filters.selectedExerciseId || defaultValues.selectedExerciseId || "",
    tableColumnSizing:
      filters.tableColumnSizing || defaultValues.tableColumnSizing || {},
    selectedCategory:
      filters.selectedCategory || defaultValues.selectedCategory || "Toutes les catégories",
    cookerSelectedItems:
      filters.cookerSelectedItems || defaultValues.cookerSelectedItems || [],
    folderSortOrder:
      filters.folderSortOrder || defaultValues.folderSortOrder || "custom",
  };
};
