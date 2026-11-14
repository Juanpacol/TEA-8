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

/** Colors of the NDVI layer, sampled evenly along the colorbar of the NASA GIBS legend (MODIS_L3_NDVI_H.svg). Data colors, not theme colors. */
export const NDVI_LEGEND_STOPS = ['#f1ecec', '#dfcec1', '#b4a596', '#a18064', '#96ba20', '#56a101', '#2e8001', '#006401', '#001801']

/** Where the labeled values sit along that bar, as a fraction of its width. The scale is not linear: 0.3 is where brown turns to green. */
export const NDVI_LEGEND_TICKS = [
  { value: '0.0', at: 0 },
  { value: '0.3', at: 0.429 },
  { value: '1.0', at: 1 },
]
