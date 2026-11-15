import { isUnavailable, type PlaceEvidence, type ZoneEvidence } from '../../shared/lib/placeApi.ts'
import { BASES } from '../map/basemaps.ts'
import { staticMap } from './reportMap.ts'
import { linkFor } from './share.ts'
import './report.css'

type Corner = { lat: number; lon: number }
type Props = { target: { place: Corner } | { zone: Corner[] }; evidence: PlaceEvidence | ZoneEvidence }

/** Classes for the color scales. Each is [lower bound, label, color]. */
const VCI_SCALE: [number, string, string][] = [
  [0, 'Extreme stress', '#d8453f'],
  [10, 'Severe stress', '#e07b3c'],
  [20, 'Moderate stress', '#d9a441'],
  [35, 'Fair', '#e8d9a8'],
  [50, 'Good', '#7bc47f'],
  [75, 'Very good', '#1f8a93'],
]
const NDVI_SCALE: [number, string, string][] = [
  [-1, 'Bare or water', '#c9b08a'],
  [0.2, 'Sparse', '#e8d9a8'],
  [0.4, 'Moderate', '#b9d98f'],
  [0.6, 'Dense', '#7bc47f'],
  [0.8, 'Very dense', '#3f9a5a'],
]
const DRY = '#d9a441'
const WET = '#1f8a93'
const MAP_W = 680
const MAP_H = 300

function classOf(scale: [number, string, string][], value: number) {
  return [...scale].reverse().find(([low]) => value >= low) ?? scale[0]
}

function Scale({ scale, unit }: { scale: [number, string, string][]; unit?: string }) {
  return (
    <ol className="report-doc__scale">
      {scale.map(([low, label, color], i) => (
        <li key={label} style={{ background: color }}>
          <strong>{label}</strong>
          <span>
            {i === 0 ? `< ${scale[1][0]}` : i === scale.length - 1 ? `≥ ${low}` : `${low}–${scale[i + 1][0]}`}
            {unit}
          </span>
        </li>
      ))}
    </ol>
  )
}

