import { useI18n } from '../../shared/i18n/index.ts'
import { Segmented } from '../../shared/components/index.ts'
import { PRIORITIES, viewOf, type Priority } from './priorities.ts'
import './priorities.css'

type Props = { value: Priority | null; onChange: (priority: Priority | null) => void }

/** Optional: what matters most. It changes what opens first and what the tool says it cannot tell, never a score. */
export function PriorityPicker({ value, onChange }: Props) {
  const { t } = useI18n()
  return (
    <div className="priority">
      <p className="priority__label">{t('priority.label')}</p>
      <Segmented
        kind="radio"
        label={t('priority.label')}
        options={[{ id: 'none', label: t('priority.none') }, ...PRIORITIES.map((id) => ({ id, label: t(viewOf(id).label) }))]}
        value={value ?? 'none'}
        onChange={(id) => onChange(id === 'none' ? null : (id as Priority))}
      />
      {value && (
        <p className={`priority__note priority__note--${viewOf(value).coverage}`} role="note">
          {t(viewOf(value).note)}
        </p>
      )}
    </div>
  )
}
