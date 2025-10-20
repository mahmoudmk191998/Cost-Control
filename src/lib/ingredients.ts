import supabase from './supabase'
import { Ingredient } from '@/types'

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

  if (error) throw error

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

  if (error) throw error
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

  if (error) throw error
  return ingredient
}

export async function deleteIngredientForUser(userId: string, ingredientId: string) {
  const { error } = await supabase.from('ingredients' as any).delete().eq('id', ingredientId)
  if (error) throw error
  return true
}
