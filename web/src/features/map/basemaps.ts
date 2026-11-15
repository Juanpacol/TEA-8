import type { MessageKey } from '../../shared/i18n/index.ts'

/** Backgrounds under the vegetation layer. USGS services are public domain and need no account. An empty background was dropped: it hid the NASA layer. */
const USGS = 'https://basemap.nationalmap.gov/arcgis/rest/services'

export type BaseId = 'map' | 'aerial'

export type Base = {
  id: BaseId
  /** Message key of the name shown on the control. */
  label: MessageKey
  url: string
  maxNativeZoom: number
  attribution: string
  /** How opaque the vegetation layer is over this background. */
  ndviOpacity: number
}

const USGS_CREDIT = '<a href="https://www.usgs.gov/programs/national-geospatial-program/national-map">USGS The National Map</a>'

export const BASES: Record<BaseId, Base> = {
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
}

export const BASE_ORDER: BaseId[] = ['map', 'aerial']
export const DEFAULT_BASE: BaseId = 'map'
