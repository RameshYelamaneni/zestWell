import { useRef, useState } from 'react'
import { PrimaryButton, SecondaryButton, TextField } from '../components/Fields'
import { signOut } from '../lib/auth'
import { heightCm } from '../lib/bmi'
import { buildExport } from '../lib/storage'
import { useStore } from '../state/store'

export function SettingsPage({ onSignedOut }: { onSignedOut: () => void }) {
  const { data, updateProfile, setOpenaiKey, importJson } = useStore()
  const { profile } = data
  const [key, setKey] = useState(data.settings.openaiKey)
  const [keySaved, setKeySaved] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importOk, setImportOk] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const cm = heightCm(profile.heightFeet, profile.heightInches)

  function saveKey() {
    setOpenaiKey(key.trim())
    setKeySaved(true)
    window.setTimeout(() => setKeySaved(false), 1600)
  }

  function exportJson() {
    const payload = buildExport(data)
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zestwell-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function onImport(file: File | undefined) {
    setImportError(null)
    setImportOk(false)
    if (!file) return
    try {
      const text = await file.text()
      importJson(text)
      setImportOk(true)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Could not import that file.')
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">Everything stays on this device.</p>
      </header>

      <section className="space-y-3 rounded-3xl bg-card p-4 shadow-sm">
        <h2 className="font-display text-xl">OpenAI</h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          Optional. Used only when you scan a meal photo. The key is stored locally and sent to OpenAI
          with the photo. Meal photos are never uploaded anywhere else.
        </p>
        <TextField
          id="openai-key"
          label="API key"
          type="password"
          autoComplete="off"
          value={key}
          placeholder="sk-…"
          onChange={(e) => setKey(e.target.value)}
        />
        <PrimaryButton onClick={saveKey}>{keySaved ? 'Saved' : 'Save key'}</PrimaryButton>
      </section>

      <section className="space-y-3 rounded-3xl bg-card p-4 shadow-sm">
        <h2 className="font-display text-xl">Profile</h2>
        <TextField
          id="profile-name"
          label="Name"
          value={profile.name}
          onChange={(e) => updateProfile({ name: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-2">
          <TextField
            id="age"
            label="Age"
            type="number"
            min={1}
            value={profile.age}
            onChange={(e) => updateProfile({ age: Number(e.target.value) || 0 })}
          />
          <TextField
            id="ft"
            label="Height ft"
            type="number"
            min={0}
            value={profile.heightFeet}
            onChange={(e) => updateProfile({ heightFeet: Number(e.target.value) || 0 })}
          />
          <TextField
            id="in"
            label="Height in"
            type="number"
            min={0}
            max={11}
            value={profile.heightInches}
            onChange={(e) => updateProfile({ heightInches: Number(e.target.value) || 0 })}
          />
        </div>
        <p className="text-sm text-ink-soft">
          {cm} cm · used for BMI. Sex recorded as {profile.sex}.
        </p>
        <TextField
          id="target-kg"
          label="Recorded target weight (kg)"
          type="number"
          min={0}
          step={0.1}
          value={profile.targetWeightKg}
          onChange={(e) => updateProfile({ targetWeightKg: Number(e.target.value) || 0 })}
        />
        <p className="text-xs text-ink-soft">{profile.targetNote}</p>
      </section>

      <section className="space-y-3 rounded-3xl bg-card p-4 shadow-sm">
        <h2 className="font-display text-xl">Backup</h2>
        <p className="text-sm text-ink-soft">
          Export meals, WHOOP, weight, labs, and profile. The OpenAI key and PIN are not included.
        </p>
        <PrimaryButton onClick={exportJson}>Export JSON</PrimaryButton>
        <SecondaryButton onClick={() => fileRef.current?.click()}>Import JSON</SecondaryButton>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => void onImport(e.target.files?.[0])}
        />
        {importOk ? <p className="text-sm text-forest">Import saved.</p> : null}
        {importError ? <p className="text-sm text-danger">{importError}</p> : null}
      </section>

      <section className="space-y-2 rounded-3xl bg-card p-4 shadow-sm">
        <h2 className="font-display text-xl">iPhone home screen</h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          In Safari, tap Share, then Add to Home Screen. zestWell installs as a PWA — no App Store listing.
        </p>
      </section>

      <SecondaryButton
        onClick={() => {
          signOut()
          onSignedOut()
        }}
      >
        Sign out
      </SecondaryButton>
    </div>
  )
}
