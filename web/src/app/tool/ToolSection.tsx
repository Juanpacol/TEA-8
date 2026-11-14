import { useState } from 'react'
import { AskPanel } from '../../features/ask/index.ts'
import { EvidenceSection, Limits, Notice, OriginKey, SimulatedNotice } from '../../features/evidence/index.ts'
import { MapLegend, MapView, YearControl } from '../../features/map/index.ts'
import { RotationPicker, useRotations } from '../../features/rotations/index.ts'
import { SeasonStrip, seasonOf } from '../../features/season/index.ts'
import { Tabs } from '../../shared/components/index.ts'
import type { useData } from '../../shared/hooks/useData.ts'
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'
import './tool.css'

function Workspace({ data }: { data: TEA8DataFile }) {
  const [year, setYear] = useState(2023)
  const { summaries, selectedId, selected, select } = useRotations(data)
  const point = data.region.case_points[0]

  return (
    <>
      {data.simulated && <SimulatedNotice />}
      <div className="workspace">
        <header className="workspace__top">
          <YearControl year={year} onChange={setYear} />
          <SeasonStrip year={year} season={seasonOf(data.seasons, year)} pointLabel={point.label} />
        </header>

        <div className="workspace__map">
          <MapView points={data.region.case_points} year={year} />
          <MapLegend year={year} />
        </div>

        <div className="workspace__side">
          <h3 className="workspace__question">What could you plant?</h3>
          <RotationPicker summaries={summaries} selectedId={selectedId} onSelect={select} />
          {selected && (
            <Tabs
              label={`About ${selected.name}`}
              tabs={[
                {
                  id: 'why',
                  label: 'Why',
                  content: (
                    <div key={selected.id} className="fade-in">
                      <EvidenceSection title="Why it is shown" statements={selected.explanation.why} />
                      <EvidenceSection title="Evidence" statements={selected.explanation.evidence} />
                      <OriginKey />
                    </div>
                  ),
                },
                {
                  id: 'missing',
                  label: `What is missing (${selected.explanation.gaps.length + selected.explanation.risks.length})`,
                  content: (
                    <div key={selected.id} className="fade-in">
                      <EvidenceSection title="What we do not know" statements={selected.explanation.gaps} />
                      <EvidenceSection title="Risks for a local expert to review" statements={selected.explanation.risks} />
                    </div>
                  ),
                },
                { id: 'ask', label: 'Ask', content: <AskPanel rotation={selected} /> },
                { id: 'limits', label: 'Limits', content: <Limits limits={data.limits ?? []} /> },
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
  return (
    <section id="tool" className="tool-section" aria-label="The tool">
      <Notice />
      {state.status === 'loading' && <p>Loading data…</p>}
      {state.status === 'error' && <p>Data unavailable: {state.message}</p>}
      {state.status === 'ready' && <Workspace data={state.data} />}
    </section>
  )
}
