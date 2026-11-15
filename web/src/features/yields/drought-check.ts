// Does an independent source agree with our dry summers? Pure: no React, no fetch.
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'

/** A summer counts as a drought summer for the US Drought Monitor when, on average over June to August, more than this share of the county is in drought (D1 or worse). */
export const DROUGHT_SHARE = 50

export type Check = { year: number; share: number; deviation: number | null; dry: boolean }

export type Agreement = {
  /** Our dry summers that the Drought Monitor also puts in drought. */
  confirmed: Check[]
  /** Our dry summers the Drought Monitor does not put in drought. */
  notConfirmed: Check[]
  /** Summers the Drought Monitor puts in drought that our rule does not call dry. */
  missed: Check[]
}

/** Every summer that has both our dry flag and a Drought Monitor figure, oldest first. */
export function checksFor(data: TEA8DataFile): Check[] {
  const checks: Check[] = []
  for (const season of data.seasons ?? []) {
    const share = season.drought_monitor?.value
    if (share === null || share === undefined || season.dry === null || season.dry === undefined) continue
    checks.push({ year: season.year, share, deviation: season.root_wetness_deviation.value, dry: season.dry })
  }
  return checks.sort((a, b) => a.year - b.year)
}

export function agreement(checks: readonly Check[]): Agreement {
  const droughty = (check: Check) => check.share > DROUGHT_SHARE
  return {
    confirmed: checks.filter((check) => check.dry && droughty(check)),
    notConfirmed: checks.filter((check) => check.dry && !droughty(check)),
    missed: checks.filter((check) => !check.dry && droughty(check)),
  }
}
