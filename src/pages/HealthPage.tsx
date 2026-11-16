import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EmptyState } from '../components/EmptyState'
import { NumberField, PrimaryButton, SecondaryButton, TextField } from '../components/Fields'
import { formatShort } from '../lib/dates'
import { nid } from '../lib/ids'
import { useStore } from '../state/store'
import type { LabResult } from '../types'

export function HealthPage() {
  const { data, upsertLab, deleteLab } = useStore()
  const groups = useMemo(() => groupLabs(data.labs), [data.labs])
  const [open, setOpen] = useState<string | null>(groups[0]?.name ?? null)
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl">Health results</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Preloaded Evolt 360 scan from 15 Nov 2026, 09:08. Each test keeps its own trend.
        </p>
      </header>

      <SecondaryButton onClick={() => setAdding((v) => !v)}>
        {adding ? 'Close form' : 'Add a result'}
      </SecondaryButton>
      {adding ? (
        <LabForm
          onSave={(lab) => {
            upsertLab(lab)
            setAdding(false)
            setOpen(lab.testName)
          }}
        />
      ) : null}

      {groups.length === 0 ? (
        <EmptyState title="No results yet" body="Add a test with a date, value, unit, and optional reference range." />
      ) : (
        groups.map((group) => {
          const latest = group.rows[group.rows.length - 1]
          const expanded = open === group.name
          return (
            <article key={group.name} className="rounded-3xl bg-card p-4 shadow-sm">
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 text-left"
                onClick={() => setOpen(expanded ? null : group.name)}
              >
                <div>
                  <p className="font-display text-xl">{group.name}</p>
                  <p className="text-sm text-ink-soft">
                    {latest.date}
                    {latest.time ? ` · ${latest.time}` : ''}
                    {latest.source ? ` · ${latest.source}` : ''}
                  </p>
                </div>
                <p className="font-display text-2xl tabular-nums">
                  {formatValue(latest.value)}
                  <span className="ml-1 text-sm font-sans text-ink-soft">{latest.unit}</span>
                </p>
              </button>
              {latest.referenceRange ? (
                <p className="mt-1 text-xs text-ink-soft">Reference: {latest.referenceRange}</p>
              ) : null}
              {expanded ? (
                <div className="mt-3 space-y-3 border-t border-line pt-3">
                  {group.rows.length === 1 ? (
                    <p className="text-sm text-ink-soft">Log another reading to see a trend.</p>
                  ) : (
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={group.rows.map((row) => ({
                            label: formatShort(row.date),
                            value: row.value,
                          }))}
                          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                        >
                          <CartesianGrid stroke="#ddd4c4" strokeDasharray="3 3" />
                          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                          <Tooltip formatter={(value) => [`${Number(value)} ${latest.unit}`, group.name]} />
                          <Line type="monotone" dataKey="value" stroke="#1f6b56" strokeWidth={2.2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <ul className="space-y-2">
                    {[...group.rows].reverse().map((row) => (
                      <li key={row.id} className="flex items-center justify-between text-sm">
                        <span>
                          {row.date}
                          {row.time ? ` ${row.time}` : ''} · {formatValue(row.value)} {row.unit}
                        </span>
                        <button
                          type="button"
                          className="tap text-danger"
                          onClick={() => deleteLab(row.id)}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                  <LabForm
                    presetName={group.name}
                    presetUnit={latest.unit}
                    presetRange={latest.referenceRange}
                    onSave={upsertLab}
                  />
                </div>
              ) : null}
            </article>
          )
        })
      )}
    </div>
  )
}

function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100)
}

function groupLabs(labs: LabResult[]) {
  const map = new Map<string, LabResult[]>()
  for (const lab of labs) {
    const list = map.get(lab.testName) ?? []
    list.push(lab)
    map.set(lab.testName, list)
  }
  return [...map.entries()].map(([name, rows]) => ({
    name,
    rows: rows.slice().sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? '')),
  }))
}

function LabForm({
  presetName,
  presetUnit,
  presetRange,
  onSave,
}: {
  presetName?: string
  presetUnit?: string
  presetRange?: string
  onSave: (lab: LabResult) => void
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('')
  const [testName, setTestName] = useState(presetName ?? '')
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState(presetUnit ?? '')
  const [referenceRange, setReferenceRange] = useState(presetRange ?? '')
  const [source, setSource] = useState('')
  const [error, setError] = useState<string | null>(null)

  function save() {
    const n = Number(value)
    if (!testName.trim() || !date || !Number.isFinite(n)) {
      setError('Date, test name, and a numeric value are required.')
      return
    }
    setError(null)
    onSave({
      id: nid(),
      date,
      time: time.trim() || undefined,
      testName: testName.trim(),
      value: n,
      unit: unit.trim(),
      referenceRange: referenceRange.trim() || undefined,
      source: source.trim() || undefined,
    })
    setValue('')
  }

  return (
    <div className="space-y-2 rounded-2xl border border-line p-3">
      <TextField id="lab-date" label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <TextField id="lab-time" label="Time (optional)" value={time} placeholder="09:08" onChange={(e) => setTime(e.target.value)} />
      <TextField id="lab-name" label="Test name" value={testName} onChange={(e) => setTestName(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <NumberField id="lab-value" label="Value" value={value} onChange={(e) => setValue(e.target.value)} />
        <TextField id="lab-unit" label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
      </div>
      <TextField
        id="lab-range"
        label="Reference range"
        value={referenceRange}
        onChange={(e) => setReferenceRange(e.target.value)}
      />
      <TextField id="lab-source" label="Source" value={source} placeholder="Evolt 360, lab…" onChange={(e) => setSource(e.target.value)} />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <PrimaryButton onClick={save}>Save result</PrimaryButton>
    </div>
  )
}
