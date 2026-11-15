import { useState, type RefObject } from 'react'
import { useI18n } from '../../shared/i18n/index.ts'
import { linkFor } from './share.ts'

type Corner = { lat: number; lon: number }
type Props = { target: { place: Corner } | { zone: Corner[] }; report: RefObject<HTMLElement | null> }

/** Keep the evidence: a link that reopens the same place or field, and a printable report (or PDF). */
export function ReportActions({ target, report }: Props) {
  const { t } = useI18n()
  const [note, setNote] = useState('')

  async function copy() {
    const link = linkFor(target)
    try {
      await navigator.clipboard.writeText(link)
      setNote(t('report.copied'))
    } catch {
      setNote(t('report.copyFailed', { link }))
    }
  }

  function print() {
    const element = report.current
    if (!element) return
    element.classList.add('is-printing')
    const done = () => {
      element.classList.remove('is-printing')
      window.removeEventListener('afterprint', done)
    }
    window.addEventListener('afterprint', done)
    window.print()
  }

  return (
    <div className="report-actions">
      <button type="button" onClick={() => void copy()}>
        {t('report.copy')}
      </button>
      <button type="button" onClick={print}>
        {t('report.print')}
      </button>
      {note && (
        <p className="report-actions__note" role="status">
          {note}
        </p>
      )}
    </div>
  )
}
