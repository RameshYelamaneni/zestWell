import { Plus } from 'lucide-react'
import { useState } from 'react'
import { DateNav } from '../components/DateNav'
import { EmptyState } from '../components/EmptyState'
import { MealEditor } from '../components/MealEditor'
import { SecondaryButton } from '../components/Fields'
import { itemTotals, MEAL_LABEL, MEAL_TYPES, mealsTotals, round0 } from '../lib/nutrition'
import { useStore } from '../state/store'
import type { Meal } from '../types'

export function MealsPage({ date, onDate }: { date: string; onDate: (d: string) => void }) {
  const { data, upsertMeal, deleteMeal } = useStore()
  const meals = data.meals.filter((m) => m.date === date)
  const [editing, setEditing] = useState<Meal | null | 'new'>(null)
  const dayTotal = mealsTotals(meals)

  return (
    <div className="space-y-4">
      <DateNav date={date} onChange={onDate} />
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-soft">Day intake</p>
          <p className="font-display text-4xl">{round0(dayTotal.calories)} kcal</p>
        </div>
        <SecondaryButton className="w-auto px-4" onClick={() => setEditing('new')}>
          <span className="inline-flex items-center gap-1">
            <Plus size={16} /> Add
          </span>
        </SecondaryButton>
      </div>

      {meals.length === 0 ? (
        <EmptyState
          title="Nothing logged this day"
          body="Meals are grouped as breakfast, lunch, dinner, and snacks. Add one manually, or scan a photo from Today."
        />
      ) : (
        MEAL_TYPES.map((type) => {
          const group = meals.filter((m) => m.mealType === type)
          return (
            <section key={type} className="space-y-2">
              <div className="flex items-baseline justify-between px-1">
                <h2 className="font-display text-xl">{MEAL_LABEL[type]}</h2>
                <p className="text-sm text-ink-soft">
                  {group.length === 0 ? '—' : `${round0(mealsTotals(group).calories)} kcal`}
                </p>
              </div>
              {group.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line px-3 py-3 text-sm text-ink-soft">
                  No {MEAL_LABEL[type].toLowerCase()} yet.
                </p>
              ) : (
                group.map((meal) => {
                  const totals = itemTotals(meal.items)
                  return (
                    <article key={meal.id} className="rounded-3xl bg-card p-4 shadow-sm">
                      <ul className="space-y-1">
                        {meal.items.map((item) => (
                          <li key={item.id} className="flex justify-between gap-3 text-sm">
                            <span>
                              <span className="font-medium">{item.name || 'Untitled'}</span>
                              {item.portion ? (
                                <span className="text-ink-soft"> · {item.portion}</span>
                              ) : null}
                            </span>
                            <span className="tabular-nums">{round0(item.calories)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                        <p className="text-sm">
                          {round0(totals.calories)} kcal
                          {meal.source === 'scan' ? ' · estimate' : ''}
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="tap rounded-full px-3 text-sm font-semibold text-forest"
                            onClick={() => setEditing(meal)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="tap rounded-full px-3 text-sm font-semibold text-danger"
                            onClick={() => deleteMeal(meal.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })
              )}
            </section>
          )
        })
      )}

      {editing !== null ? (
        <MealEditor
          date={date}
          openaiKey={data.settings.openaiKey}
          initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(meal) => {
            upsertMeal(meal)
            setEditing(null)
          }}
        />
      ) : null}
    </div>
  )
}
