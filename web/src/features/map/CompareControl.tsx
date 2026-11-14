import { NDVI_FIRST_YEAR, NDVI_LAST_YEAR } from './gibs.ts'
import './map.css'

type Props = { year: number; compareYear: number | null; onChange: (year: number | null) => void }

const YEARS = Array.from({ length: NDVI_LAST_YEAR - NDVI_FIRST_YEAR + 1 }, (_, i) => NDVI_LAST_YEAR - i)

/** Picks a second year to show next to the chosen one on the map. */
export function CompareControl({ year, compareYear, onChange }: Props) {
  return (
    <label className="map-compare">
      Compare the map with
      <select
        value={compareYear ?? ''}
        onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value))}
      >
        <option value="">no other year</option>
        {YEARS.filter((y) => y !== year).map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  )
}
