import { useState } from 'react'
import { AskPanel } from '../../features/ask/index.ts'
import { FieldCards, FieldPanel } from '../../features/field/index.ts'
import { EvidenceSection, Limits, Notice, OriginKey, SimulatedNotice } from '../../features/evidence/index.ts'
import { BaseControl, CompareControl, DEFAULT_BASE, MapLegend, MapView, WhereAmI, YearControl, pointAt, type BaseId, type Place } from '../../features/map/index.ts'
import { YearOutcome } from '../../features/yields/index.ts'
import { CompareTable, RotationPicker, rotationName, useRotations } from '../../features/rotations/index.ts'
import { SeasonStrip, seasonOf } from '../../features/season/index.ts'
import { pointName, useI18n } from '../../shared/i18n/index.ts'
import { Tabs } from '../../shared/components/index.ts'
import type { useData } from '../../shared/hooks/useData.ts'
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'
import './tool.css'

function Workspace({ data }: { data: TEA8DataFile }) {
  const { t } = useI18n()
  const [year, setYear] = useState(2023)
  const [compareYear, setCompareYear] = useState<number | null>(null)
  const [base, setBase] = useState<BaseId>(DEFAULT_BASE)
  const [showVegetation, setShowVegetation] = useState(false)
  const [place, setPlace] = useState<Place | null>(null)
  const { summaries, selectedId, selected, select } = useRotations(data)
  const point = data.region.case_points[0]
  const chosen = place ? pointAt(place, data.region.case_points) : null

  return (
    <>
      {data.simulated && <SimulatedNotice />}
      <div className="workspace">
        <header className="workspace__top">
          <YearControl year={year} onChange={setYear} />
          <SeasonStrip year={year} season={seasonOf(data.seasons, year)} pointLabel={pointName(t, point.label)} />
        </header>

        <div className="workspace__map">
          <p className="map-hint">{t('tool.where')}</p>
          <WhereAmI onSelect={setPlace} />
          <FieldCards
            points={data.region.case_points}
            year={year}
            selectedId={chosen?.id ?? null}
            onSelect={(p) => setPlace({ lat: p.lat, lon: p.lon })}
          />
          <MapView points={data.region.case_points} year={year} compareYear={compareYear === year ? null : compareYear} base={base} showVegetation={showVegetation} selected={place} onSelect={setPlace} />
          <p className="map-hint map-hint--small">{t('tool.mapHint')}</p>
          <div className="map-toolbar">
            <BaseControl value={base} onChange={setBase} showVegetation={showVegetation} onShowVegetation={setShowVegetation} />
            <details className="map-more">
              <summary>{t('tool.moreOptions')}</summary>
              <CompareControl year={year} compareYear={compareYear} onChange={setCompareYear} />
            </details>
          </div>
          {showVegetation && <MapLegend year={year} />}
        </div>

        <div className="workspace__side">
          <h3 className="workspace__question">{t('tool.question')}</h3>
          <RotationPicker summaries={summaries} selectedId={selectedId} onSelect={select} />
          {selected && (
            <Tabs
              label={t('tool.tabsLabel', { name: rotationName(t, selected) })}
              tabs={[
                {
                  id: 'year',
                  label: String(year),
                  content: <YearOutcome data={data} rotation={selected} year={year} />,
                },
                {
                  id: 'why',
                  label: t('tab.why'),
                  content: (
                    <div key={selected.id} className="fade-in">
                      <EvidenceSection title={t('evidence.whyTitle')} statements={selected.explanation.why} />
                      <EvidenceSection title={t('evidence.evidenceTitle')} statements={selected.explanation.evidence} />
                      <OriginKey />
                    </div>
                  ),
                },
                {
                  id: 'field',
                  label: t('tab.field'),
                  content: <FieldPanel points={data.region.case_points} year={year} onSelectYear={setYear} place={place} onShowOnMap={setPlace} />,
                },
                {
                  id: 'compare',
                  label: t('tab.compare'),
                  content: <CompareTable data={data} year={year} selectedId={selectedId} onSelect={select} />,
                },
                {
                  id: 'missing',
                  label: t('tab.missing', { n: selected.explanation.gaps.length + selected.explanation.risks.length }),
                  content: (
                    <div key={selected.id} className="fade-in">
                      <EvidenceSection title={t('evidence.gapsTitle')} statements={selected.explanation.gaps} />
                      <EvidenceSection title={t('evidence.risksTitle')} statements={selected.explanation.risks} />
                    </div>
                  ),
                },
                { id: 'ask', label: t('tab.ask'), content: <AskPanel rotation={selected} /> },
                { id: 'limits', label: t('tab.limits'), content: <Limits limits={data.limits ?? []} /> },
              ]}
            />
          )}
        </div>
      </div>
    </>
  )
}

/** The tool section of the page: one workspace that fits a screen, so nobody has to scroll to use it. */
export function ToolSection({ state }: { state: ReturnType<typeof useData> }) {
  const { t } = useI18n()
  return (
    <section id="tool" className="tool-section" aria-label={t('tool.sectionLabel')}>
      <Notice />
      {state.status === 'loading' && <p>{t('tool.loading')}</p>}
      {state.status === 'error' && <p>{t('tool.error', { message: state.message })}</p>}
      {state.status === 'ready' && <Workspace data={state.data} />}
    </section>
  )
}