/** One bar per year. */
function YearBars({ data, max, color, label }: { data: { year: number; value: number }[]; max: number; color: (v: number, year: number) => string; label: string }) {
  const w = 680
  const h = 150
  const pad = { l: 34, b: 22, t: 8 }
  const step = (w - pad.l) / data.length
  const y = (v: number) => pad.t + (h - pad.t - pad.b) * (1 - v / max)
  return (
    <svg className="report-doc__chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={pad.l} x2={w} y1={y(max * f)} y2={y(max * f)} stroke="#d5dbe3" />
          <text x={pad.l - 4} y={y(max * f) + 3} textAnchor="end">
            {+(max * f).toFixed(2)}
          </text>
        </g>
      ))}
      {data.map((d, i) => (
        <g key={d.year}>
          <rect x={pad.l + i * step + 2} y={y(d.value)} width={step - 4} height={Math.max(0, y(0) - y(d.value))} fill={color(d.value, d.year)} />
          {(i % 2 === 0 || data.length < 14) && (
            <text x={pad.l + i * step + step / 2} y={h - 6} textAnchor="middle">
              {d.year}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

function Map({ corners }: { corners: Corner[] }) {
  const map = staticMap(corners, MAP_W, MAP_H)
  const url = BASES.aerial.url
  return (
    <figure className="report-doc__map">
      <div style={{ width: MAP_W, height: MAP_H }}>
        {map.tiles.map((t) => (
          <img
            key={`${t.x}-${t.y}`}
            src={url.replace('{z}', String(map.zoom)).replace('{x}', String(t.x)).replace('{y}', String(t.y))}
            style={{ left: t.left, top: t.top }}
            alt=""
          />
        ))}
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
          {map.points.length > 1 ? (
            <polygon points={map.points.map((p) => `${p.x},${p.y}`).join(' ')} fill="rgb(217 164 65 / 0.25)" stroke="#d9a441" strokeWidth="3" />
          ) : (
            <circle cx={map.points[0].x} cy={map.points[0].y} r="8" fill="#d9a441" stroke="#fff" strokeWidth="3" />
          )}
        </svg>
      </div>
      <figcaption>Aerial photo: USGS The National Map. {map.points.length > 1 ? 'Outline drawn by the user.' : 'The marker is the chosen point.'}</figcaption>
    </figure>
  )
}

/** A printable English report of the evidence: summary, map, climate, vegetation, soil, crops, limits and sources. */
export function Report({ target, evidence }: Props) {
  const corners = 'place' in target ? [target.place] : target.zone
  const zone = 'zone' in evidence ? evidence.zone : null
  const { climate, soil, crops, vegetation } = evidence
  const seasons = isUnavailable(climate) ? [] : climate.seasons
  const veg = vegetation && !isUnavailable(vegetation) ? vegetation : null
  const lastVeg = veg?.seasons.at(-1)
  const soils = soil && !isUnavailable(soil) ? ('soils' in soil ? soil.soils : [{ name: soil.name, share_pct: null, drainage: soil.drainage, hydrologic_group: soil.hydrologic_group }]) : []
  const where = zone
    ? `${zone.area_ha} ha field, center ${zone.center.lat}, ${zone.center.lon}`
    : `Point ${corners[0].lat.toFixed(5)}, ${corners[0].lon.toFixed(5)}`
  const sections = ['Summary', 'Location', 'Summer climate', 'Vegetation (NDVI and VCI)', 'Soil', 'Crops by year', 'What this does not tell you', 'Sources and glossary']
  const head = (i: number) => `${i + 1}. ${sections[i]}`

  return (
    <article className="report-doc" aria-hidden="true">
      <header className="report-doc__header">
        <div>
          <p className="report-doc__brand">TEA-8</p>
          <h1>{zone ? 'Field evidence report' : 'Place evidence report'}</h1>
          <p>{where}</p>
        </div>
        <dl>
          <dt>Queried on</dt>
          <dd>{evidence.queried_on}</dd>
          <dt>Reopen</dt>
          <dd className="report-doc__link">{linkFor(target)}</dd>
        </dl>
      </header>
      <p className="report-doc__notice">Supports a decision, does not replace it. No score and no "best option": every figure comes with its source and its limits.</p>

      <nav className="report-doc__toc">
        <h2>Contents</h2>
        <ol>
          {sections.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </nav>

      <section>
        <h2>{head(0)}</h2>
        <div className="report-doc__figures">
          <div>
            <strong>{zone ? `${zone.area_ha} ha` : `${corners[0].lat.toFixed(3)}, ${corners[0].lon.toFixed(3)}`}</strong>
            <span>{zone ? 'Field area' : 'Coordinates'}</span>
          </div>
          <div>
            <strong>{isUnavailable(climate) ? 'n/a' : climate.dry_years.join(', ') || 'None'}</strong>
            <span>Dry summers since 2001</span>
          </div>
          <div>
            <strong>{lastVeg ? `${lastVeg.vci ?? 'n/a'}` : 'n/a'}</strong>
            <span>VCI of summer {lastVeg?.year ?? ''} (0–100)</span>
          </div>
          <div>
            <strong>{soils[0]?.name ?? 'n/a'}</strong>
            <span>{zone ? 'Main soil' : 'Soil at the point'}</span>
          </div>
        </div>
      </section>

      <section>
        <h2>{head(1)}</h2>
        <Map corners={corners} />
      </section>

      <section>
        <h2>{head(2)}</h2>
        {isUnavailable(climate) ? (
          <p>The climate source did not answer.</p>
        ) : (
          <>
            <p>
              Soil moisture where the roots are, June to August (0 dry, 1 wet). A summer counts as dry when it is 1 standard deviation or more below the{' '}
              {climate.baseline} mean. Dry summers here: <strong>{climate.dry_years.join(', ') || 'none'}</strong>.
            </p>
            <YearBars
              data={seasons.map((s) => ({ year: s.year, value: s.root_wetness }))}
              max={1}
              color={(_, year) => (climate.dry_years.includes(year) ? DRY : WET)}
              label="Summer soil moisture by year"
            />
            <p className="report-doc__key">
              <span style={{ background: WET }} /> Normal summer <span style={{ background: DRY }} /> Dry summer
            </p>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Soil moisture</th>
                  <th>Deviation (SD)</th>
                  <th>Rain (mm/day)</th>
                  <th>Temp. (°C)</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((s) => (
                  <tr key={s.year} className={s.dry ? 'is-dry' : undefined}>
                    <td>{s.year}</td>
                    <td>{s.root_wetness.toFixed(2)}</td>
                    <td>{s.root_wetness_deviation ?? '–'}</td>
                    <td>{s.rainfall_mm_day ?? '–'}</td>
                    <td>{s.temperature_c ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="report-doc__source">{climate.source}. {climate.note}</p>
          </>
        )}
      </section>

      <section>
        <h2>{head(3)}</h2>
        {!veg ? (
          <p>The vegetation source did not answer.</p>
        ) : (
          <>
            <p>
              NDVI measures how green the plants are. VCI ranks each summer from 0 (the least green of {veg.range}) to 100 (the greenest): a low VCI means
              vegetation stress compared with the other summers.
            </p>
            <h3>Vegetation Condition Index (VCI)</h3>
            <Scale scale={VCI_SCALE} />
            <ol className="report-doc__cells">
              {veg.seasons.map((s) => {
                const [, label, color] = s.vci === null ? [0, 'n/a', '#eee'] : classOf(VCI_SCALE, s.vci)
                return (
                  <li key={s.year} style={{ background: color }}>
                    <span>{s.year}</span>
                    <strong>{s.vci ?? '–'}</strong>
                    <small>{label}</small>
                  </li>
                )
              })}
            </ol>
            <h3>NDVI, mean of June to August</h3>
            <Scale scale={NDVI_SCALE} />
            <YearBars
              data={veg.seasons.map((s) => ({ year: s.year, value: s.ndvi }))}
              max={1}
              color={(v) => classOf(NDVI_SCALE, v)[2]}
              label="Summer NDVI by year"
            />
            <p className="report-doc__source">{veg.source}. One 250 m pixel {zone ? 'at the center of the field' : 'at the point'}.</p>
          </>
        )}
      </section>

      <section>
        <h2>{head(4)}</h2>
        {soil === null ? (
          <p>The soil survey has nothing here (it may be a town, a road or water).</p>
        ) : isUnavailable(soil) ? (
          <p>The soil source did not answer.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Soil</th>
                  {zone && <th>Share of field</th>}
                  <th>Drainage</th>
                  <th>Hydrologic group</th>
                </tr>
              </thead>
              <tbody>
                {soils.map((s) => (
                  <tr key={`${s.name}-${s.drainage}`}>
                    <td>{s.name}</td>
                    {zone && <td>{s.share_pct}%</td>}
                    <td>{s.drainage ?? '–'}</td>
                    <td>{s.hydrologic_group ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {'organic_matter_pct' in soil && (
              <p>
                Top layer: organic matter {soil.organic_matter_pct ?? '–'}%, available water {soil.available_water ?? '–'} cm per cm of soil.
              </p>
            )}
            <p className="report-doc__source">{soil.source}.</p>
          </>
        )}
      </section>

      <section>
        <h2>{head(5)}</h2>
        {isUnavailable(crops) ? (
          <p>The crop source did not answer.</p>
        ) : (
          <>
            <table className="report-doc__crops">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Crop{'points' in crops ? ` (points out of ${crops.points})` : ''}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(crops.years).map(([year, value]) => (
                  <tr key={year}>
                    <td>{year}</td>
                    <td>
                      {value === null || (typeof value === 'object' && !Object.keys(value).length)
                        ? 'No data'
                        : typeof value === 'string'
                          ? value
                          : Object.entries(value as Record<string, number>)
                              .sort((a, b) => b[1] - a[1])
                              .map(([crop, k]) => `${crop} ${k}`)
                              .join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="report-doc__source">{crops.source}. {crops.note}</p>
          </>
        )}
      </section>

      <section>
        <h2>{head(6)}</h2>
        <ul className="report-doc__limits">
          {evidence.limits.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{head(7)}</h2>
        <dl className="report-doc__glossary">
          <dt>NASA POWER</dt>
          <dd>Daily and monthly climate from satellites and models, on a grid of about 50 km. GWETROOT is the soil moisture where the roots are, from 0 dry to 1 wet.</dd>
          <dt>NASA MODIS (MOD13Q1)</dt>
          <dd>Satellite greenness every 16 days at 250 m, read through the ORNL DAAC service.</dd>
          <dt>NDVI</dt>
          <dd>Normalized Difference Vegetation Index: red and near-infrared light reflected by plants. About 0.2 is bare ground and 0.9 a dense green crop.</dd>
          <dt>VCI</dt>
          <dd>Vegetation Condition Index: 100 × (NDVI − lowest) ÷ (highest − lowest) over the summers on record, for the same pixel.</dd>
          <dt>USDA SSURGO</dt>
          <dd>The soil survey map of the United States: soil names, drainage and hydrologic group (A drains fast, D slow).</dd>
          <dt>USDA CropScape</dt>
          <dd>The Cropland Data Layer: the crop grown on each 30 m pixel, each year since 2008.</dd>
        </dl>
        <p className="report-doc__source">Generated by TEA-8 (tea-8.vercel.app) on {evidence.queried_on}. Built for NASA Space Apps 2026.</p>
      </section>
    </article>
  )
}
