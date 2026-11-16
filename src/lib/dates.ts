export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function addDays(iso: string, n: number): string {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export function formatLong(iso: string): string {
  return parseISODate(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatShort(iso: string): string {
  return parseISODate(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatWeekday(iso: string): string {
  return parseISODate(iso).toLocaleDateString('en-GB', { weekday: 'short' })
}

export function isToday(iso: string): boolean {
  return iso === todayISO()
}

export function startOfWeekSunday(iso: string): string {
  const d = parseISODate(iso)
  d.setDate(d.getDate() - d.getDay())
  return toISODate(d)
}

export function endOfWeekSaturday(iso: string): string {
  return addDays(startOfWeekSunday(iso), 6)
}

export function startOfMonth(iso: string): string {
  const d = parseISODate(iso)
  d.setDate(1)
  return toISODate(d)
}

export function endOfMonth(iso: string): string {
  const d = parseISODate(iso)
  d.setMonth(d.getMonth() + 1, 0)
  return toISODate(d)
}

export function monthLabel(iso: string): string {
  return parseISODate(iso).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

export function inRange(iso: string, start: string, end: string): boolean {
  return iso >= start && iso <= end
}

export function shiftMonth(iso: string, delta: number): string {
  const d = parseISODate(iso)
  d.setDate(1)
  d.setMonth(d.getMonth() + delta)
  return toISODate(d)
}
