import { describe, expect, it } from 'vitest'
import type { Figure, Season } from '../../shared/lib/data-types.ts'
import { baselineEnd, describeDeviation, formatFigure, isAfterBaseline, seasonHeadline, seasonOf } from './season.ts'
import { translator } from '../../shared/i18n/index.ts'
const t = translator('en')

const figure = (value: number | null, unit: string): Figure => ({
  value,
  unit,
  source: 'NASA POWER',
  parameter: 'X',
  queried_on: '2026-11-14',
})

const season = (year: number): Season => ({
  year,
  root_wetness: figure(0.5, 'fraction'),
  root_wetness_deviation: figure(-1, 'standard deviations vs 2001-2023'),
  rainfall: figure(2, 'mm/day'),
  temperature: figure(24, '°C'),
})

describe('seasonOf', () => {
  it('finds a year and says nothing when it is missing', () => {
    expect(seasonOf([season(2011), season(2012)], 2012)?.year).toBe(2012)
    expect(seasonOf([season(2011)], 1999)).toBeUndefined()
  })
})

describe('formatFigure', () => {
  it('writes the value with its unit', () => {
    expect(formatFigure(figure(1.77, 'mm/day'))).toBe('1.77 mm/day')
    expect(formatFigure(figure(25.6, '°C'))).toBe('25.6°C')
    expect(formatFigure(figure(0.51, 'fraction'))).toBe('0.51')
    expect(formatFigure(figure(-1.22, 'standard deviations vs 2001-2023'))).toBe('-1.22 standard deviations')
  })

  it('returns null for an unknown value, never zero', () => {
    expect(formatFigure(figure(null, 'mm/day'))).toBeNull()
  })
})

describe('describeDeviation', () => {
  it('names the direction and calls small differences usual', () => {
    expect(describeDeviation(t, -1.98)).toBe('drier than average')
    expect(describeDeviation(t, 1.2)).toBe('wetter than average')
    expect(describeDeviation(t, 0.04)).toBe('close to average')
    expect(describeDeviation(t, null)).toBeNull()
  })
})

describe('seasonHeadline', () => {
  it('says how the summer compares, and admits a missing year', () => {
    expect(seasonHeadline(t, season(2012), 2012)).toBe('Summer 2012 was drier than average.')
    expect(seasonHeadline(t, undefined, 1990)).toBe('There is no climate data for 1990.')
  })
})

describe('baseline', () => {
  it('reads the last year of a range', () => {
    expect(baselineEnd('2001-2023')).toBe(2023)
    expect(baselineEnd('whenever')).toBeNull()
    expect(baselineEnd(undefined)).toBeNull()
  })

  it('flags only the years after the baseline', () => {
    expect(isAfterBaseline('2001-2023', 2023)).toBe(false)
    expect(isAfterBaseline('2001-2023', 2024)).toBe(true)
    expect(isAfterBaseline(undefined, 2026)).toBe(false)
  })
})
