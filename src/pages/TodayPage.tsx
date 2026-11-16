import { Camera, Plus } from 'lucide-react'
import { useState } from 'react'
import { DateNav } from '../components/DateNav'
import { EmptyState } from '../components/EmptyState'
import { NumberField, PrimaryButton, SecondaryButton, TextField } from '../components/Fields'
import { MealEditor } from '../components/MealEditor'
import { nid } from '../lib/ids'
import { itemTotals, MEAL_LABEL, MEAL_TYPES, mealsTotals, round0, round1 } from '../lib/nutrition'
import { useStore } from '../state/store'
import type { Meal, WhoopActivity, WhoopDay } from '../types'

export function TodayPage({ date, onDate }: { date: string; onDate: (d: string) => void }) {
  const { data, upsertMeal, deleteMeal, upsertWhoop } = useStore()
  const meals = data.meals.filter((m) => m.date === date)
  const totals = mealsTotals(meals)
  const whoop = data.whoop.find((w) => w.date === date) ?? emptyWhoop(date)
  const [editor, setEditor] = useState<{ meal?: Meal; scan: boolean } | null>(null)
  const [whoopOpen, setWhoopOpen] = useState(false)

  const grouped = MEAL_TYPES.map((type) => ({
    type,
    meals: meals.filter((m) => m.mealType === type),
  }))

  return (
    <div className="space-y-4">
      <DateNav date={date} onChange={onDate} />

      <section className="rounded-3xl bg-forest px-5 py-5 text-paper">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/70">Intake today</p>
        <p className="font-display text-6xl leading-none tracking-tight">{round0(totals.calories)}</p>
        <p className="mt-1 text-sm text-paper/80">kcal logged · not a target</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Macro label="Protein" value={`${round1(totals.protein)} g`} />
          <Macro label="Carbs" value={`${round1(totals.carbs)} g`} />
          <Macro label="Fat" value={`${round1(totals.fat)} g`} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setEditor({ scan: true })}
          className="tap col-span-2 flex min-h-16 items-center justify-center gap-2 rounded-3xl bg-clay px-4 text-lg font-semibold text-paper shadow-sm"
        >
          <Camera size={22} /> Scan meal
        </button>
        <SecondaryButton onClick={() => setEditor({ scan: false })}>
          <span className="inline-flex items-center justify-center gap-2">
            <Plus size={18} /> Manual meal
          </span>
        </SecondaryButton>
        <SecondaryButton onClick={() => setWhoopOpen((v) => !v)}>WHOOP</SecondaryButton>
      </div>

      <section className="grid grid-cols-2 gap-2">
        <div className="rounded-3xl bg-card px-4 py-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Steps</p>
          <p className="font-display text-3xl">{whoop.steps ?? '—'}</p>
        </div>
        <div className="rounded-3xl bg-card px-4 py-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Activities</p>
          <p className="font-display text-3xl">{whoop.activities.filter((a) => a.name.trim()).length}</p>
        </div>
      </section>

      {whoopOpen ? (
        <WhoopForm day={whoop} onSave={(next) => { upsertWhoop(next); setWhoopOpen(false) }} />
      ) : null}

      {meals.length === 0 ? (
        <EmptyState
          title="No meals logged"
          body="Scan a plate or add breakfast, lunch, dinner, or snacks by hand. Empty days stay empty — zestWell will not invent intake."
        />
      ) : (
        grouped.map((group) =>
          group.meals.length === 0 ? null : (
            <section key={group.type} className="space-y-2">
              <div className="flex items-baseline justify-between px-1">
                <h2 className="font-display text-xl">{MEAL_LABEL[group.type]}</h2>
                <p className="text-sm text-ink-soft">
                  {round0(mealsTotals(group.meals).calories)} kcal
                </p>
              </div>
              {group.meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onEdit={() => setEditor({ meal, scan: false })}
                  onDelete={() => deleteMeal(meal.id)}
                />
              ))}
            </section>
          ),
        )
      )}

      {editor ? (
        <MealEditor
          date={date}
          openaiKey={data.settings.openaiKey}
          initial={editor.meal}
          startWithScan={editor.scan && !editor.meal}
          onClose={() => setEditor(null)}
          onSave={(meal) => {
            upsertMeal(meal)
            setEditor(null)
          }}
        />
      ) : null}
    </div>
  )
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-paper/10 px-2 py-2">
      <p className="text-[11px] uppercase tracking-wide text-paper/70">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}

