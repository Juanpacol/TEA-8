import { useI18n } from '../../shared/i18n/index.ts'
import { Segmented } from '../../shared/components/index.ts'
import { BASES, BASE_ORDER, type BaseId } from './basemaps.ts'
import './map.css'

type Props = {
  value: BaseId
  onChange: (id: BaseId) => void
  showVegetation: boolean
  onShowVegetation: (show: boolean) => void
}

/** Chooses what the vegetation colors sit on: roads and names, an aerial photo, or nothing else. */
export function BaseControl({ value, onChange, showVegetation, onShowVegetation }: Props) {
  const { t } = useI18n()
  return (
    <div className="base-control">
      <Segmented
        kind="radio"
        label={t('base.label')}
        options={BASE_ORDER.map((id) => ({ id, label: t(BASES[id].label) }))}
        value={value}
        onChange={(id) => onChange(id as BaseId)}
      />
      <label className="base-control__toggle">
        <input type="checkbox" checked={showVegetation} onChange={(event) => onShowVegetation(event.target.checked)} />
        {t('base.showVegetation')}
      </label>
    </div>
  )
}
