import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, formatLong, isToday } from '../lib/dates'

export function DateNav({
  date,
  onChange,
}: {
  date: string
  onChange: (next: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="tap grid size-11 place-items-center rounded-full bg-card text-forest shadow-sm"
        aria-label="Previous day"
        onClick={() => onChange(addDays(date, -1))}
      >
        <ChevronLeft size={20} />
      </button>
      <div className="min-w-0 flex-1 text-center">
        <p className="font-display text-lg leading-tight">{formatLong(date)}</p>
        <p className="text-xs text-ink-soft">{isToday(date) ? 'Today' : 'Logged day'}</p>
      </div>
      <button
        type="button"
        className="tap grid size-11 place-items-center rounded-full bg-card text-forest shadow-sm"
        aria-label="Next day"
        onClick={() => onChange(addDays(date, 1))}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
