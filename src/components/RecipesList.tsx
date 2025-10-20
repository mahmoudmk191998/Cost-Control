import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ChefHat, Eye } from "lucide-react";
import { Recipe } from "@/types";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface RecipesListProps {
  recipes: Recipe[];
  onDeleteRecipe: (id: string) => void;
  onUpdateRecipe: (recipe: Recipe) => void;
}

export const RecipesList = ({ recipes, onDeleteRecipe, onUpdateRecipe }: RecipesListProps) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (recipes.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-12 text-center">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">لا توجد وصفات بعد. أنشئ وصفتك الأولى!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            الوصفات ({recipes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="p-5 rounded-lg bg-gradient-subtle border border-border hover:shadow-soft transition-smooth"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-xl text-primary">{recipe.name}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(recipe.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">حجم الدفعة</p>
                    <p className="font-medium">{recipe.batchSizeInGrams.toFixed(0)} جرام</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">عدد الحصص</p>
                    <p className="font-medium">{recipe.numberOfPortions.toFixed(1)} حصة</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">حجم الحصة</p>
                    <p className="font-medium">{(recipe.batchSizeInGrams / recipe.numberOfPortions).toFixed(0)} جرام</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">عدد المكونات</p>
                    <p className="font-medium">{recipe.ingredients.length} مكون</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">التكلفة الكلية</p>
                      <p className="text-2xl font-bold text-primary">
                        {recipe.totalCost.toFixed(2)} ج.م
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground mb-1">تكلفة الحصة الواحدة</p>
                      <p className="text-2xl font-bold gradient-warm bg-clip-text text-transparent">
                        {recipe.costPerPortion.toFixed(2)} ج.م
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedRecipe?.name}</DialogTitle>
          </DialogHeader>
          {selectedRecipe && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">حجم الدفعة</p>
                  <p className="text-base font-semibold">{selectedRecipe.batchSizeInGrams.toFixed(0)} جرام</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">حجم الحصة</p>
                  <p className="text-base font-semibold">{(selectedRecipe.batchSizeInGrams / selectedRecipe.numberOfPortions).toFixed(0)} جرام</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">عدد الحصص</p>
                  <p className="text-lg font-semibold">{selectedRecipe.numberOfPortions.toFixed(1)} حصة</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10">
                  <p className="text-sm text-muted-foreground mb-1">تكلفة الحصة</p>
                  <p className="text-lg font-bold text-primary">{selectedRecipe.costPerPortion.toFixed(2)} ج.م</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-lg">المكونات المستخدمة:</h3>
                <div className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div>
                        <p className="font-medium">
                          {ing.ingredientName}
                          {ing.isRecipe && <span className="text-xs mr-2 text-accent">(وصفة)</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {ing.quantity} {ing.unit}
                        </p>
                      </div>
                      <p className="font-semibold text-primary">{ing.cost.toFixed(2)} ج.م</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">التكلفة الكلية:</p>
                  <p className="text-2xl font-bold text-primary">{selectedRecipe.totalCost.toFixed(2)} ج.م</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الوصفة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDeleteRecipe(deleteId);
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
