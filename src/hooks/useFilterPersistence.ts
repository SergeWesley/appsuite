import { useState, useEffect, useCallback } from 'react';

export interface FilterState {
  selectedStatus?: string;
  selectedPeriod?: string;
  selectedViewMode?: string;
  selectedType?: string;
  searchQuery?: string;
  selectedApp?: string;
}

/**
 * Hook pour gérer la persistance des filtres dans localStorage
 * @param storageKey - Clé unique pour le localStorage (ex: 'booker-filters', 'watcher-filters')
 * @param defaultValues - Valeurs par défaut pour les filtres
 * @returns Object avec les valeurs et les setters
 */
export const useFilterPersistence = (
  storageKey: string,
  defaultValues: FilterState = {}
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
      console.warn(`Erreur lors du chargement des filtres ${storageKey}:`, error);
    }
  }, [storageKey]);

  // Sauvegarder dans localStorage quand les filtres changent
  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      try {
        localStorage.setItem(storageKey, JSON.stringify(newFilters));
      } catch (error) {
        console.warn(`Erreur lors de la sauvegarde des filtres ${storageKey}:`, error);
      }
      return newFilters;
    });
  }, [storageKey]);

  // Réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setFilters(defaultValues);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn(`Erreur lors de la suppression des filtres ${storageKey}:`, error);
    }
  }, [storageKey, defaultValues]);

  return {
    filters,
    updateFilter,
    resetFilters,
    // Getters individuels pour faciliter l'utilisation
    selectedStatus: filters.selectedStatus || defaultValues.selectedStatus || 'all',
    selectedPeriod: filters.selectedPeriod || defaultValues.selectedPeriod || 'all',
    selectedViewMode: filters.selectedViewMode || defaultValues.selectedViewMode || 'calendar',
    selectedType: filters.selectedType || defaultValues.selectedType || 'all',
    searchQuery: filters.searchQuery || defaultValues.searchQuery || '',
    selectedApp: filters.selectedApp || defaultValues.selectedApp || 'dashboard',
  };
};
