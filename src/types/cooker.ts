export interface CookerCategory {
  id: string;
  name: string;
  icon: string;
  items: CookerIngredient[];
}

export interface CookerIngredient {
  id: string;
  name: string;
}