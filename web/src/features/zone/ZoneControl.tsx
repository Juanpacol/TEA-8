import { useState } from 'react'
import { useI18n } from '../../shared/i18n/index.ts'
import { M2_PER_ACRE, M2_PER_HECTARE, areaM2, parseZoneFile, type Corner } from './zone.ts'
import './zone.css'

type Props = {
  corners: Corner[]
  drawing: boolean
  onStart: () => void
  onFinish: () => void
  onUndo: () => void
  onClear: () => void
  onLoad: (corners: Corner[]) => void
}

const MAX_FILE_BYTES = 2_000_000

/** Draw a field corner by corner on the map, or load its outline from a KML or GeoJSON file. */
export function ZoneControl({ corners, drawing, onStart, onFinish, onUndo, onClear, onLoad }: Props) {
  const { t, lang } = useI18n()
  const [note, setNote] = useState('')
  const area = areaM2(corners)
  const format = (value: number) => value.toLocaleString(lang, { maximumFractionDigits: value < 10 ? 1 : 0 })

  async function load(file: File | undefined) {
    if (!file) return
    if (file.size > MAX_FILE_BYTES) return setNote(t('zone.fileTooBig'))
    const read = parseZoneFile(file.name, await file.text())
    if (!read) return setNote(t('zone.fileBad'))
    setNote('')
    onLoad(read)
  }

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
        <label className="zone__file">
          {t('zone.file')}
          <input
            type="file"
            accept=".kml,.geojson,.json,application/vnd.google-earth.kml+xml,application/geo+json,application/json"
            onChange={(event) => {
              void load(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </label>
      </div>
      <p className="zone__note" role="status">
        {drawing
          ? t(corners.length < 3 ? 'zone.hintStart' : 'zone.hintMore', { n: corners.length })
          : corners.length >= 3
            ? t('zone.area', { acres: format(area / M2_PER_ACRE), hectares: format(area / M2_PER_HECTARE), n: corners.length })
            : note}
      </p>
      {note && (drawing || corners.length >= 3) && <p className="zone__note">{note}</p>}
    </div>
  )
}
