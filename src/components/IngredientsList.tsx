import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Package, Edit } from "lucide-react";
import { Ingredient } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface IngredientsListProps {
  ingredients: Ingredient[];
  onDeleteIngredient: (id: string) => void;
  onUpdateIngredient: (ingredient: Ingredient) => void;
  onEditIngredient?: (ingredient: Ingredient) => void;
}

export const IngredientsList = ({ ingredients, onDeleteIngredient, onUpdateIngredient, onEditIngredient }: IngredientsListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (ingredients.length === 0) {
    return (
      <Card className="shadow-md h-full">
        <CardContent className="py-12 text-center flex flex-col items-center justify-center h-full">
          <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">لا توجد مكونات بعد. أضف مكونك الأول!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-md h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5" />
            المكونات ({ingredients.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <div className="space-y-2">
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-fast border border-border/50"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{ingredient.name}</h3>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{ingredient.quantity} {ingredient.unit}</span>
                    <span>{ingredient.cost.toFixed(2)} ج.م</span>
                    <span className="text-primary font-medium">
                      {ingredient.costPerUnit.toFixed(2)} ج.م/{ingredient.unit}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditIngredient && onEditIngredient(ingredient)}
                    className="h-8 w-8"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(ingredient.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المكون؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDeleteIngredient(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};