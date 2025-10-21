import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit } from "lucide-react";
import { Ingredient } from "@/types";

interface IngredientFormProps {
  onAddIngredient: (ingredient: Ingredient) => void;
  ingredients: Ingredient[];
  onUpdateIngredient: (ingredient: Ingredient) => void;
  // optional external editing ingredient (from parent list)
  editingIngredient?: Ingredient | null;
  onCancelEdit?: () => void;
}

const UNITS = ["كجم", "جرام", "لتر", "ملليلتر", "قطعة", "علبة", "كيس"];

export const IngredientForm = ({ onAddIngredient, ingredients, onUpdateIngredient, editingIngredient = null, onCancelEdit }: IngredientFormProps) => {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("جرام");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Sync when parent passes an editing ingredient
  useEffect(() => {
    if (editingIngredient) {
      setName(editingIngredient.name)
      setCost(editingIngredient.cost.toString())
      setQuantity(editingIngredient.quantity.toString())
      setUnit(editingIngredient.unit)
      setEditingId(editingIngredient.id)
    }
  }, [editingIngredient])

  const handleEdit = (ingredient: Ingredient) => {
    setName(ingredient.name);
    setCost(ingredient.cost.toString());
    setQuantity(ingredient.quantity.toString());
    setUnit(ingredient.unit);
    setEditingId(ingredient.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cost || !quantity) return;

    const costNum = parseFloat(cost);
    const quantityNum = parseFloat(quantity);
    const costPerUnit = costNum / quantityNum;

    if (editingId) {
      const ingredient: Ingredient = {
        id: editingId,
        name,
        cost: costNum,
        quantity: quantityNum,
        unit,
        costPerUnit,
      };
      onUpdateIngredient(ingredient);
      setEditingId(null);
    } else {
      const ingredient: Ingredient = {
        id: Date.now().toString(),
        name,
        cost: costNum,
        quantity: quantityNum,
        unit,
        costPerUnit,
      };
      onAddIngredient(ingredient);
    }

    setName("");
    setCost("");
    setQuantity("");
    setUnit("جرام")
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setCost("");
    setQuantity("");
    setUnit("جرام")
    if (onCancelEdit) onCancelEdit()
  };

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary text-lg">
          {editingId ? <Edit className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          {editingId ? "تعديل مكون" : "إضافة مكون جديد"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm">اسم المكون</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: دجاج، لحم مفروم، بطاطس"
              required
              className="h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cost" className="text-sm">التكلفة (جنيه)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                required
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantity" className="text-sm">الكمية</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                required
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="unit" className="text-sm">الوحدة</Label>
            <Select value={unit} onValueChange={setUnit}>
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

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 gradient-primary shadow-md h-9">
              {editingId ? "تحديث المكون" : "إضافة المكون"}
            </Button>
            {editingId && (
              <Button type="button" onClick={handleCancel} variant="outline" className="h-9">
                إلغاء
              </Button>
            )}
          </div>
        </form>

        {ingredients.length > 0 && !editingId && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">تعديل سريع:</h4>
            <div className="space-y-1.5 max-h-32 overflow-auto">
              {ingredients.slice(0, 5).map((ing) => (
                <Button
                  key={ing.id}
                  type="button"
                  variant="ghost"
                  onClick={() => handleEdit(ing)}
                  className="w-full justify-start text-right h-auto py-2 px-3"
                >
                  <Edit className="w-3.5 h-3.5 ml-2" />
                  <div className="flex-1 text-sm">
                    <span className="font-medium">{ing.name}</span>
                    <span className="text-xs text-muted-foreground mr-2">
                      ({ing.costPerUnit.toFixed(2)} ج.م/{ing.unit})
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