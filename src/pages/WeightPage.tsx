import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EmptyState } from '../components/EmptyState'
import { NumberField, PrimaryButton, TextField } from '../components/Fields'
import { formatBmi, formatKgLb, heightCm } from '../lib/bmi'
import { formatShort } from '../lib/dates'
import { nid } from '../lib/ids'
import { useStore } from '../state/store'

export function WeightPage() {
  const { data, addWeight, deleteWeight } = useStore()
  const { profile, weights } = data
  const [kg, setKg] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [error, setError] = useState<string | null>(null)

  const sorted = useMemo(
    () =>
      weights
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)),
    [weights],
  )
  const latest = sorted[sorted.length - 1]
  const start = sorted[0]
  const currentKg = latest?.kg ?? 86
  const lost = Math.max(0, (start?.kg ?? 86) - currentKg)
  const toGo = Math.max(0, currentKg - profile.targetWeightKg)
  const span = Math.max((start?.kg ?? 86) - profile.targetWeightKg, 0.1)
  const progress = Math.min(100, (lost / span) * 100)
  const bmiText = formatBmi(currentKg, profile.heightFeet, profile.heightInches)
  const cm = heightCm(profile.heightFeet, profile.heightInches)

  const chartData = sorted.map((row) => ({
    date: row.date,
    label: formatShort(row.date),
    kg: row.kg,
    target: profile.targetWeightKg,
  }))

  function save() {
    const value = Number(kg)
    if (!date || !Number.isFinite(value) || value <= 0) {
      setError('Enter a weight in kg.')
      return
    }
    setError(null)
    addWeight({ id: nid(), date, kg: value, createdAt: new Date().toISOString() })
    setKg('')
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-wide text-ink-soft">Current</p>
        <p className="font-display text-5xl leading-none">{currentKg.toFixed(1)} kg</p>
        <p className="mt-1 text-sm text-ink-soft">
          BMI {bmiText} · {profile.heightFeet} ft {profile.heightInches} in ({cm} cm)
        </p>
      </header>

      <section className="rounded-3xl bg-card p-4 shadow-sm">
        <div className="flex justify-between text-sm">
          <span>{lost.toFixed(1)} kg lost</span>
          <span>{toGo.toFixed(1)} kg to go</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-paper-2">
          <div className="h-full rounded-full bg-forest" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-ink-soft">
          Recorded target {profile.targetWeightKg} kg {profile.targetNote}. Tracking only — not a prescribed pace.
        </p>
      </section>

      <section className="rounded-3xl bg-card p-3 shadow-sm">
        <p className="px-1 pb-2 text-sm text-ink-soft">86 kg toward {profile.targetWeightKg} kg</p>
        <div className="h-56">
          {chartData.length === 0 ? (
            <EmptyState title="No weights yet" body="Log a weigh-in to start the trend." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#ddd4c4" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) => [
                    `${Number(value).toFixed(1)} kg`,
                    name === 'target' ? 'Target' : 'Weight',
                  ]}
                />
                <ReferenceLine y={profile.targetWeightKg} stroke="#c46b3a" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="kg" stroke="#1f6b56" strokeWidth={2.4} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-3xl bg-card p-4 shadow-sm">
        <h2 className="font-display text-xl">Log weight</h2>
        <TextField
          id="weight-date"
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <NumberField
          id="weight-kg"
          label="kg"
          min={0}
          step={0.1}
          value={kg}
          placeholder="86"
          onChange={(e) => setKg(e.target.value)}
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <PrimaryButton onClick={save}>Save weight</PrimaryButton>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl">History</h2>
        {sorted.length === 0 ? (
          <EmptyState title="No weigh-ins" body="Baseline will appear here once logged." />
        ) : (
          [...sorted].reverse().map((row) => (
            <article key={row.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
              <div>
                <p className="font-medium">{formatKgLb(row.kg)}</p>
                <p className="text-sm text-ink-soft">
                  {row.date}
                  {row.date === '2026-11-15' && row.kg === 86 ? ' · baseline' : ''}
                  {' · BMI '}
                  {formatBmi(row.kg, profile.heightFeet, profile.heightInches)}
                </p>
              </div>
              <button
                type="button"
                className="tap text-sm font-semibold text-danger"
                onClick={() => deleteWeight(row.id)}
              >
                Delete
              </button>
            </article>
          ))
        )}
      </section>
    </div>
  )
}
