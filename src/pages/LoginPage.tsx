import { useState } from 'react'
import { TrackingBanner } from '../components/TrackingBanner'
import { PrimaryButton, TextField } from '../components/Fields'
import { createAccount, loadAuth, verifyPin } from '../lib/auth'

export function LoginPage({ onAuthed }: { onAuthed: () => void }) {
  const existing = loadAuth()
  const [username, setUsername] = useState(existing?.username ?? 'Ramesh')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const isNew = !existing

  async function submit() {
    setError(null)
    if (pin.trim().length < 4) {
      setError('Use at least 4 characters for your PIN or password.')
      return
    }
    setBusy(true)
    try {
      if (isNew) {
        if (!username.trim()) {
          setError('Enter a name or username.')
          setBusy(false)
          return
        }
        await createAccount(username, pin)
        onAuthed()
        return
      }
      const ok = await verifyPin(pin)
      if (!ok) {
        setError('That PIN does not match.')
        return
      }
      onAuthed()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-5 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest">Personal tracking</p>
      <h1 className="mt-2 font-display text-5xl tracking-tight">zestWell</h1>
      <p className="mt-3 text-ink-soft">
        Meals, WHOOP, weight, and labs on this device. No calorie deficit, diet plan, or exercise plan.
      </p>
      <div className="mt-5">
        <TrackingBanner />
      </div>

      <form
        className="mt-8 space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        {isNew ? (
          <TextField
            id="username"
            label="Name"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        ) : (
          <p className="text-sm text-ink-soft">
            Welcome back, <span className="font-semibold text-ink">{existing.username}</span>.
          </p>
        )}
        <TextField
          id="pin"
          label={isNew ? 'PIN or password' : 'PIN'}
          type="password"
          autoComplete={isNew ? 'new-password' : 'current-password'}
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <PrimaryButton type="submit" disabled={busy}>
          {isNew ? 'Create lock' : 'Unlock'}
        </PrimaryButton>
        <p className="text-center text-xs leading-relaxed text-ink-soft">
          Stored only on this phone. zestWell has no account server.
        </p>
      </form>
    </div>
  )
}
