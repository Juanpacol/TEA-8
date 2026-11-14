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

/** "44% below its trend", "3% above its trend" or "on its trend". */
export function describeChange(percent: number | null): string {
  if (percent === null) return 'no trend comparison'
  const size = Math.round(Math.abs(percent))
  if (size === 0) return 'on its trend'
  return `${size}% ${percent < 0 ? 'below' : 'above'} its trend`
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
