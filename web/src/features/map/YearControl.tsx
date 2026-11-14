import { NDVI_FIRST_YEAR, NDVI_LAST_YEAR } from './gibs.ts'
import './map.css'

type Props = { year: number; onChange: (year: number) => void }

export function YearControl({ year, onChange }: Props) {
  return (
    <label className="year-control">
      <span>
        Year: <strong>{year}</strong>
      </span>
      <input
        type="range"
        min={NDVI_FIRST_YEAR}
        max={NDVI_LAST_YEAR}
        value={year}
        aria-valuetext={`Summer ${year}`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}
