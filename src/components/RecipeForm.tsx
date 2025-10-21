import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input as UiInput } from "@/components/ui/input";
import { ChefHat, Plus, X, Edit } from "lucide-react";
import { Ingredient, Recipe, RecipeIngredient } from "@/types";
import { toast } from "sonner";

interface RecipeFormProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  onAddRecipe: (recipe: Recipe) => void;
  onUpdateRecipe: (recipe: Recipe) => void;
  // optional external editing recipe passed from parent
  editingRecipe?: Recipe | null;
  onCancelEdit?: () => void;
}

const UNITS = ["كجم", "جرام", "لتر", "ملليلتر", "قطعة", "علبة", "كيس"];

// Convert to grams
const convertToGrams = (value: number, unit: string): number => {
  switch(unit) {
    case "كجم": return value * 1000;
    case "جرام": return value;
    case "لتر": return value * 1000;
    case "ملليلتر": return value;
    default: return value;
  }
};

export const RecipeForm = ({ ingredients, recipes, onAddRecipe, onUpdateRecipe, editingRecipe, onCancelEdit }: RecipeFormProps) => {
  const [recipeName, setRecipeName] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredient[]>([]);
  const [numberOfPortions, setNumberOfPortions] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("جرام");
  const [editingId, setEditingId] = useState<string | null>(null);

  const allItems = [
    ...ingredients.map(ing => ({ ...ing, type: 'ingredient' as const })),
    ...recipes.map(rec => ({ ...rec, type: 'recipe' as const }))
  ];

  const [searchQuery, setSearchQuery] = useState("");

  // Clear search when an item is selected so next open starts fresh
  useEffect(() => {
    if (selectedItemId) setSearchQuery("");
  }, [selectedItemId]);

  const handleEdit = (recipe: Recipe) => {
    setRecipeName(recipe.name);
    setSelectedIngredients(recipe.ingredients);
    setNumberOfPortions(recipe.numberOfPortions.toString());
    setEditingId(recipe.id);
  };

  // Sync when parent requests editing a recipe
  useEffect(() => {
    if (editingRecipe) {
      setRecipeName(editingRecipe.name);
      setSelectedIngredients(editingRecipe.ingredients);
      setNumberOfPortions(editingRecipe.numberOfPortions.toString());
      setEditingId(editingRecipe.id);
    }
  }, [editingRecipe]);

  const handleAddIngredient = () => {
    if (!selectedItemId || !selectedQuantity) {
      toast.error("الرجاء اختيار مكون أو وصفة وتحديد الكمية");
      return;
    }

    const item = allItems.find(i => i.id === selectedItemId);
    if (!item) return;

    let cost = 0;
    let name = "";

    if (item.type === 'ingredient') {
      const ingredient = item as Ingredient;
      const quantityNum = parseFloat(selectedQuantity);
      cost = ingredient.costPerUnit * quantityNum;
      name = ingredient.name;
    } else {
      const recipe = item as Recipe;
      const quantityNum = parseFloat(selectedQuantity);
      const quantityInGrams = convertToGrams(quantityNum, selectedUnit);
      const portions = quantityInGrams / (recipe.batchSizeInGrams / recipe.numberOfPortions);
      cost = recipe.costPerPortion * portions;
      name = `${recipe.name} (وصفة)`;
    }

    const recipeIngredient: RecipeIngredient = {
      ingredientId: selectedItemId,
      ingredientName: name,
      quantity: parseFloat(selectedQuantity),
      unit: selectedUnit,
      cost,
      isRecipe: item.type === 'recipe',
    };

    setSelectedIngredients([...selectedIngredients, recipeIngredient]);
    setSelectedItemId("");
    setSelectedQuantity("");
    toast.success("تمت إضافة المكون");
  };

  const handleRemoveIngredient = (index: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipeName || selectedIngredients.length === 0 || !numberOfPortions) {
      toast.error("الرجاء ملء جميع الحقول وإضافة مكون واحد على الأقل");
      return;
    }

    const totalCost = selectedIngredients.reduce((sum, ing) => sum + ing.cost, 0);
    const portionsNum = parseFloat(numberOfPortions);
    
    // Calculate total batch size in grams from all ingredients
    const batchSizeInGrams = selectedIngredients.reduce((sum, ing) => {
      return sum + convertToGrams(ing.quantity, ing.unit);
    }, 0);
    
    const costPerPortion = totalCost / portionsNum;

    const recipe: Recipe = {
      id: editingId || Date.now().toString(),
      name: recipeName,
      ingredients: selectedIngredients,
      totalCost,
      batchSizeInGrams,
      numberOfPortions: portionsNum,
      costPerPortion,
    };

    if (editingId) {
      onUpdateRecipe(recipe);
      setEditingId(null);
      if (onCancelEdit) onCancelEdit();
    } else {
      onAddRecipe(recipe);
    }
    
    // Reset form
    setRecipeName("");
    setSelectedIngredients([]);
    setNumberOfPortions("");
    toast.success(editingId ? "تم تحديث الوصفة بنجاح!" : "تمت إضافة الوصفة بنجاح!");
  };

  const handleCancel = () => {
    setEditingId(null);
    setRecipeName("");
    setSelectedIngredients([]);
    setNumberOfPortions("");
  };

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary text-lg">
          {editingId ? <Edit className="w-5 h-5" /> : <ChefHat className="w-5 h-5" />}
          {editingId ? "تعديل وصفة" : "إنشاء وصفة جديدة"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="recipeName" className="text-sm">اسم الوصفة</Label>
            <Input
              id="recipeName"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="مثال: دجاج مشوي، كفتة"
              required
              className="h-9"
            />
          </div>

          <div className="space-y-2 p-3 rounded-lg bg-muted/50">
            <h3 className="font-semibold text-sm">إضافة مكونات أو وصفات</h3>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">اختر مكون أو وصفة</Label>
                <Select value={selectedItemId} onValueChange={(val: string) => {
                  // ignore header markers and the no-results marker so they don't become a real selection
                  if (val === 'ingredients-header' || val === 'recipes-header' || val === '__no_results_marker') {
                    setSelectedItemId('')
                    return
                  }
                  setSelectedItemId(val)
                }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="اختر مكون أو وصفة" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Search input to filter ingredients and recipes */}
                    <div className="p-2">
                      <UiInput
                        placeholder="ابحث عن مكون أو وصفة..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8"
                      />
                    </div>

                    {(() => {
                      const q = searchQuery.trim().toLowerCase();
                      const filteredIngredients = ingredients.filter((ing) => ing.name.toLowerCase().includes(q));
                      const filteredRecipes = recipes.filter((rec) => rec.name.toLowerCase().includes(q));

                      return (
                        <>
                          {filteredIngredients.length > 0 && (
                            <>
                              <SelectItem value="ingredients-header" disabled>
                                --- المكونات ---
                              </SelectItem>
                              {filteredIngredients.map((ing) => (
                                <SelectItem key={ing.id} value={ing.id}>
                                  {ing.name} ({ing.costPerUnit.toFixed(2)} ج.م/{ing.unit})
                                </SelectItem>
                              ))}
                            </>
                          )}

                          {filteredRecipes.length > 0 && (
                            <>
                              <SelectItem value="recipes-header" disabled>
                                --- الوصفات ---
                              </SelectItem>
                              {filteredRecipes.map((rec) => (
                                <SelectItem key={rec.id} value={rec.id}>
                                  {rec.name} ({rec.costPerPortion.toFixed(2)} ج.م/حصة)
                                </SelectItem>
                              ))}
                            </>
                          )}

                          {filteredIngredients.length === 0 && filteredRecipes.length === 0 && (
                            // Render a focusable marker item so Radix can focus something when opening.
                            // We treat this value specially in the onValueChange handler above.
                            <SelectItem value="__no_results_marker">
                              لا توجد نتائج
                            </SelectItem>
                          )}
                        </>
                      );
                    })()}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">الكمية</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    placeholder="0.00"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">الوحدة</Label>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddIngredient}
                variant="outline"
                className="w-full h-8 text-sm"
              >
                <Plus className="w-3.5 h-3.5 ml-1.5" />
                إضافة إلى الوصفة
              </Button>
            </div>

            {selectedIngredients.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <h4 className="font-medium text-xs">المكونات المضافة:</h4>
                <div className="space-y-1.5 max-h-32 overflow-auto">
                  {selectedIngredients.map((ing, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded bg-background text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-xs truncate block">{ing.ingredientName}</span>
                        <div className="text-xs text-muted-foreground">
                          {ing.quantity} {ing.unit} - {ing.cost.toFixed(2)} ج.م
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveIngredient(index)}
                        className="h-7 w-7 flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">عدد الحصص</Label>
            <Input
              type="number"
              step="0.1"
              value={numberOfPortions}
              onChange={(e) => setNumberOfPortions(e.target.value)}
              placeholder="مثال: 10"
              required
              className="h-9"
            />
            <p className="text-xs text-muted-foreground">
              حجم الدفعة: {selectedIngredients.reduce((sum, ing) => sum + convertToGrams(ing.quantity, ing.unit), 0).toFixed(0)} جرام
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 gradient-primary shadow-md h-9">
              {editingId ? "تحديث الوصفة" : "إنشاء الوصفة"}
            </Button>
            {editingId && (
              <Button type="button" onClick={handleCancel} variant="outline" className="h-9">
                إلغاء
              </Button>
            )}
          </div>
        </form>

        {recipes.length > 0 && !editingId && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">تعديل سريع:</h4>
            <div className="space-y-1.5 max-h-32 overflow-auto">
              {recipes.slice(0, 5).map((rec) => (
                <Button
                  key={rec.id}
                  type="button"
                  variant="ghost"
                  onClick={() => handleEdit(rec)}
                  className="w-full justify-start text-right h-auto py-2 px-3"
                >
                  <Edit className="w-3.5 h-3.5 ml-2" />
                  <div className="flex-1 text-sm">
                    <span className="font-medium">{rec.name}</span>
                    <span className="text-xs text-muted-foreground mr-2">
                      ({rec.costPerPortion.toFixed(2)} ج.م/حصة)
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};