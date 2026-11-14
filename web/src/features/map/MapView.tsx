import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import type { CasePoint } from '../../shared/lib/data-types.ts'
import { pointSummary, powerCell } from './cell.ts'
import { BASE_TILE_URL, ndviTileUrl } from './gibs.ts'
import './map.css'

type Props = { points: CasePoint[]; year: number; compareYear: number | null }

const NDVI_OPTIONS = { maxNativeZoom: 9, maxZoom: 12, opacity: 0.85 }

/** Satellite vegetation (NASA GIBS NDVI) over the case area, for one year, optionally next to another year. */
export function MapView({ points, year, compareYear }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const ndvi = useRef<L.TileLayer | null>(null)
  const other = useRef<L.TileLayer | null>(null)
  const markers = useRef<{ point: CasePoint; marker: L.CircleMarker }[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [split, setSplit] = useState(50)
  const splitNow = useRef(split)
  splitNow.current = split

  /** Shows the other year only to the right of the divider. Layer panes move with the map, so the cut is recomputed. */
  function clip() {
    const instance = map.current
    const tiles = other.current?.getContainer()
    if (!instance || !tiles) return
    const size = instance.getSize()
    const topLeft = instance.containerPointToLayerPoint([(size.x * splitNow.current) / 100, 0])
    const bottomRight = instance.containerPointToLayerPoint([size.x, size.y])
    tiles.style.clip = `rect(${topLeft.y}px, ${bottomRight.x}px, ${bottomRight.y}px, ${topLeft.x}px)`
  }

  useEffect(() => {
    if (!container.current) return
    const instance = L.map(container.current, {
      zoomControl: true,
      // On a touch screen one finger scrolls the page; the map moves with two fingers or the zoom buttons.
      dragging: !L.Browser.mobile,
    }).setView([points[0].lat + 0.2, points[0].lon], 9)
    L.tileLayer(BASE_TILE_URL, {
      maxNativeZoom: 8,
      maxZoom: 12,
      attribution: 'Imagery: NASA GIBS (Blue Marble)',
    }).addTo(instance)
    ndvi.current = L.tileLayer(ndviTileUrl(year), {
      ...NDVI_OPTIONS,
      attribution: 'NDVI: NASA GIBS, MODIS Terra 16-day',
    }).addTo(instance)
    ndvi.current.on('loading', () => setStatus('loading'))
    ndvi.current.on('load', () => setStatus((current) => (current === 'failed' ? current : 'ready')))
    ndvi.current.on('tileerror', () => setStatus('failed'))

    const styles = getComputedStyle(document.documentElement)
    const markerColor = styles.getPropertyValue('--ochre').trim() || 'currentColor'
    const cell = powerCell(points[0].lat, points[0].lon)
    L.rectangle(
      [
        [cell.south, cell.west],
        [cell.north, cell.east],
      ],
      { color: markerColor, weight: 2, dashArray: '6 6', fill: false, interactive: false },
    ).addTo(instance)
    markers.current = points.map((point) => ({
      point,
      marker: L.circleMarker([point.lat, point.lon], { radius: 7, color: markerColor, weight: 2, fillOpacity: 0.3 })
        .bindTooltip(pointSummary(point, year), { permanent: true, direction: 'right' })
        .addTo(instance),
    }))
    instance.on('move zoomend resize', clip)
    map.current = instance
    return () => {
      instance.remove()
      map.current = null
      ndvi.current = null
      other.current = null
      markers.current = []
    }
    // The map is created once; the effects below update its layers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points])

  useEffect(() => {
    setStatus('loading')
    ndvi.current?.setUrl(ndviTileUrl(year))
    for (const { point, marker } of markers.current) marker.setTooltipContent(pointSummary(point, year))
  }, [year])

  useEffect(() => {
    const instance = map.current
    if (!instance) return
    other.current?.remove()
    other.current = null
    if (compareYear === null) return
    other.current = L.tileLayer(ndviTileUrl(compareYear), NDVI_OPTIONS).addTo(instance)
    clip()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareYear])

  useEffect(clip, [split])

  return (
    <div className="map-frame">
      <div
        ref={container}
        className="map"
        role="img"
        aria-label={
          compareYear === null
            ? `NDVI vegetation map for ${year}`
            : `NDVI vegetation map: ${year} on the left, ${compareYear} on the right`
        }
      />
      {compareYear !== null && (
        <>
          <span className="map__divider" style={{ left: `${split}%` }} aria-hidden="true" />
          <span className="map__year map__year--left">{year}</span>
          <span className="map__year map__year--right">{compareYear}</span>
          <input
            className="map__split"
            type="range"
            min={5}
            max={95}
            value={split}
            aria-label={`Divider between ${year} and ${compareYear}`}
            onChange={(event) => setSplit(Number(event.target.value))}
          />
        </>
      )}
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
