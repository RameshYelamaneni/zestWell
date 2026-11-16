import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { TrackingBanner } from './components/TrackingBanner'
import { loadSession } from './lib/auth'
import { todayISO } from './lib/dates'
import { HealthPage } from './pages/HealthPage'
import { LoginPage } from './pages/LoginPage'
import { MealsPage } from './pages/MealsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SummariesPage } from './pages/SummariesPage'
import { TodayPage } from './pages/TodayPage'
import { WeightPage } from './pages/WeightPage'
import { StoreProvider } from './state/store'
import type { Tab } from './types'

export default function App() {
  const [authed, setAuthed] = useState(() => Boolean(loadSession()))

  if (!authed) {
    return <LoginPage onAuthed={() => setAuthed(true)} />
  }

  return (
    <StoreProvider>
      <Shell onSignedOut={() => setAuthed(false)} />
    </StoreProvider>
  )
}

function Shell({ onSignedOut }: { onSignedOut: () => void }) {
  const [tab, setTab] = useState<Tab>('today')
  const [date, setDate] = useState(todayISO)

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col">
      <header className="sticky top-0 z-20 space-y-2 border-b border-line bg-paper/95 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-2xl tracking-tight">zestWell</p>
          <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">Tracking</p>
        </div>
        <TrackingBanner />
      </header>
      <main className="flex-1 px-4 py-4">
        {tab === 'today' ? <TodayPage date={date} onDate={setDate} /> : null}
        {tab === 'meals' ? <MealsPage date={date} onDate={setDate} /> : null}
        {tab === 'weight' ? <WeightPage /> : null}
        {tab === 'health' ? <HealthPage /> : null}
        {tab === 'summaries' ? <SummariesPage /> : null}
        {tab === 'settings' ? <SettingsPage onSignedOut={onSignedOut} /> : null}
      </main>
      <BottomNav tab={tab} onTab={setTab} />
    </div>
  )
}
