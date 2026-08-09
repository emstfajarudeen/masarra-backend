import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function AdminFormPanel({
  title,
  body,
  children,
}: {
  title: string
  body: string
  children: ReactNode
}) {
  return (
    <section className="admin-form-panel">
      <div className="admin-form-panel-heading">
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <div className="admin-form-grid">{children}</div>
    </section>
  )
}

export function AdminField({
  label,
  error,
  help,
  children,
  wide = false,
}: {
  label: string
  error?: string
  help?: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div className={cn('admin-field', wide && 'is-wide')}>
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      {children}
      {help ? <p className="text-xs text-muted-foreground">{help}</p> : null}
      {error ? <p className="text-xs text-destructive font-medium">{error}</p> : null}
    </div>
  )
}

export function AdminFormNotice({
  title,
  body,
  tone = 'info',
}: {
  title: string
  body: string
  tone?: 'info' | 'warning'
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 is-wide',
        tone === 'warning'
          ? 'border-yellow-200 bg-yellow-50 text-yellow-900'
          : 'border-blue-200 bg-blue-50 text-blue-900'
      )}
    >
      <strong className="text-sm font-semibold">{title}</strong>
      <p className="text-sm mt-1">{body}</p>
    </div>
  )
}

export function AdminSegmentedChoice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string; caption: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="admin-choice-block">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={value === option.value ? 'default' : 'outline'}
            size="sm"
            className="flex flex-col h-auto py-2 px-3"
            onClick={() => onChange(option.value)}
          >
            <strong className="text-xs">{option.label}</strong>
            <small className="text-[10px] opacity-70">{option.caption}</small>
          </Button>
        ))}
      </div>
    </div>
  )
}

export function AdminFormActions({
  cancelHref,
  processing,
  submitLabel,
}: {
  cancelHref: string
  processing: boolean
  submitLabel: string
}) {
  return (
    <div className="admin-form-actions">
      <Button type="submit" disabled={processing}>
        {processing ? 'Saving…' : submitLabel}
      </Button>
      <Button variant="ghost" asChild>
        <a href={cancelHref}>Cancel</a>
      </Button>
    </div>
  )
}
