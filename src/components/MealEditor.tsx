import { Camera, ImagePlus, Plus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { fileToJpegDataUrl } from '../lib/image'
import { nid } from '../lib/ids'
import { emptyItem, itemTotals, MEAL_LABEL, MEAL_TYPES, round0, round1 } from '../lib/nutrition'
import { analyzeMealPhoto, VisionError } from '../lib/openai'
import type { Meal, MealItem, MealType } from '../types'
import { NumberField, PrimaryButton, SecondaryButton, SelectField, TextField } from './Fields'
import { Sheet } from './Sheet'

type Props = {
  date: string
  openaiKey: string
  initial?: Meal | null
  startWithScan?: boolean
  onClose: () => void
  onSave: (meal: Meal) => void
}

export function MealEditor({ date, openaiKey, initial, startWithScan, onClose, onSave }: Props) {
  const [mealType, setMealType] = useState<MealType>(initial?.mealType ?? guessMealType())
  const [items, setItems] = useState<MealItem[]>(
    initial?.items.length ? initial.items.map((i) => ({ ...i })) : [emptyItem()],
  )
  const [photo, setPhoto] = useState<string | undefined>(initial?.photoDataUrl)
  const [source, setSource] = useState<Meal['source']>(initial?.source ?? 'manual')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(
    !openaiKey && startWithScan
      ? 'No OpenAI key yet. Add one in Settings to scan, or fill this in by hand.'
      : null,
  )
  const cameraRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const totals = itemTotals(items)

  async function onPick(file: File | undefined) {
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      const dataUrl = await fileToJpegDataUrl(file)
      setPhoto(dataUrl)
      if (!openaiKey.trim()) {
        setSource('manual')
        setError('No OpenAI key yet. Add one in Settings to scan, or fill this in by hand.')
        return
      }
      const detected = await analyzeMealPhoto(openaiKey.trim(), dataUrl)
      setItems(detected)
      setSource('scan')
    } catch (err) {
      setSource('manual')
      setError(err instanceof VisionError ? err.message : 'Scan failed. Enter the meal manually.')
    } finally {
      setBusy(false)
    }
  }

  function patchItem(id: string, patch: Partial<MealItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function save() {
    const cleaned = items.filter((item) => item.name.trim() || item.calories > 0)
    if (cleaned.length === 0) {
      setError('Add at least one food item.')
      return
    }
    const now = new Date().toISOString()
    onSave({
      id: initial?.id ?? nid(),
      date,
      mealType,
      items: cleaned,
      photoDataUrl: photo,
      source,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    })
  }

  return (
    <Sheet title={initial ? 'Edit meal' : 'Meal'} onClose={onClose}>
      <div className="space-y-4">
        <SelectField
          id="meal-type"
          label="Meal"
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
        >
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {MEAL_LABEL[type]}
            </option>
          ))}
        </SelectField>

        {source === 'scan' ? (
          <p className="rounded-2xl bg-banner px-3 py-2 text-sm text-ink">
            AI estimate — edit names, portions, and macros before saving.
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        ) : null}

        {photo ? (
          <img src={photo} alt="Meal" className="h-40 w-full rounded-2xl object-cover" />
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <SecondaryButton onClick={() => cameraRef.current?.click()} disabled={busy}>
            <span className="inline-flex items-center justify-center gap-2">
              <Camera size={18} /> Take photo
            </span>
          </SecondaryButton>
          <SecondaryButton onClick={() => fileRef.current?.click()} disabled={busy}>
            <span className="inline-flex items-center justify-center gap-2">
              <ImagePlus size={18} /> Upload
            </span>
          </SecondaryButton>
        </div>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => void onPick(e.target.files?.[0])}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void onPick(e.target.files?.[0])}
        />

        {busy ? (
          <p className="text-center text-sm text-ink-soft">Looking at the photo… this is an estimate.</p>
        ) : null}

        <p className="text-sm text-ink-soft">
          Example for testing: sweet potato chunks (~300g) + 3 boiled egg whites ≈ 370 kcal total.
        </p>

        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={item.id} className="rounded-3xl border border-line bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Item {index + 1}
                </p>
                <button
                  type="button"
                  className="tap grid size-10 place-items-center rounded-full text-danger"
                  aria-label="Remove item"
                  onClick={() =>
                    setItems((prev) => (prev.length === 1 ? [emptyItem()] : prev.filter((row) => row.id !== item.id)))
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid gap-2">
                <TextField
                  id={`${item.id}-name`}
                  label="Food"
                  value={item.name}
                  placeholder="Sweet potato chunks"
                  onChange={(e) => patchItem(item.id, { name: e.target.value })}
                />
                <TextField
                  id={`${item.id}-portion`}
                  label="Portion"
                  value={item.portion}
                  placeholder="~300g"
                  onChange={(e) => patchItem(item.id, { portion: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    id={`${item.id}-kcal`}
                    label="kcal"
                    min={0}
                    step={1}
                    value={item.calories}
                    onChange={(e) => patchItem(item.id, { calories: Number(e.target.value) })}
                  />
                  <NumberField
                    id={`${item.id}-p`}
                    label="Protein g"
                    min={0}
                    step={0.1}
                    value={item.protein}
                    onChange={(e) => patchItem(item.id, { protein: Number(e.target.value) })}
                  />
                  <NumberField
                    id={`${item.id}-c`}
                    label="Carbs g"
                    min={0}
                    step={0.1}
                    value={item.carbs}
                    onChange={(e) => patchItem(item.id, { carbs: Number(e.target.value) })}
                  />
                  <NumberField
                    id={`${item.id}-f`}
                    label="Fat g"
                    min={0}
                    step={0.1}
                    value={item.fat}
                    onChange={(e) => patchItem(item.id, { fat: Number(e.target.value) })}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <SecondaryButton onClick={() => setItems((prev) => [...prev, emptyItem()])}>
          <span className="inline-flex items-center justify-center gap-2">
            <Plus size={18} /> Add item
          </span>
        </SecondaryButton>

        <div className="rounded-3xl bg-forest text-paper px-4 py-4">
          <p className="text-xs uppercase tracking-wide text-paper/70">Meal total</p>
          <p className="font-display text-4xl">{round0(totals.calories)} kcal</p>
          <p className="mt-1 text-sm text-paper/80">
            P {round1(totals.protein)} · C {round1(totals.carbs)} · F {round1(totals.fat)}
          </p>
        </div>

        <PrimaryButton onClick={save} disabled={busy}>
          Save meal
        </PrimaryButton>
      </div>
    </Sheet>
  )
}

function guessMealType(): MealType {
  const hour = new Date().getHours()
  if (hour < 11) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 21) return 'dinner'
  return 'snacks'
}
