import { useI18n } from '../../shared/i18n/index.ts'
import type { RotationSummary } from './compare.ts'
import { rotationName } from './labels.ts'
import './rotations.css'

type Props = { summaries: RotationSummary[]; selectedId: string; onSelect: (id: string) => void }

/** The rotations as one choice, each named by its crops. No score and no "best" marker. */
export function RotationPicker({ summaries, selectedId, onSelect }: Props) {
  const { t } = useI18n()
  return (
    <div className="picker" role="radiogroup" aria-label={t('picker.label')}>
      {summaries.map((summary) => (
        <button
          key={summary.id}
          type="button"
          role="radio"
          aria-checked={summary.id === selectedId}
          className="picker__option"
          onClick={() => onSelect(summary.id)}
        >
          <strong>{rotationName(t, summary)}</strong>
          <span>{t(summary.isCurrent ? 'picker.current' : 'picker.hypothetical')}</span>
        </button>
      ))}
    </div>
  )
}
