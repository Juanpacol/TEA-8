import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import type { CasePoint } from '../../shared/lib/data-types.ts'
import { BASE_TILE_URL, ndviTileUrl } from './gibs.ts'
import './map.css'

type Props = { points: CasePoint[]; year: number }

/** Satellite vegetation (NASA GIBS NDVI) over the case area, for one year. */
export function MapView({ points, year }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const ndvi = useRef<L.TileLayer | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')

  useEffect(() => {
    if (!container.current) return
    const instance = L.map(container.current, { zoomControl: true }).setView(
      [points[0].lat + 0.2, points[0].lon],
      9,
    )
    L.tileLayer(BASE_TILE_URL, {
      maxNativeZoom: 8,
      maxZoom: 12,
      attribution: 'Imagery: NASA GIBS (Blue Marble)',
    }).addTo(instance)
    ndvi.current = L.tileLayer(ndviTileUrl(year), {
      maxNativeZoom: 9,
      maxZoom: 12,
      opacity: 0.85,
      attribution: 'NDVI: NASA GIBS, MODIS Terra 16-day',
    }).addTo(instance)
    ndvi.current.on('loading', () => setStatus('loading'))
    ndvi.current.on('load', () => setStatus((current) => (current === 'failed' ? current : 'ready')))
    ndvi.current.on('tileerror', () => setStatus('failed'))
    const markerColor = getComputedStyle(document.documentElement).getPropertyValue('--ochre').trim() || 'currentColor'
    for (const point of points) {
      L.circleMarker([point.lat, point.lon], { radius: 7, color: markerColor, weight: 2, fillOpacity: 0.3 })
        .bindTooltip(point.label, { permanent: true, direction: 'right' })
        .addTo(instance)
    }
    map.current = instance
    return () => {
      instance.remove()
      map.current = null
      ndvi.current = null
    }
    // The map is created once; the year effect below updates the layer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points])

  useEffect(() => {
    setStatus('loading')
    ndvi.current?.setUrl(ndviTileUrl(year))
  }, [year])

  return (
    <div className="map-frame">
      <div ref={container} className="map" role="img" aria-label={`NDVI vegetation map for ${year}`} />
      {status === 'loading' && (
        <p className="map__status" role="status">
          Loading NASA imagery for {year}…
        </p>
      )}
      {status === 'failed' && (
        <p className="map__status map__status--failed" role="status">
          Some NASA imagery for {year} could not be loaded. The rest of the tool still works.
        </p>
      )}
    </div>
  )
}
