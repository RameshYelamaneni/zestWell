import type { AppData, ExportPayload, Meal, WhoopDay, WeightEntry, LabResult, Profile } from '../types'
import { createSeededData } from './seed'

const DATA_KEY = 'zestwell.data.v1'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function withoutPhoto(meal: Meal): Meal {
  const copy: Meal = { ...meal }
  delete copy.photoDataUrl
  return copy
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (!raw) {
      const seeded = createSeededData()
      saveData(seeded)
      return seeded
    }
    const parsed = JSON.parse(raw) as Partial<AppData>
    const seeded = createSeededData()
    return {
      version: 1,
      profile: { ...seeded.profile, ...(parsed.profile ?? {}) },
      meals: asArray<Meal>(parsed.meals),
      whoop: asArray<WhoopDay>(parsed.whoop),
      weights: Array.isArray(parsed.weights) ? parsed.weights : seeded.weights,
      labs: Array.isArray(parsed.labs) ? parsed.labs : seeded.labs,
      settings: { openaiKey: parsed.settings?.openaiKey ?? '' },
    }
  } catch {
    const seeded = createSeededData()
    saveData(seeded)
    return seeded
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
  } catch {
    const withoutPhotos: AppData = {
      ...data,
      meals: data.meals.map(withoutPhoto),
    }
    localStorage.setItem(DATA_KEY, JSON.stringify(withoutPhotos))
  }
}

export function buildExport(data: AppData): ExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: data.profile,
    meals: data.meals.map(withoutPhoto),
    whoop: data.whoop,
    weights: data.weights,
    labs: data.labs,
  }
}

export function parseImport(
  json: string,
): Pick<AppData, 'profile' | 'meals' | 'whoop' | 'weights' | 'labs'> {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  if (!isObject(parsed)) {
    throw new Error('Import must be a JSON object.')
  }
  if (parsed.version !== 1 && parsed.version !== undefined) {
    throw new Error(`Unsupported export version: ${String(parsed.version)}`)
  }
  if (
    !Array.isArray(parsed.meals) ||
    !Array.isArray(parsed.whoop) ||
    !Array.isArray(parsed.weights) ||
    !Array.isArray(parsed.labs)
  ) {
    throw new Error('That JSON is missing meals, WHOOP, weights, or labs arrays.')
  }
  const current = loadData()
  const profile: Profile = isObject(parsed.profile)
    ? { ...current.profile, ...(parsed.profile as Partial<Profile>) }
    : current.profile
  return {
    profile,
    meals: asArray<Meal>(parsed.meals),
    whoop: asArray<WhoopDay>(parsed.whoop),
    weights: asArray<WeightEntry>(parsed.weights),
    labs: asArray<LabResult>(parsed.labs),
  }
}
