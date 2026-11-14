import { useState } from 'react'
import { AskPanel } from '../features/ask/index.ts'
import { EvidencePanel, Limits, Notice } from '../features/evidence/index.ts'
import {
  CallToAction,
  Footer,
  Hero,
  HowItWorks,
  Problem,
  Sources,
  WhyItHoldsUp,
  WontTell,
  driestSummer,
} from '../features/landing/index.ts'
import { MapView, YearControl } from '../features/map/index.ts'
import { RotationList, useRotations } from '../features/rotations/index.ts'
import { Panel } from '../shared/components/index.ts'
import { useData } from '../shared/hooks/useData.ts'
import type { TEA8DataFile } from '../shared/lib/data-types.ts'

function Rotations({ data }: { data: TEA8DataFile }) {
  const { summaries, selectedId, selected, select } = useRotations(data)
  return (
    <>
      <Panel title="Three rotations, side by side">
        <RotationList summaries={summaries} selectedId={selectedId} onSelect={select} />
      </Panel>
      {selected && <EvidencePanel rotation={selected} />}
      {selected && <AskPanel rotation={selected} />}
    </>
  )
}

function Tool({ data }: { data: TEA8DataFile }) {
  const [year, setYear] = useState(2023)
  return (
    <>
      <Panel title="Vegetation from space (NDVI)">
        <YearControl year={year} onChange={setYear} />
        <MapView points={data.region.case_points} year={year} />
      </Panel>
      <Rotations data={data} />
      <Limits limits={data.limits ?? []} simulated={data.simulated} />
    </>
  )
}

export function App() {
  const state = useData()

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '0 var(--space-3)' }}>
      <Hero driest={state.status === 'ready' ? driestSummer(state.data.seasons) : null} />
      <Problem />
      <HowItWorks />
      <WontTell />
      <section id="tool" className="tool" style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <h2>The tool</h2>
        <Notice />
        {state.status === 'loading' && <p>Loading data…</p>}
        {state.status === 'error' && <p>Data unavailable: {state.message}</p>}
        {state.status === 'ready' && <Tool data={state.data} />}
      </section>
      <Sources />
      <WhyItHoldsUp />
      <CallToAction />
      <Footer />
    </main>
  )
}
