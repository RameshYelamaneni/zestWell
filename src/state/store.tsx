import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loadData, parseImport, saveData } from '../lib/storage'
import type { AppData, LabResult, Meal, Profile, WhoopDay, WeightEntry } from '../types'

type Store = {
  data: AppData
  replace: (next: AppData) => void
  updateProfile: (patch: Partial<Profile>) => void
  setOpenaiKey: (key: string) => void
  upsertMeal: (meal: Meal) => void
  deleteMeal: (id: string) => void
  upsertWhoop: (day: WhoopDay) => void
  addWeight: (entry: WeightEntry) => void
  deleteWeight: (id: string) => void
  upsertLab: (lab: LabResult) => void
  deleteLab: (id: string) => void
  importJson: (json: string) => void
}

const StoreContext = createContext<Store | null>(null)

function persist(next: AppData): AppData {
  saveData(next)
  return next
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())

  const replace = useCallback((next: AppData) => {
    setData(persist(next))
  }, [])

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setData((prev) => persist({ ...prev, profile: { ...prev.profile, ...patch } }))
  }, [])

  const setOpenaiKey = useCallback((key: string) => {
    setData((prev) => persist({ ...prev, settings: { openaiKey: key } }))
  }, [])

  const upsertMeal = useCallback((meal: Meal) => {
    setData((prev) => {
      const exists = prev.meals.some((m) => m.id === meal.id)
      const meals = exists
        ? prev.meals.map((m) => (m.id === meal.id ? meal : m))
        : [...prev.meals, meal]
      return persist({ ...prev, meals })
    })
  }, [])

  const deleteMeal = useCallback((id: string) => {
    setData((prev) => persist({ ...prev, meals: prev.meals.filter((m) => m.id !== id) }))
  }, [])

  const upsertWhoop = useCallback((day: WhoopDay) => {
    setData((prev) => {
      const exists = prev.whoop.some((w) => w.date === day.date)
      const whoop = exists
        ? prev.whoop.map((w) => (w.date === day.date ? day : w))
        : [...prev.whoop, day]
      return persist({ ...prev, whoop })
    })
  }, [])

  const addWeight = useCallback((entry: WeightEntry) => {
    setData((prev) => persist({ ...prev, weights: [...prev.weights, entry] }))
  }, [])

  const deleteWeight = useCallback((id: string) => {
    setData((prev) => persist({ ...prev, weights: prev.weights.filter((w) => w.id !== id) }))
  }, [])

  const upsertLab = useCallback((lab: LabResult) => {
    setData((prev) => {
      const exists = prev.labs.some((row) => row.id === lab.id)
      const labs = exists
        ? prev.labs.map((row) => (row.id === lab.id ? lab : row))
        : [...prev.labs, lab]
      return persist({ ...prev, labs })
    })
  }, [])

  const deleteLab = useCallback((id: string) => {
    setData((prev) => persist({ ...prev, labs: prev.labs.filter((row) => row.id !== id) }))
  }, [])

  const importJson = useCallback((json: string) => {
    const imported = parseImport(json)
    setData((prev) =>
      persist({
        ...prev,
        profile: imported.profile,
        meals: imported.meals,
        whoop: imported.whoop,
        weights: imported.weights,
        labs: imported.labs,
      }),
    )
  }, [])

  const value = useMemo<Store>(
    () => ({
      data,
      replace,
      updateProfile,
      setOpenaiKey,
      upsertMeal,
      deleteMeal,
      upsertWhoop,
      addWeight,
      deleteWeight,
      upsertLab,
      deleteLab,
      importJson,
    }),
    [
      data,
      replace,
      updateProfile,
      setOpenaiKey,
      upsertMeal,
      deleteMeal,
      upsertWhoop,
      addWeight,
      deleteWeight,
      upsertLab,
      deleteLab,
      importJson,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
