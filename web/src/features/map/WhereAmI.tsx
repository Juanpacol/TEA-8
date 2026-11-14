import { useState } from 'react'
import { REFERENCE_TOWNS } from './county.ts'
import type { Place } from './selection.ts'
import './map.css'

type Props = { onSelect: (place: Place) => void }

/** Two ways to say where you are without reading a map: the closest town, or the device location. */
export function WhereAmI({ onSelect }: Props) {
  const [note, setNote] = useState('')

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setNote('This browser cannot share your location. Pick the closest town instead.')
      return
    }
    setNote('Looking for your location...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNote('')
        onSelect({ lat: position.coords.latitude, lon: position.coords.longitude })
      },
      () => setNote('We could not get your location. Pick the closest town instead.'),
      { timeout: 10000 },
    )
  }

  return (
    <div className="where">
      <label className="where__town">
        Closest town
        <select
          value=""
          onChange={(event) => {
            const town = REFERENCE_TOWNS.find((entry) => entry.name === event.target.value)
            if (town) onSelect({ lat: town.lat, lon: town.lon })
          }}
        >
          <option value="">Choose...</option>
          {REFERENCE_TOWNS.map((town) => (
            <option key={town.name} value={town.name}>
              {town.name}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="where__locate" onClick={useMyLocation}>
        Use my location
      </button>
      {note && (
        <p className="where__note" role="status">
          {note}
        </p>
      )}
    </div>
  )
}
