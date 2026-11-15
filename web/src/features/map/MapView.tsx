import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../shared/i18n/index.ts'
import type { CasePoint } from '../../shared/lib/data-types.ts'
import { BASES, type BaseId } from './basemaps.ts'
import { pointLabel } from './cell.ts'
import { colorOf, familiesOf, loadSoilZones, soilFamily } from './soil-zones.ts'
import { COUNTY_OUTLINE, insideCounty } from './county.ts'
import { ndviTileUrl } from './gibs.ts'
import { describePlace, formatCoords, pointAt, type Place } from './selection.ts'
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
/** On a wide screen the soil key starts open; on a phone it starts closed so it does not cover the map. */
const WIDE = window.matchMedia('(min-width: 861px)')
const MAX_SOIL_COLORS = 6
const OTHER_SOIL = '#8a97b4'
/** From this zoom on the point labels stay on screen. */
const LABEL_ZOOM = 11

/** Satellite vegetation (NASA GIBS NDVI) over the case area, for one year, optionally next to another year. */
export function MapView({ points, year, compareYear, base, showVegetation, selected, onSelect }: Props) {
  const { t } = useI18n()
  const tRef = useRef(t)
  tRef.current = t
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const background = useRef<L.TileLayer | null>(null)
  const ndvi = useRef<L.TileLayer | null>(null)
  const other = useRef<L.TileLayer | null>(null)
  const markers = useRef<{ point: CasePoint; marker: L.CircleMarker }[]>([])
  const ring = useRef<L.CircleMarker | null>(null)
  const zones = useRef<L.FeatureGroup | null>(null)
  const countyBounds = useRef<L.LatLngBounds | null>(null)
  const pick = useRef(onSelect)
  pick.current = onSelect
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [split, setSplit] = useState(50)
  const [outside, setOutside] = useState(false)
  const [soils, setSoils] = useState<{ own: string; legend: { family: string; color: string; count: number }[] } | null>(null)
  const splitNow = useRef(split)
  splitNow.current = split
  const yearNow = useRef(year)
  yearNow.current = year

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
      zoomSnap: 0.25,
      minZoom: 8,
      // Keeps the view around the county (its outline plus a margin), so nobody gets lost in the rest of the country.
      maxBounds: L.geoJSON(COUNTY_OUTLINE).getBounds().pad(1.5),
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
    const county = L.geoJSON(COUNTY_OUTLINE, {
      style: { color: markerColor, weight: 3, fillColor: markerColor, fillOpacity: 0.12 },
      interactive: false,
      attribution: 'County: US Census Bureau',
    }).addTo(instance)
    // Show the whole county, with room around it.
    countyBounds.current = county.getBounds()
    instance.fitBounds(countyBounds.current, { padding: [30, 30] })
    const checkCenter = () => {
      const center = instance.getCenter()
      setOutside(!insideCounty(center.lat, center.lng))
    }
    instance.on('moveend', checkCenter)
    markers.current = points.map((point) => {
      const marker = L.circleMarker([point.lat, point.lon], { radius: 10, color: markerColor, weight: 3, fillColor: markerColor, fillOpacity: 0.85 })
        .addTo(instance)
      marker.on('click', (event) => {
        L.DomEvent.stopPropagation(event)
        pick.current({ lat: point.lat, lon: point.lon })
      })
      return { point, marker }
    })
    // Seen from the whole county the two labels would cover the outline and the points: they stay permanent only once zoomed in, and show on hover before that.
    const labels = () => {
      const permanent = instance.getZoom() >= LABEL_ZOOM
      for (const { point, marker } of markers.current) {
        marker.unbindTooltip().bindTooltip(pointLabel(tRef.current, point, yearNow.current), { permanent, direction: 'right' })
      }
    }
    labels()
    instance.on('zoomend', labels)
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
    // The frame can change size after the map is drawn (a card appears, the window turns): Leaflet must recompute its size or the view drifts.
    const watcher = new ResizeObserver(() => instance.invalidateSize())
    watcher.observe(container.current)
    return () => {
      watcher.disconnect()
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
  }, [year])

  useEffect(() => {
    for (const { point, marker } of markers.current) marker.setTooltipContent(pointLabel(t, point, year))
  }, [year, t])

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
    background.current = L.tileLayer(next.url, { maxNativeZoom: next.maxNativeZoom, maxZoom: 14, attribution: next.attribution })
      .addTo(instance)
      .bringToBack()
    // Inside a field the vegetation is hidden: its 250 m pixels would only muddy the soil colors.
    const opacity = showVegetation && !soils ? next.ndviOpacity : 0
    ndvi.current?.setOpacity(opacity)
    other.current?.setOpacity(opacity)
    // The background effect runs after the map is created, and again each time the choice changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, points, showVegetation, soils])

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

  // Choosing a field zooms in and draws the soil zones around it, each with its real outline.
  useEffect(() => {
    const instance = map.current
    if (!instance) return
    zones.current?.remove()
    zones.current = null
    setSoils(null)
    const point = selected ? pointAt(selected, points) : null
    if (!point) {
      if (countyBounds.current && selected === null) instance.fitBounds(countyBounds.current, { padding: [30, 30] })
      return
    }
    let stale = false
    loadSoilZones().then((file) => {
      const list = file.points[point.id]?.zones
      if (stale || !list || !map.current) return
      const own = soilFamily(list.find((zone) => zone.holds_point)?.name ?? '')
      // The most common soils get their own color; the rest share one gray, so the map stays readable.
      const families = familiesOf(list)
      const named = families.slice(0, MAX_SOIL_COLORS)
      const colorFor = (family: string) => (named.includes(family) ? colorOf(family, named) : OTHER_SOIL)
      const group = L.featureGroup()
      // Draw the zone that holds the point last, so it sits on top.
      for (const zone of [...list].sort((a, b) => Number(a.holds_point) - Number(b.holds_point))) {
        const color = colorFor(soilFamily(zone.name))
        L.polygon(
          zone.ring.map(([lon, lat]) => [lat, lon] as [number, number]),
          zone.holds_point
            ? { color: '#fff', weight: 3, fillColor: color, fillOpacity: 0.85 }
            : { color: '#0b1020', weight: 1, opacity: 0.6, fillColor: color, fillOpacity: 0.6 },
        )
          .bindTooltip(zone.holds_point ? tRef.current('map.thisField', { name: zone.name }) : zone.name, { sticky: true })
          .addTo(group)
      }
      const counts = new Map(families.map((family) => [family, list.filter((zone) => soilFamily(zone.name) === family).length]))
      setSoils({
        own,
        legend: [
          ...named.map((family) => ({ family, color: colorFor(family), count: counts.get(family) ?? 0 })),
          ...(families.length > named.length
            ? [{ family: '', color: OTHER_SOIL, count: families.slice(named.length).reduce((sum, family) => sum + (counts.get(family) ?? 0), 0) }]
            : []),
        ],
      })
      group.addTo(map.current)
      zones.current = group
      map.current.fitBounds(group.getBounds(), { padding: [20, 20] })
    })
    return () => {
      stale = true
    }
  }, [selected, points])

  useEffect(clip, [split])

  return (
    <div className="map-wrap">
    <div className="map-frame">
      <div
        ref={container}
        className="map"
        role="img"
        aria-label={compareYear === null ? t('map.ariaOne', { year }) : t('map.ariaCompare', { year, other: compareYear })}
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
            aria-label={t('map.divider', { year, other: compareYear })}
            onChange={(event) => setSplit(Number(event.target.value))}
          />
        </>
      )}
      {soils && (
        <>
          <button type="button" className="map__back" onClick={() => onSelect(null)}>
            {t('map.backToCounty')}
          </button>
          <details className="map__soils" open={WIDE.matches}>
            <summary>{t('map.soilsTitle')}</summary>
            <ul>
              {soils.legend.map((entry) => (
                <li key={entry.family || 'other'}>
                  <i style={{ background: entry.color }} aria-hidden="true" />
                  {entry.family ? (entry.family === soils.own ? t('map.soilOwn', { family: entry.family }) : entry.family) : t('map.soilsOther')}
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
      {outside && (
        <p className="map__outside" role="status">
          {t('map.outside', { county: t('county.name') })}
        </p>
      )}
      {status === 'loading' && (
        <p className="map__status" role="status">
          {t('map.loading', { year })}
        </p>
      )}
      {status === 'failed' && (
        <p className="map__status map__status--failed" role="status">
          {t('map.failed', { year })}
        </p>
      )}
    </div>
    {selected && (
      <PlaceCard place={selected} points={points} year={year} compact={soils !== null} onClose={() => onSelect(null)} />
    )}
    </div>
  )
}

/** Inside a field the card keeps only the first line (what grew there) so it does not cover the soils; the rest is one tap away on the county view. */
function PlaceCard({ place, points, year, compact, onClose }: { place: Place; points: CasePoint[]; year: number; compact: boolean; onClose: () => void }) {
  const { t } = useI18n()
  const info = describePlace(t, place, points, year)
  return (
    <aside className="place-card" aria-label={t('place.aria')}>
      <div className="place-card__head">
        <strong>{info.title}</strong>
        <button type="button" className="place-card__close" aria-label={t('place.close')} onClick={onClose}>
          ×
        </button>
      </div>
      <p className="place-card__coords">{formatCoords(t, place)}</p>
      <ul>
        {(compact ? info.lines.slice(0, 1) : info.lines).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </aside>
  )
}
