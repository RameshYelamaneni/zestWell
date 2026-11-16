import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
      {children}
    </label>
  )
}

const inputClass =
  'tap w-full rounded-2xl border border-line bg-card px-3 text-base text-ink outline-none ring-forest/30 placeholder:text-ink-soft/70 focus:border-forest focus:ring-2'

export function TextField(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, id, className, ...rest } = props
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input id={id} className={inputClass} {...rest} />
    </div>
  )
}

export function NumberField(
  props: InputHTMLAttributes<HTMLInputElement> & { label: string },
) {
  const { label, id, className, ...rest } = props
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input id={id} type="number" inputMode="decimal" className={inputClass} {...rest} />
    </div>
  )
}

export function SelectField(props: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const { label, id, className, children, ...rest } = props
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select id={id} className={`${inputClass} appearance-none`} {...rest}>
        {children}
      </select>
    </div>
  )
}

export function AreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const { label, id, className, ...rest } = props
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <textarea id={id} className={`${inputClass} min-h-24 py-3`} {...rest} />
    </div>
  )
}

export function PrimaryButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`tap w-full rounded-2xl bg-forest px-4 py-3 text-base font-semibold text-paper shadow-sm disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`tap w-full rounded-2xl border border-line bg-card px-4 py-3 text-base font-semibold text-ink disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
