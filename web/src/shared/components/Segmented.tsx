import type { CSSProperties, KeyboardEvent } from 'react'
import './segmented.css'

export type SegmentOption = { id: string; label: string }

type Props = {
  options: SegmentOption[]
  value: string
  onChange: (id: string) => void
  /** `tab` for tabs, `radio` for a single choice among options. */
  kind: 'tab' | 'radio'
  label: string
  /** Optional id for each segment button and the panel that it controls (tabs only). */
  idFor?: (id: string) => string
  controls?: string
}

/** A row of equal segments with one selected. The selected highlight slides to the new segment. */
export function Segmented({ options, value, onChange, kind, label, idFor, controls }: Props) {
  const index = Math.max(0, options.findIndex((option) => option.id === value))

  function onKey(event: KeyboardEvent, at: number) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (step === 0) return
    event.preventDefault()
    const next = options[(at + step + options.length) % options.length]
    onChange(next.id)
    document.getElementById(idFor?.(next.id) ?? `seg-${label}-${next.id}`)?.focus()
  }

  return (
    <div
      className={kind === 'tab' ? 'seg seg--tabs' : 'seg seg--chips'}
      role={kind === 'tab' ? 'tablist' : 'radiogroup'}
      aria-label={label}
      style={{ '--n': options.length, '--i': index } as CSSProperties}
    >
      <span className="seg__thumb" aria-hidden="true" />
      {options.map((option, at) => {
        const selected = option.id === value
        return (
          <button
            key={option.id}
            id={idFor?.(option.id) ?? `seg-${label}-${option.id}`}
            type="button"
            role={kind === 'tab' ? 'tab' : 'radio'}
            {...(kind === 'tab' ? { 'aria-selected': selected, 'aria-controls': controls } : { 'aria-checked': selected })}
            tabIndex={selected ? 0 : -1}
            className="seg__item"
            onClick={() => onChange(option.id)}
            onKeyDown={(event) => onKey(event, at)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
