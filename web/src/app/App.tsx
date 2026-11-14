import { useState } from 'react'
import { EvidencePanel, Limits, Notice } from '../features/evidence/index.ts'
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
    </>
  )
}

export function App() {
  const state = useData()
  const [year, setYear] = useState(2023)

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 'var(--space-5) var(--space-3)',
        display: 'grid',
        gap: 'var(--space-3)',
      }}
    >
      <h1 style={{ color: 'var(--accent)' }}>TEA-8</h1>
      <Notice />
      <Panel title="Evidence before advice">
        <p style={{ color: 'var(--text-soft)', margin: 0 }}>
          {state.status === 'loading' && 'Loading data…'}
          {state.status === 'error' && `Data unavailable: ${state.message}`}
          {state.status === 'ready' &&
            `${state.data.region.name}, ${state.data.region.state}: ${state.data.seasons.length} seasons, ${state.data.rotations.length} rotations.`}
        </p>
      </Panel>
      {state.status === 'ready' && (
        <Panel title="Vegetation from space (NDVI)">
          <YearControl year={year} onChange={setYear} />
          <MapView points={state.data.region.case_points} year={year} />
        </Panel>
      )}
      {state.status === 'ready' && <Rotations data={state.data} />}
      {state.status === 'ready' && <Limits limits={state.data.limits ?? []} simulated={state.data.simulated} />}
    </main>
  )
}
