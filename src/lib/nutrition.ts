import type { Meal, MealItem, MealType } from '../types'

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']

export const MEAL_LABEL: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
}

export type MacroTotals = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export const ZERO_MACROS: MacroTotals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
}

export function itemTotals(items: MealItem[]): MacroTotals {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + (Number(item.calories) || 0),
      protein: acc.protein + (Number(item.protein) || 0),
      carbs: acc.carbs + (Number(item.carbs) || 0),
      fat: acc.fat + (Number(item.fat) || 0),
    }),
    { ...ZERO_MACROS },
  )
}

export function mealsTotals(meals: Meal[]): MacroTotals {
  return meals.reduce((acc, meal) => {
    const t = itemTotals(meal.items)
    return {
      calories: acc.calories + t.calories,
      protein: acc.protein + t.protein,
      carbs: acc.carbs + t.carbs,
      fat: acc.fat + t.fat,
    }
  }, { ...ZERO_MACROS })
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function round0(n: number): number {
  return Math.round(n)
}

export function emptyItem(): MealItem {
  return {
    id: crypto.randomUUID(),
    name: '',
    portion: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  }
}
