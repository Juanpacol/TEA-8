import { useState } from 'react'
import { useI18n } from '../../shared/i18n/index.ts'
import { insideUS, parseCoords } from './coords.ts'
import type { Place } from './selection.ts'
import './map.css'

type Props = { towns: { name: string; lat: number; lon: number }[]; onSelect: (place: Place) => void }

/** Three ways to say where you are without reading a map: the closest town, the device location or pasted coordinates. */
export function WhereAmI({ towns, onSelect }: Props) {
  const { t } = useI18n()
  const [note, setNote] = useState('')
  const [coords, setCoords] = useState('')

  function goToCoords() {
    const place = parseCoords(coords)
    if (!place) return setNote(t('where.coordsBad'))
    if (!insideUS(place)) return setNote(t('where.coordsOutside'))
    setNote('')
    onSelect(place)
  }

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setNote(t('where.noGeo'))
      return
    }
    setNote(t('where.searching'))
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNote('')
        onSelect({ lat: position.coords.latitude, lon: position.coords.longitude })
      },
      () => setNote(t('where.failed')),
      { timeout: 10000 },
    )
  }

  return (
    <div className="where">
      <label className="where__town">
        {t('where.town')}
        <select
          value=""
          onChange={(event) => {
            const town = towns.find((entry) => entry.name === event.target.value)
            if (town) onSelect({ lat: town.lat, lon: town.lon })
          }}
        >
          <option value="">{t('where.choose')}</option>
          {towns.map((town) => (
            <option key={town.name} value={town.name}>
              {town.name}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="where__locate" onClick={useMyLocation}>
        {t('where.locate')}
      </button>
      <form
        className="where__coords"
        onSubmit={(event) => {
          event.preventDefault()
          goToCoords()
        }}
      >
        <label>
          {t('where.coords')}
          <input
            type="text"
            value={coords}
            onChange={(event) => setCoords(event.target.value)}
            placeholder={t('where.coordsHint')}
            autoComplete="off"
          />
        </label>
        <button type="submit" className="where__locate">
          {t('where.go')}
        </button>
      </form>
      {note && (
        <p className="where__note" role="status">
          {note}
        </p>
      )}
    </div>
  )
}
