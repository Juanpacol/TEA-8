// Pure helpers: pick the season of a year and describe it in words. No React, no fetch.
import type { Translate } from '../../shared/i18n/index.ts'
import type { Figure, Season } from '../../shared/lib/data-types.ts'

export function seasonOf(seasons: readonly Season[], year: number): Season | undefined {
  return seasons.find((season) => season.year === year)
}

/** "2.91 mm/day", or null when the data file does not know the value. Never zero in its place. */
export function formatFigure(figure: Figure): string | null {
  if (figure.value === null) return null
  const unit = figure.unit === 'fraction' ? '' : figure.unit.replace(/ vs \d{4}-\d{4}$/, '')
  return `${figure.value}${unit ? (unit.startsWith('°') ? '' : ' ') + unit : ''}`
}

/** One sentence a farmer can read first: how the summer was compared with the usual one. */
export function seasonHeadline(t: Translate, season: Season | undefined, year: number): string {
  if (season === undefined) return t('season.none', { year })
  const comparison = describeDeviation(t, season.root_wetness_deviation.value)
  return comparison === null ? t('season.plain', { year }) : t('season.was', { year, comparison })
}

const CLOSE_TO_USUAL = 0.5

/** How a summer compares with the 2001-2023 mean, in words. */
export function describeDeviation(t: Translate, deviation: number | null): string | null {
  if (deviation === null) return null
  if (Math.abs(deviation) < CLOSE_TO_USUAL) return t('season.close')
  return t(deviation < 0 ? 'season.drier' : 'season.wetter')
}
