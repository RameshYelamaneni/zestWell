import type { AppData, WhoopActivity } from '../types'
import { inRange } from './dates'
import { mealsTotals } from './nutrition'

export type PeriodSummary = {
  start: string
  end: string
  daysInPeriod: number
  mealDays: number
  whoopDays: number
  weightDays: number
  averageIntake: number | null
  averageSteps: number | null
  weightFirst: number | null
  weightLast: number | null
  weightChange: number | null
  activityCount: number
}

function daysBetween(start: string, end: string): number {
  const a = Date.parse(`${start}T00:00:00`)
  const b = Date.parse(`${end}T00:00:00`)
  return Math.round((b - a) / 86400000) + 1
}

export function summarizePeriod(data: AppData, start: string, end: string): PeriodSummary {
  const meals = data.meals.filter((m) => inRange(m.date, start, end))
  const mealDates = new Set(meals.map((m) => m.date))
  const whoop = data.whoop.filter((w) => inRange(w.date, start, end))
  const weights = data.weights
    .filter((w) => inRange(w.date, start, end))
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))

  let averageIntake: number | null = null
  if (mealDates.size > 0) {
    let sum = 0
    for (const date of mealDates) {
      sum += mealsTotals(meals.filter((m) => m.date === date)).calories
    }
    averageIntake = sum / mealDates.size
  }

  const stepped = whoop.filter((w) => typeof w.steps === 'number')
  const averageSteps =
    stepped.length > 0
      ? stepped.reduce((acc, w) => acc + (w.steps ?? 0), 0) / stepped.length
      : null

  const weightFirst = weights[0]?.kg ?? null
  const weightLast = weights.length > 0 ? weights[weights.length - 1].kg : null
  const weightChange =
    weightFirst !== null && weightLast !== null && weights.length >= 2
      ? weightLast - weightFirst
      : null

  const activityCount = whoop.reduce(
    (acc, day) => acc + day.activities.filter((a: WhoopActivity) => a.name.trim()).length,
    0,
  )

  return {
    start,
    end,
    daysInPeriod: daysBetween(start, end),
    mealDays: mealDates.size,
    whoopDays: whoop.length,
    weightDays: weights.length,
    averageIntake,
    averageSteps,
    weightFirst,
    weightLast,
    weightChange,
    activityCount,
  }
}
