import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import {
  addDays,
  endOfMonth,
  endOfWeekSaturday,
  formatShort,
  monthLabel,
  shiftMonth,
  startOfMonth,
  startOfWeekSunday,
  todayISO,
} from '../lib/dates'
import { round0, round1 } from '../lib/nutrition'
import { summarizePeriod, type PeriodSummary } from '../lib/summaries'
import { useStore } from '../state/store'

type Mode = 'week' | 'month'

export function SummariesPage() {
  const { data } = useStore()
  const [mode, setMode] = useState<Mode>('week')
  const [cursor, setCursor] = useState(todayISO)

  const start = mode === 'week' ? startOfWeekSunday(cursor) : startOfMonth(cursor)
  const end = mode === 'week' ? endOfWeekSaturday(cursor) : endOfMonth(cursor)
  const summary = summarizePeriod(data, start, end)

  function shift(delta: number) {
    if (mode === 'week') setCursor(addDays(start, delta * 7))
    else setCursor(shiftMonth(start, delta))
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl">Summaries</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          A new week runs Sunday to Saturday. A new month starts on the 1st. If nothing was logged, the
          summary says so — figures are not filled in.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <Toggle active={mode === 'week'} onClick={() => setMode('week')}>
          Weekly
        </Toggle>
        <Toggle active={mode === 'month'} onClick={() => setMode('month')}>
          Monthly
        </Toggle>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="tap grid size-11 place-items-center rounded-full bg-card"
          aria-label="Previous period"
          onClick={() => shift(-1)}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="font-display text-lg">
            {mode === 'week' ? `${formatShort(start)} – ${formatShort(end)}` : monthLabel(start)}
          </p>
          <p className="text-xs text-ink-soft">
            {mode === 'week' ? 'Sunday to Saturday' : 'Calendar month'}
          </p>
        </div>
        <button
          type="button"
          className="tap grid size-11 place-items-center rounded-full bg-card"
          aria-label="Next period"
          onClick={() => shift(1)}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <SummaryCard summary={summary} />
    </div>
  )
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tap rounded-2xl px-3 py-3 text-sm font-semibold ${
        active ? 'bg-forest text-paper' : 'bg-card text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function SummaryCard({ summary }: { summary: PeriodSummary }) {
  const empty = summary.mealDays === 0 && summary.whoopDays === 0 && summary.weightDays === 0
  if (empty) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-card/70 px-4 py-8 text-center">
        <p className="font-display text-xl">No data logged</p>
        <p className="mt-2 text-sm text-ink-soft">
          Nothing was saved in this {summary.daysInPeriod}-day window, so there is no average to show.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Stat
        label="Days with meals"
        value={`${summary.mealDays} of ${summary.daysInPeriod}`}
        note={summary.mealDays === 0 ? 'No meals logged this period.' : undefined}
      />
      <Stat
        label="Average daily intake"
        value={
          summary.averageIntake === null ? 'No meals logged' : `${round0(summary.averageIntake)} kcal`
        }
        note="Average of days that have meals, not a calorie target."
      />
      <Stat
        label="Average steps"
        value={summary.averageSteps === null ? 'No steps logged' : `${round0(summary.averageSteps)}`}
        note={summary.averageSteps === null ? 'Add steps from the WHOOP mobile app on Today.' : undefined}
      />
      <Stat
        label="Weight change"
        value={
          summary.weightChange === null
            ? summary.weightLast === null
              ? 'No weight logged'
              : `${summary.weightLast.toFixed(1)} kg (one log)`
            : `${summary.weightChange > 0 ? '+' : ''}${round1(summary.weightChange)} kg`
        }
      />
      <Stat
        label="Activities"
        value={String(summary.activityCount)}
        note={summary.activityCount === 0 ? 'No workouts logged this period.' : undefined}
      />
    </div>
  )
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <article className="rounded-3xl bg-card px-4 py-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="font-display text-3xl">{value}</p>
      {note ? <p className="mt-1 text-xs text-ink-soft">{note}</p> : null}
    </article>
  )
}
