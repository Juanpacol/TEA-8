import { NDVI_LEGEND_STOPS } from './gibs.ts'
import './map.css'

const GRADIENT = `linear-gradient(to right, ${NDVI_LEGEND_STOPS.join(', ')})`

/** What the colors of the map mean, and which image is being shown. */
export function MapLegend({ year }: { year: number }) {
  return (
    <figure className="legend">
      <div className="legend__row">
        <span>Bare or sparse</span>
        <div className="legend__bar" style={{ backgroundImage: GRADIENT }} role="img" aria-label="NDVI color scale, from pale (0) to dark green (1)" />
        <span>Dense green</span>
      </div>
      <figcaption className="legend__caption">
        <details>
          <summary>About this image</summary>
          Vegetation index (NDVI, 0 to 1), {year}: the NASA MODIS Terra 16-day composite that includes July 20, close to
          the peak of the growing season. Each pixel covers about 250 m. Source: NASA GIBS.
        </details>
      </figcaption>
    </figure>
  )
}
