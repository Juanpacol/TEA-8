import countyFile from './mclean-il/county.json'

/**
 * Map files of the region the tool covers. To add a region, put its `county.json` (GeoJSON outline) and
 * `soil-zones.json` (made by `python -m pipeline.download.soil_zones`) in a new folder here and point this file at it.
 */
export const REGION_OUTLINE = countyFile as unknown as GeoJSON.FeatureCollection

/** Loaded on demand: the soil zones are only needed once someone chooses a field. */
export async function loadRegionSoilZones(): Promise<unknown> {
  return (await import('./mclean-il/soil-zones.json')).default
}
