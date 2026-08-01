import type { ReactNode } from 'react'

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
    <label className={`admin-field ${wide ? 'is-wide' : ''}`}>
      <span>{label}</span>
      {children}
      {help ? <em>{help}</em> : null}
      {error ? <small>{error}</small> : null}
    </label>
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
    <div className={`admin-form-notice admin-form-notice-${tone}`}>
      <strong>{title}</strong>
      <p>{body}</p>
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
      <span>{label}</span>
      <div className="admin-segmented">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={value === option.value ? 'is-selected' : ''}
            onClick={() => onChange(option.value)}
          >
            <strong>{option.label}</strong>
            <small>{option.caption}</small>
          </button>
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
      <a href={cancelHref}>Cancel</a>
      <button type="submit" disabled={processing}>
        {processing ? 'Saving…' : submitLabel}
      </button>
    </div>
  )
}

export function AdminMediaPlaceholder({
  mode,
  mediaUrl,
}: {
  mode: 'image' | 'video' | 'audio'
  mediaUrl: string
}) {
  return (
    <div className="admin-media-placeholder">
      <div className="admin-media-icon">
        {mode === 'image' ? '🖼️' : mode === 'video' ? '▶️' : '🎧'}
      </div>
      <div>
        <strong>{mediaUrl ? 'Media URL attached' : `No ${mode} file attached yet`}</strong>
        <p>
          {mediaUrl
            ? mediaUrl
            : 'Upload a local media file. The saved question will keep a storage-neutral media asset reference.'}
        </p>
      </div>
    </div>
  )
}