function MealCard({
  meal,
  onEdit,
  onDelete,
}: {
  meal: Meal
  onEdit: () => void
  onDelete: () => void
}) {
  const totals = itemTotals(meal.items)
  return (
    <article className="rounded-3xl bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">
            {meal.items.map((i) => i.name || 'Untitled').join(', ')}
          </p>
          <p className="text-sm text-ink-soft">
            {round0(totals.calories)} kcal
            {meal.source === 'scan' ? ' · estimate' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="tap rounded-full px-3 text-sm font-semibold text-forest" onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="tap rounded-full px-3 text-sm font-semibold text-danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

function emptyWhoop(date: string): WhoopDay {
  return { date, activities: [] }
}

function WhoopForm({ day, onSave }: { day: WhoopDay; onSave: (day: WhoopDay) => void }) {
  const [steps, setSteps] = useState(day.steps?.toString() ?? '')
  const [strain, setStrain] = useState(day.strain?.toString() ?? '')
  const [recovery, setRecovery] = useState(day.recovery?.toString() ?? '')
  const [sleepPerf, setSleepPerf] = useState(day.sleepPerformance?.toString() ?? '')
  const [hours, setHours] = useState(day.hoursSlept?.toString() ?? '')
  const [activities, setActivities] = useState<WhoopActivity[]>(
    day.activities.length ? day.activities : [{ id: nid(), name: '', minutes: undefined }],
  )

  function optionalNumber(raw: string): number | undefined {
    if (raw.trim() === '') return undefined
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }

  return (
    <section className="space-y-3 rounded-3xl border border-line bg-card p-4">
      <h2 className="font-display text-xl">WHOOP — {day.date}</h2>
      <p className="text-sm leading-relaxed text-ink-soft">
        Steps don&apos;t show on the WHOOP website, enter them from the WHOOP mobile app.
      </p>
      <NumberField id="steps" label="Steps" min={0} value={steps} onChange={(e) => setSteps(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <NumberField id="strain" label="Strain" min={0} step={0.1} value={strain} onChange={(e) => setStrain(e.target.value)} />
        <NumberField id="recovery" label="Recovery %" min={0} max={100} value={recovery} onChange={(e) => setRecovery(e.target.value)} />
        <NumberField
          id="sleep-perf"
          label="Sleep performance %"
          min={0}
          max={100}
          value={sleepPerf}
          onChange={(e) => setSleepPerf(e.target.value)}
        />
        <NumberField
          id="hours"
          label="Hours slept"
          min={0}
          step={0.1}
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Activities / workouts</p>
        {activities.map((activity) => (
          <div key={activity.id} className="grid grid-cols-3 gap-2">
            <TextField
              id={`${activity.id}-name`}
              label="Activity"
              className="col-span-2"
              value={activity.name}
              placeholder="Walk, strength…"
              onChange={(e) =>
                setActivities((prev) =>
                  prev.map((row) => (row.id === activity.id ? { ...row, name: e.target.value } : row)),
                )
              }
            />
            <NumberField
              id={`${activity.id}-min`}
              label="Minutes"
              min={0}
              value={activity.minutes ?? ''}
              onChange={(e) =>
                setActivities((prev) =>
                  prev.map((row) =>
                    row.id === activity.id ? { ...row, minutes: optionalNumber(e.target.value) } : row,
                  ),
                )
              }
            />
          </div>
        ))}
        <SecondaryButton
          onClick={() => setActivities((prev) => [...prev, { id: nid(), name: '' }])}
        >
          Add activity
        </SecondaryButton>
      </div>
      <PrimaryButton
        onClick={() =>
          onSave({
            date: day.date,
            steps: optionalNumber(steps),
            strain: optionalNumber(strain),
            recovery: optionalNumber(recovery),
            sleepPerformance: optionalNumber(sleepPerf),
            hoursSlept: optionalNumber(hours),
            activities: activities.filter((a) => a.name.trim()),
          })
        }
      >
        Save WHOOP
      </PrimaryButton>
    </section>
  )
}
