import {
  CalendarRange,
  ClipboardList,
  Home,
  Scale,
  Settings,
  UtensilsCrossed,
} from 'lucide-react'
import type { Tab } from '../types'

const ITEMS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
  { id: 'weight', label: 'Weight', icon: Scale },
  { id: 'health', label: 'Results', icon: ClipboardList },
  { id: 'summaries', label: 'Summary', icon: CalendarRange },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function BottomNav({ tab, onTab }: { tab: Tab; onTab: (tab: Tab) => void }) {
  return (
    <nav className="safe-bottom sticky bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur">
      <ul className="grid grid-cols-6">
        {ITEMS.map((item) => {
          const Icon = item.icon
          const active = tab === item.id
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onTab(item.id)}
                className={`flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] leading-none ${
                  active ? 'text-forest' : 'text-ink-soft'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                <span className="mt-1 font-semibold tracking-tight">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
