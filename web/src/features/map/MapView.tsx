import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import type { CasePoint } from '../../shared/lib/data-types.ts'
import { BASES, type BaseId } from './basemaps.ts'
import { pointSummary, powerCell } from './cell.ts'
import { COUNTY_NAME, COUNTY_OUTLINE, REFERENCE_TOWNS, insideCounty } from './county.ts'
import { ndviTileUrl } from './gibs.ts'
import { describePlace, formatCoords, type Place } from './selection.ts'
import './map.css'

type Props = {
  points: CasePoint[]
  year: number
  compareYear: number | null
  base: BaseId
  showVegetation: boolean
  selected: Place | null
  onSelect: (place: Place | null) => void
}

const NDVI_OPTIONS = { maxNativeZoom: 9, maxZoom: 14 }

/** Satellite vegetation (NASA GIBS NDVI) over the case area, for one year, optionally next to another year. */
export function MapView({ points, year, compareYear, base, showVegetation, selected, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const background = useRef<L.TileLayer | null>(null)
  const towns = useRef<L.LayerGroup | null>(null)
  const ndvi = useRef<L.TileLayer | null>(null)
  const other = useRef<L.TileLayer | null>(null)
  const markers = useRef<{ point: CasePoint; marker: L.CircleMarker }[]>([])
  const ring = useRef<L.CircleMarker | null>(null)
  const pick = useRef(onSelect)
  pick.current = onSelect
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [split, setSplit] = useState(50)
  const [outside, setOutside] = useState(false)
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
      // Scrolling the page must not zoom the map by accident; the zoom buttons and a double click still work.
      scrollWheelZoom: false,
      minZoom: 8,
      // Keeps the view around the county, so nobody gets lost in the rest of the country.
      maxBounds: [
        [39.4, -90.4],
        [41.6, -87.4],
      ],
      // On a touch screen one finger scrolls the page; the map moves with two fingers or the zoom buttons.
      dragging: !L.Browser.mobile,
    }).setView([points[0].lat + 0.2, points[0].lon], 9)
    ndvi.current = L.tileLayer(ndviTileUrl(year), {
      ...NDVI_OPTIONS,
      opacity: showVegetation ? BASES[base].ndviOpacity : 0,
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
    L.geoJSON(COUNTY_OUTLINE, {
      style: { color: markerColor, weight: 2, fill: false },
      interactive: false,
      attribution: 'County: US Census Bureau',
    }).addTo(instance)
    const checkCenter = () => {
      const center = instance.getCenter()
      setOutside(!insideCounty(center.lat, center.lng))
    }
    instance.on('moveend', checkCenter)
    markers.current = points.map((point) => {
      const marker = L.circleMarker([point.lat, point.lon], { radius: 7, color: markerColor, weight: 2, fillOpacity: 0.3 })
        .bindTooltip(pointSummary(point, year), { permanent: true, direction: 'right' })
        .addTo(instance)
      marker.on('click', (event) => {
        L.DomEvent.stopPropagation(event)
        pick.current({ lat: point.lat, lon: point.lon })
      })
      return { point, marker }
    })
    ring.current = L.circleMarker([points[0].lat, points[0].lon], {
      radius: 14,
      color: markerColor,
      weight: 3,
      fill: false,
      interactive: false,
    })
    instance.on('click', (event: L.LeafletMouseEvent) => pick.current({ lat: event.latlng.lat, lon: event.latlng.lng }))
    instance.on('move zoomend resize', clip)
    map.current = instance
    return () => {
      instance.remove()
      map.current = null
      background.current = null
      ring.current = null
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
    other.current = L.tileLayer(ndviTileUrl(compareYear), { ...NDVI_OPTIONS, opacity: showVegetation ? BASES[base].ndviOpacity : 0 }).addTo(instance)
    clip()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareYear])

  useEffect(() => {
    const instance = map.current
    if (!instance) return
    const next = BASES[base]
    background.current?.remove()
    background.current = next.url
      ? L.tileLayer(next.url, { maxNativeZoom: next.maxNativeZoom, maxZoom: 14, attribution: next.attribution })
          .addTo(instance)
          .bringToBack()
      : null
    instance.getContainer().classList.toggle('map--simple', !next.url)
    towns.current?.remove()
    towns.current = null
    if (!next.url) {
      towns.current = L.layerGroup(
        REFERENCE_TOWNS.map((town) =>
          L.marker([town.lat, town.lon], {
            interactive: false,
            keyboard: false,
            icon: L.divIcon({ className: 'map-town', html: `<span>${town.name}</span>`, iconSize: [0, 0] }),
          }),
        ),
      ).addTo(instance)
    }
    const opacity = showVegetation ? next.ndviOpacity : 0
    ndvi.current?.setOpacity(opacity)
    other.current?.setOpacity(opacity)
    // The background effect runs after the map is created, and again each time the choice changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, points, showVegetation])

  useEffect(() => {
    const instance = map.current
    const marker = ring.current
    if (!instance || !marker) return
    if (selected) {
      marker.setLatLng([selected.lat, selected.lon]).addTo(instance)
      // A town or a located device may be off screen: bring it into view.
      if (!instance.getBounds().contains([selected.lat, selected.lon])) instance.panTo([selected.lat, selected.lon])
    }
    else marker.remove()
  }, [selected])

  useEffect(clip, [split])

  return (
    <>
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
      {outside && (
        <p className="map__outside" role="status">
          This view is outside {COUNTY_NAME}. TEA-8 has climate, soil and crop data only for {COUNTY_NAME}; elsewhere you see
          the map and the vegetation only.
        </p>
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
    {selected && (
      <PlaceCard place={selected} points={points} year={year} onClose={() => onSelect(null)} />
    )}
    </>
  )
}

function PlaceCard({ place, points, year, onClose }: { place: Place; points: CasePoint[]; year: number; onClose: () => void }) {
  const info = describePlace(place, points, year)
  return (
    <aside className="place-card" aria-label="About the chosen spot">
      <div className="place-card__head">
        <strong>{info.title}</strong>
        <button type="button" className="place-card__close" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>
      <p className="place-card__coords">{formatCoords(place)}</p>
      <ul>
        {info.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </aside>
  )
}
