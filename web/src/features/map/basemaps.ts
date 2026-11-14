import type { MessageKey } from '../../shared/i18n/index.ts'

/** Backgrounds under the vegetation layer. USGS services are public domain and need no account. */
const USGS = 'https://basemap.nationalmap.gov/arcgis/rest/services'

export type BaseId = 'simple' | 'map' | 'aerial' | 'vegetation'

export type Base = {
  id: BaseId
  /** Message key of the name shown on the control. */
  label: MessageKey
  /** Empty for the plain background, which draws no tiles. */
  url: string
  maxNativeZoom: number
  attribution: string
  /** How opaque the vegetation layer is over this background. */
  ndviOpacity: number
}

const USGS_CREDIT = '<a href="https://www.usgs.gov/programs/national-geospatial-program/national-map">USGS The National Map</a>'

export const BASES: Record<BaseId, Base> = {
  simple: {
    id: 'simple',
    label: 'base.simple',
    url: '',
    maxNativeZoom: 0,
    attribution: '',
    ndviOpacity: 0,
  },
  map: {
    id: 'map',
    label: 'base.map',
    url: `${USGS}/USGSTopo/MapServer/tile/{z}/{y}/{x}`,
    maxNativeZoom: 16,
    attribution: `Map: ${USGS_CREDIT}`,
    ndviOpacity: 0.5,
  },
  aerial: {
    id: 'aerial',
    label: 'base.aerial',
    url: `${USGS}/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}`,
    maxNativeZoom: 16,
    attribution: `Aerial photo: ${USGS_CREDIT}`,
    ndviOpacity: 0.35,
  },
  vegetation: {
    id: 'vegetation',
    label: 'base.vegetation',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg',
    maxNativeZoom: 8,
    attribution: 'Imagery: NASA GIBS (Blue Marble)',
    ndviOpacity: 0.85,
  },
}

/** Backgrounds offered on the control. `simple` and `vegetation` stay defined but are not offered: an empty or low-detail map hid the NASA layer. */
export const BASE_ORDER: BaseId[] = ['map', 'aerial']
export const DEFAULT_BASE: BaseId = 'map'
