import { loadRegionSoilZones } from '../../regions/index.ts'

/** The soil zones drawn around a chosen case point (USDA SSURGO map units, made by pipeline/download/soil_zones.py). */
export type SoilZone = { name: string; holds_point: boolean; ring: [number, number][] }
export type SoilZonesFile = { source: string; queried_on: string; points: Record<string, { zones: SoilZone[] }> }

/** Loaded on demand: the file is only needed once someone chooses a field. */
export async function loadSoilZones(): Promise<SoilZonesFile> {
  return (await loadRegionSoilZones()) as SoilZonesFile
}

/** The soil family of a map unit: "Catlin silt loam, 2 to 5 percent slopes" is a Catlin. */
export function soilFamily(name: string): string {
  return name.split(' ')[0]
}

const PALETTE = ['#4f9fb0', '#b07f4f', '#7fa05a', '#a05f8f', '#8f8fd0', '#c0a050', '#5fa08f', '#b0605f']

/** One color per soil family, the same family always getting the same color within a point. */
export function colorOf(family: string, families: string[]): string {
  return PALETTE[families.indexOf(family) % PALETTE.length]
}

/** The soil families of a point's zones, the most common first. */
export function familiesOf(zones: SoilZone[]): string[] {
  const count = new Map<string, number>()
  for (const zone of zones) count.set(soilFamily(zone.name), (count.get(soilFamily(zone.name)) ?? 0) + 1)
  return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([family]) => family)
}
