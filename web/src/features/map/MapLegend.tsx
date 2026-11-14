import { NDVI_LEGEND_STOPS, NDVI_LEGEND_TICKS } from './gibs.ts'
import './map.css'

const GRADIENT = `linear-gradient(to right, ${NDVI_LEGEND_STOPS.join(', ')})`

/** What the colors of the map mean, and which image is being shown. */
export function MapLegend({ year }: { year: number }) {
  return (
    <figure className="legend">
      <p className="legend__meaning">
        Greener means more vegetation. Pale or brown means bare soil or sparse crops. The scale is NDVI, from 0 to 1.
      </p>
      <div className="legend__bar" style={{ backgroundImage: GRADIENT }} role="img" aria-label="NDVI color scale, from pale (0) to dark green (1)" />
      <div className="legend__ticks" aria-hidden="true">
        {NDVI_LEGEND_TICKS.map((tick) => (
          <span key={tick.value} style={{ left: `${tick.at * 100}%` }}>
            {tick.value}
          </span>
        ))}
      </div>
      <figcaption className="legend__caption">
        {year}: the NASA MODIS Terra 16-day composite that includes July 20, close to the peak of the growing season.
        Each pixel covers about 250 m. Source: NASA GIBS.
      </figcaption>
    </figure>
  )
}
