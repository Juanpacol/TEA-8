import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { PlaceEvidence, ZoneEvidence } from '../../shared/lib/placeApi.ts'
import { useI18n } from '../../shared/i18n/index.ts'
import { Report } from './Report.tsx'
import { linkFor } from './share.ts'

type Corner = { lat: number; lon: number }
type Props = { target: { place: Corner } | { zone: Corner[] }; evidence: PlaceEvidence | ZoneEvidence }

/** Keep the evidence: a link that reopens the same place or field, and a printable report (or PDF) in English. */
export function ReportActions({ target, evidence }: Props) {
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
    document.body.classList.add('is-printing-report')
    const done = () => {
      document.body.classList.remove('is-printing-report')
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
      {createPortal(<Report target={target} evidence={evidence} />, document.body)}
      {note && (
        <p className="report-actions__note" role="status">
          {note}
        </p>
      )}
    </div>
  )
}
