import { COUNTY_NAME } from './county.ts'
import { NDVI_LEGEND_STOPS } from './gibs.ts'
import './map.css'

const GRADIENT = `linear-gradient(to right, ${NDVI_LEGEND_STOPS.join(', ')})`

/** What the colors of the map mean, and which image is being shown. */
export function MapLegend({ year }: { year: number }) {
  return (
    <figure className="legend">
      <div className="legend__row">
        <span>Fewer plants</span>
        <div className="legend__bar" style={{ backgroundImage: GRADIENT }} role="img" aria-label="NDVI color scale, from pale (0) to dark green (1)" />
        <span>More plants</span>
      </div>
      <p className="legend__key">
        <span className="legend__line" aria-hidden="true" /> {COUNTY_NAME}: the only area with project data
      </p>
      <figcaption className="legend__caption">
        <details>
          <summary>About this map</summary>
          <p>
            Green shows how much vegetation there was in mid-July (NASA satellite). The shaded area is {COUNTY_NAME}, the only area with project data. The weather figures cover about 50 km around it. Click the
            map to see what the data says about that spot.
          </p>
          <p>
            Vegetation index (NDVI, 0 to 1), {year}: the NASA MODIS Terra 16-day composite that includes July 20, close to the
            peak of the growing season. Each pixel covers about 250 m. Source: NASA GIBS.
          </p>
        </details>
      </figcaption>
    </figure>
  )
}
