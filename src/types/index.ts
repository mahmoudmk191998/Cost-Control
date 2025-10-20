export interface Ingredient {
  id: string;
  name: string;
  cost: number;
  quantity: number;
  unit: string;
  costPerUnit: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  cost: number;
  isRecipe?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  totalCost: number;
  batchSizeInGrams: number; // Always stored in grams
  numberOfPortions: number;
  costPerPortion: number;
}
