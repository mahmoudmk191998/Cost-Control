import supabase from './supabase'
import { Ingredient } from '@/types'
import { fetchRecipesForUser, updateRecipeForUser } from './recipes'

type DbIngredient = {
  id: string
  name: string
  cost: number
  quantity: number
  unit: string
  costPerUnit: number
  user_id?: string
}

export async function fetchIngredientsForUser(userId: string) {
  const { data, error } = await supabase
    .from('ingredients' as any)
    .select('id, name, cost, quantity, unit, cost_per_unit, user_id')
    .eq('user_id', userId)

  if (error) throw new Error((error as any)?.message ?? JSON.stringify(error))

  return (data || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    cost: Number(r.cost),
    quantity: Number(r.quantity),
    unit: r.unit,
    costPerUnit: Number(r.cost_per_unit ?? r.costperunit ?? 0),
  })) as Ingredient[]
}

export async function createIngredientForUser(userId: string, ingredient: Ingredient) {
  const dbRow = {
    name: ingredient.name,
    cost: ingredient.cost,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    cost_per_unit: ingredient.costPerUnit,
    user_id: userId,
  }

  const { data, error } = await supabase
    .from('ingredients' as any)
    .insert([dbRow])
    .select('id')
    .single()

  if (error) throw new Error((error as any)?.message ?? JSON.stringify(error))
  return { ...ingredient, id: data.id }
}

export async function updateIngredientForUser(userId: string, ingredient: Ingredient) {
  const updateRow = {
    name: ingredient.name,
    cost: ingredient.cost,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    cost_per_unit: ingredient.costPerUnit,
  }

  const { data, error } = await supabase
    .from('ingredients' as any)
    .update(updateRow)
    .eq('id', ingredient.id)
    .select('id')
    .single()

  if (error) throw new Error((error as any)?.message ?? JSON.stringify(error))
  // Cascade: update any recipes that reference this ingredient so costs stay in sync
  ;(async () => {
    try {
      const recipes = await fetchRecipesForUser(userId)
      const affected = recipes.filter(r => r.ingredients.some(ri => ri.ingredientId === ingredient.id && !ri.isRecipe))
      for (const rec of affected) {
        // Recompute costs for ingredients in this recipe that reference the updated ingredient
        const newIngredients = rec.ingredients.map((ri) => {
          if (ri.ingredientId === ingredient.id && !ri.isRecipe) {
            // Use ingredient.costPerUnit * quantity (same logic as when adding an ingredient in the UI)
            const unitCost = ingredient.costPerUnit ?? (ingredient.quantity ? ingredient.cost / ingredient.quantity : 0)
            const newCost = (unitCost || 0) * (ri.quantity || 0)
            return { ...ri, cost: newCost }
          }
          return ri
        })

        const totalCost = newIngredients.reduce((s, i) => s + (i.cost ?? 0), 0)
        const numberOfPortions = rec.numberOfPortions || 1
        const costPerPortion = numberOfPortions > 0 ? totalCost / numberOfPortions : 0

        const updatedRecipe = {
          ...rec,
          ingredients: newIngredients,
          totalCost,
          costPerPortion,
        }

        try {
          await updateRecipeForUser(userId, updatedRecipe)
        } catch (e) {
          // non-fatal: log and continue
          // eslint-disable-next-line no-console
          console.warn('Failed to persist updated recipe after ingredient change', { recipeId: rec.id, err: e })
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to cascade ingredient update to recipes', e)
    }
  })()

  return ingredient
}

export async function deleteIngredientForUser(userId: string, ingredientId: string) {
  const { error } = await supabase.from('ingredients' as any).delete().eq('id', ingredientId)
  if (error) throw new Error((error as any)?.message ?? JSON.stringify(error))
  return true
}
