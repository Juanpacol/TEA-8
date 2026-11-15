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
  /** Inside a field: also draw the other soil types around it. Off by default so a field looks like the rest of the map. */
  showSoils: boolean
  selected: Place | null
  onSelect: (place: Place | null) => void
  /** The corners of a field the person drew or loaded. */
  zone?: Place[]
  /** While drawing, a click on the map adds a corner instead of choosing a spot. */
  drawing?: boolean
  onAddCorner?: (corner: Place) => void
}

/** Room around the contiguous United States, so the map cannot drift to another continent. */
const US_BOUNDS: L.LatLngBoundsExpression = [[20, -130], [53, -62]]
/** Close enough to see the fields around a chosen place. */
const PLACE_ZOOM = 14
/** Close enough to tell one field from the next and click its corners. The aerial photo is real up to 16 and enlarged beyond. */
const MAX_ZOOM = 18
const NDVI_OPTIONS = { maxNativeZoom: 9, maxZoom: MAX_ZOOM }
/** On a wide screen the soil key starts open; on a phone it starts closed so it does not cover the map. */
const MAX_SOIL_COLORS = 6
const OTHER_SOIL = '#8a97b4'
/** From this zoom on the point labels stay on screen. */
const LABEL_ZOOM = 11

/** Satellite vegetation (NASA GIBS NDVI) over the case area, for one year, optionally next to another year. */
export function MapView({ points, year, compareYear, base, showVegetation, showSoils, selected, onSelect, zone = [], drawing = false, onAddCorner }: Props) {
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
  const others = useRef<L.FeatureGroup | null>(null)
  const countyBounds = useRef<L.LatLngBounds | null>(null)
  const pick = useRef(onSelect)
  pick.current = onSelect
  const addCorner = useRef(onAddCorner)
  addCorner.current = onAddCorner
  const drawingNow = useRef(drawing)
  drawingNow.current = drawing
  const zoneLayer = useRef<L.FeatureGroup | null>(null)
  const zoneNow = useRef(zone)
  zoneNow.current = zone
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [split, setSplit] = useState(50)
  const [outside, setOutside] = useState(false)
  const [soils, setSoils] = useState<{ own: string; legend: { family: string; color: string; count: number }[] } | null>(null)
  const splitNow = useRef(split)
  splitNow.current = split
  const yearNow = useRef(year)
  yearNow.current = year
  const inField = selected !== null && pointAt(selected, points) !== null
  const inFieldNow = useRef(inField)
  inFieldNow.current = inField
  const relabel = useRef<() => void>(() => {})
  const soilsNow = useRef(showSoils)
  soilsNow.current = showSoils

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
      minZoom: 4,
      // The contiguous United States: a pasted coordinate can be anywhere in it.
      maxBounds: US_BOUNDS,
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
    // Without animation: a pending county animation would pull the map back from a field opened right after (a shared link).
    instance.fitBounds(countyBounds.current, { padding: [30, 30], animate: false })
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
    // Inside a field they would cover the soil under the point, and the chosen field card already says what grew there.
    const labels = () => {
      const permanent = instance.getZoom() >= LABEL_ZOOM && !inFieldNow.current
      for (const { point, marker } of markers.current) {
        marker.unbindTooltip().bindTooltip(pointLabel(tRef.current, point, yearNow.current), { permanent, direction: 'right' })
      }
    }
    labels()
    relabel.current = labels
    instance.on('zoomend', labels)
    ring.current = L.circleMarker([points[0].lat, points[0].lon], {
      radius: 14,
      color: markerColor,
      weight: 3,
      fill: false,
      interactive: false,
    })
    instance.on('click', (event: L.LeafletMouseEvent) => {
      const spot = { lat: event.latlng.lat, lon: event.latlng.lng }
      if (drawingNow.current) addCorner.current?.(spot)
      else pick.current(spot)
    })
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

  useEffect(() => relabel.current(), [inField])

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
    background.current = L.tileLayer(next.url, { maxNativeZoom: next.maxNativeZoom, maxZoom: MAX_ZOOM, attribution: next.attribution })
      .addTo(instance)
      .bringToBack()
    // With the soil types on, the vegetation is hidden: its 250 m pixels would only muddy the soil colors.
    const opacity = showVegetation && !(showSoils && inField) ? next.ndviOpacity : 0
    ndvi.current?.setOpacity(opacity)
    other.current?.setOpacity(opacity)
    // The background effect runs after the map is created, and again each time the choice changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, points, showVegetation, showSoils, inField])

  useEffect(() => {
    const instance = map.current
    const marker = ring.current
    if (!instance || !marker) return
    if (selected) {
      marker.setLatLng([selected.lat, selected.lon]).addTo(instance)
      // A town or a located device may be off screen: bring it into view.
      if (!instance.getBounds().contains([selected.lat, selected.lon])) {
        instance.setView([selected.lat, selected.lon], Math.max(instance.getZoom(), PLACE_ZOOM))
      }
    }
    else marker.remove()
  }, [selected])

  // Choosing a field zooms in and draws the soil zones around it, each with its real outline.
  useEffect(() => {
    const instance = map.current
    if (!instance) return
    zones.current?.remove()
    zones.current = null
    others.current = null
    setSoils(null)
    const point = selected ? pointAt(selected, points) : null
    if (!point) {
      // Back to the whole county, unless a field the person drew or opened from a link is on the map.
      if (countyBounds.current && selected === null && zoneNow.current.length < 3) instance.fitBounds(countyBounds.current, { padding: [30, 30] })
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
      const rest = L.featureGroup()
      for (const zone of list) {
        const color = colorFor(soilFamily(zone.name))
        const ring = zone.ring.map(([lon, lat]) => [lat, lon] as [number, number])
        if (zone.holds_point) {
          // The soil at the point is always drawn: thick white edge, and its name written on it.
          L.polygon(ring, { color: '#fff', weight: 4, fillColor: color, fillOpacity: 0.55 })
            .bindTooltip(tRef.current('map.soilHere', { name: zone.name.split(',')[0] }), { permanent: true, direction: 'top', offset: [0, -4] })
            .addTo(group)
        } else {
          L.polygon(ring, { color: '#0b1020', weight: 1, opacity: 0.35, fillColor: color, fillOpacity: 0.4 })
            .bindTooltip(zone.name, { sticky: true })
            .addTo(rest)
        }
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
      // The soil file is cut to a square around the point: with the other soils on, draw its edge so the cut reads as the limit of the data.
      const square = L.latLngBounds(list.flatMap((zone) => zone.ring.map(([lon, lat]) => [lat, lon] as [number, number])))
      L.rectangle(square, { color: '#fff', weight: 2, dashArray: '6 6', fill: false, interactive: false }).addTo(rest)
      group.addTo(map.current)
      zones.current = group
      others.current = rest
      if (soilsNow.current) group.addLayer(rest)
      if (soilsNow.current) rest.bringToBack()
      map.current.fitBounds(square, { padding: [20, 20] })
    })
    return () => {
      stale = true
    }
  }, [selected, points])

  // The other soils come and go with the switch, without moving the map.
  useEffect(() => {
    const group = zones.current
    const rest = others.current
    if (!group || !rest) return
    if (showSoils) {
      group.addLayer(rest)
      rest.bringToBack()
    } else group.removeLayer(rest)
  }, [showSoils, soils])

  useEffect(clip, [split])

  // The field the person drew or loaded: corners while drawing, a filled outline once finished.
  useEffect(() => {
    const instance = map.current
    if (!instance) return
    zoneLayer.current?.remove()
    if (zone.length === 0) return
    const color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4fc3cd'
    const latlngs = zone.map((c) => [c.lat, c.lon] as L.LatLngTuple)
    const group = L.featureGroup()
    if (drawing || zone.length < 3) L.polyline(latlngs, { color, weight: 3, dashArray: '6 6', interactive: false }).addTo(group)
    else L.polygon(latlngs, { color, weight: 3, fillColor: color, fillOpacity: 0.18, interactive: false }).addTo(group)
    latlngs.forEach((latlng) => L.circleMarker(latlng, { radius: 5, color, weight: 2, fillColor: '#ffffff', fillOpacity: 1, interactive: false }).addTo(group))
    group.addTo(instance)
    zoneLayer.current = group
    // Go to the field when it is off screen, or too small to see from here (a field inside McLean opened from a link shows on the county view).
    const bounds = group.getBounds()
    const hidden = !instance.getBounds().contains(bounds) || instance.getBoundsZoom(bounds) - instance.getZoom() >= 3
    if (!drawing && zone.length >= 3 && hidden) instance.fitBounds(bounds, { padding: [30, 30] })
  }, [zone, drawing])

  return (
    <div className="map-wrap">
    <div className="map-frame">
      <div
        ref={container}
        data-drawing={drawing || undefined}
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
      {inField && (
        <button type="button" className="map__back" onClick={() => onSelect(null)}>
          {t('map.backToCounty')}
        </button>
      )}
      {outside && !drawing && (
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
    {soils && showSoils && (
      <section className="map__soils" aria-label={t('map.soilsTitle')}>
        <h3>{t('map.soilsTitle')}</h3>
        <ul>
          {soils.legend.map((entry) => (
            <li key={entry.family || 'other'}>
              <i style={{ background: entry.color }} aria-hidden="true" />
              {entry.family ? (entry.family === soils.own ? t('map.soilOwn', { family: entry.family }) : entry.family) : t('map.soilsOther')}
            </li>
          ))}
        </ul>
        <p className="map__soils-note">{t('map.soilsSquare')}</p>
      </section>
    )}
    {selected && !inField && !drawing && zone.length < 3 && <PlaceCard place={selected} points={points} year={year} onClose={() => onSelect(null)} />}
    </div>
  )
}

/** What we know about a spot the user clicked. Inside an example field the field card and the side panel say it instead. */
function PlaceCard({ place, points, year, onClose }: { place: Place; points: CasePoint[]; year: number; onClose: () => void }) {
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
        {info.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </aside>
  )
}
