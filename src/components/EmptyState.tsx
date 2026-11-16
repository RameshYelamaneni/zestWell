import type { ReactNode } from 'react'

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-card/60 px-4 py-8 text-center">
      <p className="font-display text-xl text-ink">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
