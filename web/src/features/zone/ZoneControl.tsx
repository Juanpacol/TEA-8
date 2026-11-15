import { useI18n } from '../../shared/i18n/index.ts'
import { M2_PER_ACRE, M2_PER_HECTARE, areaM2, type Corner } from './zone.ts'
import './zone.css'

type Props = {
  corners: Corner[]
  drawing: boolean
  onStart: () => void
  onFinish: () => void
  onUndo: () => void
  onClear: () => void
}

/** Draw a field corner by corner on the map. */
export function ZoneControl({ corners, drawing, onStart, onFinish, onUndo, onClear }: Props) {
  const { t, lang } = useI18n()
  const area = areaM2(corners)
  const format = (value: number) => value.toLocaleString(lang, { maximumFractionDigits: value < 10 ? 1 : 0 })

  return (
    <div className="zone">
      <div className="zone__buttons">
        {!drawing && (
          <button type="button" className="zone__main" onClick={onStart}>
            {t(corners.length ? 'zone.redraw' : 'zone.draw')}
          </button>
        )}
        {drawing && (
          <button type="button" className="zone__main" onClick={onFinish} disabled={corners.length < 3}>
            {t('zone.finish')}
          </button>
        )}
        {drawing && corners.length > 0 && (
          <button type="button" onClick={onUndo}>
            {t('zone.undo')}
          </button>
        )}
        {corners.length > 0 && (
          <button type="button" onClick={onClear}>
            {t('zone.clear')}
          </button>
        )}
      </div>
      <p className="zone__note" role="status">
        {drawing
          ? t(corners.length < 3 ? 'zone.hintStart' : 'zone.hintMore', { n: corners.length })
          : corners.length >= 3
            ? t('zone.area', { acres: format(area / M2_PER_ACRE), hectares: format(area / M2_PER_HECTARE), n: corners.length })
            : ''}
      </p>
    </div>
  )
}
