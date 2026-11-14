/** NASA GIBS WMTS tile URLs. Open, no account, CORS enabled. */
const GIBS = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best'

export const NDVI_FIRST_YEAR = 2001
export const NDVI_LAST_YEAR = 2025
export const NDVI_LAYER = 'MODIS_Terra_L3_NDVI_16Day'

/** Mid-July composite of a year, the peak of the growing season. */
export function ndviDate(year: number): string {
  return `${year}-07-20`
}

export function ndviTileUrl(year: number): string {
  return `${GIBS}/${NDVI_LAYER}/default/${ndviDate(year)}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`
}

export const BASE_TILE_URL = `${GIBS}/BlueMarble_ShadedRelief/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg`
