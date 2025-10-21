import { useEffect, useState } from "react";
import { Calculator } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import supabase from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IngredientForm } from "@/components/IngredientForm";
import { IngredientsList } from "@/components/IngredientsList";
import { RecipeForm } from "@/components/RecipeForm";
import { RecipesList } from "@/components/RecipesList";
import { Ingredient, Recipe } from "@/types";
import { toast } from "sonner";
import SupabaseTest from '@/components/SupabaseTest'
import { useAuth } from '@/lib/auth'
import { fetchRecipesForUser, createRecipeForUser, updateRecipeForUser, deleteRecipeForUser } from '@/lib/recipes'
import { fetchIngredientsForUser, createIngredientForUser, updateIngredientForUser, deleteIngredientForUser } from '@/lib/ingredients'

const Index = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const { session } = useAuth()
  const navigate = useNavigate()
  const [signOutLoading, setSignOutLoading] = useState(false)

  const handleSignOut = async () => {
    setSignOutLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('تم تسجيل الخروج')
      navigate('/login')
    } catch (err: any) {
      console.error('sign out error', err)
      toast.error(err?.message ?? 'حدث خطأ أثناء تسجيل الخروج')
    } finally {
      setSignOutLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!session?.user?.id) return
      try {
        const [rows, ingRows] = await Promise.all([
          fetchRecipesForUser(session.user.id),
          fetchIngredientsForUser(session.user.id),
        ])
        if (mounted) {
          setRecipes(rows)
          setIngredients(ingRows)
        }
      } catch (err: any) {
        console.error('load recipes error', err)
        // show nested error details if available
        if (err?.status || err?.code || err?.message) {
          console.error('supabase error details', {
            status: err.status,
            code: err.code,
            message: err.message,
            details: err.details,
            hint: err.hint,
          })
        }
        toast.error('حدث خطأ عند تحميل الوصفات')
      }
    }
    load()
    return () => { mounted = false }
  }, [session])

  const handleAddIngredient = (ingredient: Ingredient) => {
    (async () => {
      if (!session?.user?.id) {
        toast.error('يجب تسجيل الدخول')
        return
      }
      try {
        const created = await createIngredientForUser(session.user.id, ingredient)
        setIngredients([...ingredients, created])
        toast.success('تمت إضافة المكون بنجاح!')
      } catch (err: any) {
        console.error('create ingredient error', err)
        toast.error('فشل إضافة المكون')
      }
    })()
  };

  const handleDeleteIngredient = (id: string) => {
    (async () => {
      try {
        await deleteIngredientForUser(session?.user?.id, id)
        setIngredients(ingredients.filter((ing) => ing.id !== id))
        toast.success('تم حذف المكون')
      } catch (err: any) {
        console.error('delete ingredient error', err)
        toast.error('فشل حذف المكون')
      }
    })()
  };

  const handleAddRecipe = async (recipe: Recipe) => {
    if (!session?.user?.id) {
      toast.error('يجب تسجيل الدخول')
      return
    }
    try {
      const created = await createRecipeForUser(session.user.id, recipe)
      setRecipes([created, ...recipes])
      toast.success('تم حفظ الوصفة')
    } catch (err: any) {
      console.error('create recipe error', err)
      toast.error('فشل حفظ الوصفة')
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    try {
      await deleteRecipeForUser(session?.user?.id, id)
      setRecipes(recipes.filter((rec) => rec.id !== id))
      toast.success('تم حذف الوصفة')
    } catch (err: any) {
      console.error('delete recipe error', err)
      toast.error('فشل حذف الوصفة')
    }
  };

  const handleUpdateIngredient = (ingredient: Ingredient) => {
    (async () => {
      try {
        await updateIngredientForUser(session?.user?.id, ingredient)
        setIngredients(ingredients.map(ing => ing.id === ingredient.id ? ingredient : ing))
        // clear any open ingredient editing UI
        setEditingIngredient(prev => (prev && prev.id === ingredient.id ? null : prev))
        toast.success('تم تحديث المكون بنجاح!')
      } catch (err: any) {
        console.error('update ingredient error', err)
        toast.error('فشل تحديث المكون')
      }
    })()
  };

  const handleUpdateRecipe = async (recipe: Recipe) => {
    try {
      const updated = await updateRecipeForUser(session?.user?.id, recipe)
      setRecipes(recipes.map(rec => rec.id === updated.id ? updated : rec))
      toast.success('تم تحديث الوصفة بنجاح!')
      // clear editing state if we were editing this recipe
      setEditingRecipe(prev => (prev && prev.id === updated.id ? null : prev));
    } catch (err: any) {
      console.error('update recipe error', err)
      toast.error('فشل تحديث الوصفة')
    }
  };

  return (
    <div className="h-screen overflow-hidden gradient-subtle flex flex-col">
      <div className="container mx-auto px-3 py-3 max-w-7xl flex flex-col h-full">
        {/* Header - Compact */}
        <header className="text-center mb-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Calculator className="w-7 h-7 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold gradient-primary bg-clip-text text-transparent">
              حساب تكلفة الوصفات
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            احسب تكلفة المكونات والوصفات بدقة - بالجنيه المصري
          </p>
          {/* Login / Logout control */}
          <div className="mt-2 flex items-center justify-center">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{session.user.email}</span>
                <Button onClick={handleSignOut} disabled={signOutLoading} className="h-9">
                  {signOutLoading ? 'جاري الخروج...' : 'تسجيل الخروج'}
                </Button>
              </div>
            ) : (
              <Link to="/login" className="inline-block text-sm text-primary underline">تسجيل الدخول</Link>
            )}
          </div>
        </header>

        {/* Main Content - Flexible */}
        <div className="mb-3">
          <SupabaseTest />
        </div>
        <Tabs defaultValue="ingredients" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-3 shadow-md">
            <TabsTrigger value="ingredients" className="font-semibold">المكونات</TabsTrigger>
            <TabsTrigger value="recipes" className="font-semibold">الوصفات</TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients" className="flex-1 overflow-auto m-0">
            <div className="grid lg:grid-cols-2 gap-3 h-full">
              <IngredientForm 
                onAddIngredient={handleAddIngredient} 
                ingredients={ingredients}
                onUpdateIngredient={handleUpdateIngredient}
                editingIngredient={editingIngredient}
                onCancelEdit={() => setEditingIngredient(null)}
              />
              <IngredientsList
                ingredients={ingredients}
                onDeleteIngredient={handleDeleteIngredient}
                onUpdateIngredient={handleUpdateIngredient}
                onEditIngredient={(ing) => setEditingIngredient(ing)}
              />
            </div>
          </TabsContent>

          <TabsContent value="recipes" className="flex-1 overflow-auto m-0">
            <div className="grid lg:grid-cols-2 gap-3 h-full">
              <RecipeForm
                ingredients={ingredients}
                recipes={recipes}
                onAddRecipe={handleAddRecipe}
                onUpdateRecipe={handleUpdateRecipe}
                editingRecipe={editingRecipe}
                onCancelEdit={() => setEditingRecipe(null)}
              />
              <RecipesList 
                recipes={recipes} 
                onDeleteRecipe={handleDeleteRecipe}
                onUpdateRecipe={handleUpdateRecipe}
                onEditRecipe={(r) => setEditingRecipe(r)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
