import supabase from './supabase'
import { Recipe } from '@/types'

type DbRow = {
  id: string
  name: string
  cost: number | null
  notes: string | null
  created_at?: string
  user_id?: string
}

export async function fetchRecipesForUser(userId: string) {
  // Try with ordering; if PostgREST returns a 400 we retry without order to diagnose
  let res = await supabase
    .from('recipes' as any)
    .select('id, name, cost, notes, created_at, user_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (res.error) {
    // Log full error for debugging (message, details, hint, code, status)
    console.error('fetchRecipesForUser (with order) error', {
      message: res.error.message,
      details: (res.error as any).details,
      hint: (res.error as any).hint,
      code: (res.error as any).code,
      status: (res.error as any).status,
    })

    // If it's a 400 Bad Request, retry without order (some PostgREST setups choke on order)
    if ((res.error as any).status === 400) {
      console.warn('Retrying fetchRecipesForUser without order due to 400')
      res = await supabase
        .from('recipes' as any)
        .select('id, name, cost, notes, created_at, user_id')
        .eq('user_id', userId)
    }
  }

  const { data, error } = res
  if (error) throw error

  // Map DB rows to Recipe objects. We store the full recipe JSON inside `notes` (stringified)
  return data!.map((row) => {
    try {
      const parsed = row.notes ? JSON.parse(row.notes) : null
      if (parsed) return { ...(parsed as any), id: row.id } as Recipe
    } catch (e) {
      // if parsing fails, fall through to fallback construction
    }

    // Fallback: construct minimal Recipe using DB id to ensure operations (delete/update) target the correct row
    return {
      id: row.id,
      name: row.name,
      ingredients: [],
      totalCost: row.cost ?? 0,
      batchSizeInGrams: 0,
      numberOfPortions: 1,
      costPerPortion: row.cost ?? 0,
    } as Recipe
  })
}

export async function createRecipeForUser(userId: string, recipe: Recipe) {
  const notes = JSON.stringify(recipe)
  const cost = recipe.totalCost ?? 0

  const { data, error } = await supabase
    .from('recipes' as any)
    .insert([{ name: recipe.name, cost, notes, user_id: userId }])
    .select('id, name, cost, notes, created_at, user_id')
    .single()

  if (error) throw error

  // Parse stored notes to get back the recipe object with id
  const row = data as DbRow
  try {
    const parsed = row.notes ? JSON.parse(row.notes) : null
    if (parsed) return { ...parsed, id: row.id } as Recipe
  } catch (e) {}

  return { ...recipe, id: row.id } as Recipe
}

export async function updateRecipeForUser(userId: string, recipe: Recipe) {
  const notes = JSON.stringify(recipe)
  const cost = recipe.totalCost ?? 0

  const { data, error } = await supabase
    .from('recipes' as any)
    .update({ name: recipe.name, cost, notes })
    .eq('id', recipe.id)
    .select('id, name, cost, notes, created_at, user_id')
    .single()

  if (error) throw error

  const row = data as DbRow
  try {
    const parsed = row.notes ? JSON.parse(row.notes) : null
    if (parsed) return { ...parsed, id: row.id } as Recipe
  } catch (e) {}

  return recipe
}

export async function deleteRecipeForUser(userId: string, recipeId: string) {
  const { error } = await supabase.from('recipes' as any).delete().eq('id', recipeId)
  if (error) throw error
  return true
}
