import type { Rotation, TEA8DataFile, YieldRecord } from '../../shared/lib/data-types.ts'

export type CropOutcome =
  | { kind: 'yield'; crop: string; record: YieldRecord }
  | { kind: 'missing'; crop: string; reason: 'not-published' | 'not-covered' }

/** What the county data says for each crop of a rotation in a year. Only corn and soybeans have yields. */
export function outcomesFor(data: TEA8DataFile, sequence: Rotation['sequence'], year: number): CropOutcome[] {
  const records = data.yields ?? []
  return sequence.map((crop): CropOutcome => {
    const record = records.find((r) => r.crop === crop && r.year === year)
    if (record) return { kind: 'yield', crop, record }
    const covered = records.some((r) => r.crop === crop)
    return { kind: 'missing', crop, reason: covered ? 'not-published' : 'not-covered' }
  })
}

/** Within this many percent of the trend counts as "about the usual yield". A project choice, not a standard. */
export const NEAR_USUAL = 5
/** Beyond this many percent it is "much" more or less than usual. A project choice, not a standard. */
export const FAR_FROM_USUAL = 15

/** The change against the trend in words a farmer uses: "a little less than usual", "much more than usual". */
export function plainChange(percent: number | null): string {
  if (percent === null) return 'no comparison available'
  const size = Math.abs(percent)
  if (size < NEAR_USUAL) return 'about the usual yield'
  return `${size >= FAR_FROM_USUAL ? 'much' : 'a little'} ${percent < 0 ? 'less' : 'more'} than usual`
}

/** The same change as a figure: "44% below usual", "3% above usual". */
export function percentFromUsual(percent: number): string {
  const size = Math.round(Math.abs(percent))
  if (size === 0) return 'on the usual yield'
  return `${size}% ${percent < 0 ? 'below' : 'above'} usual`
}

/** Spells out the unit the data file abbreviates. */
export function plainUnit(unit: string): string {
  return unit === 'bu/acre' ? 'bushels per acre' : unit
}

export type DryRange = { crop: string; count: number; lowest: number; highest: number }

/** How the yield of a crop moved against its trend across every dry summer, or null if there were none. */
export function dryRange(data: TEA8DataFile, crop: string): DryRange | null {
  const dryYears = new Set((data.seasons ?? []).filter((s) => s.dry === true).map((s) => s.year))
  const changes = (data.yields ?? [])
    .filter((r) => r.crop === crop && dryYears.has(r.year))
    .map((r) => r.change_vs_trend.value)
    .filter((v): v is number => v !== null)
  if (changes.length === 0) return null
  return { crop, count: changes.length, lowest: Math.min(...changes), highest: Math.max(...changes) }
}

/** The sentence that says whether the summer of a year was dry under the written rule. */
export function summerVerdict(dry: boolean | null | undefined): string {
  if (dry === true) return 'a dry summer'
  if (dry === false) return 'not a dry summer'
  return 'a summer with no wetness data'
}

export function signed(value: number): string {
  const text = Math.abs(value).toFixed(1)
  return `${value < 0 ? '−' : '+'}${text}%`
}
