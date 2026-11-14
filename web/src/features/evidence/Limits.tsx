import { Panel } from '../../shared/components/index.ts'
import './evidence.css'

type Props = { limits: string[]; simulated: boolean }

/** What the data cannot tell the farmer. */
export function Limits({ limits, simulated }: Props) {
  return (
    <Panel title="What this data cannot tell you">
      {simulated && <p className="limits__simulated">This file holds simulated data.</p>}
      <ul className="limits">
        {limits.map((limit) => (
          <li key={limit}>{limit}</li>
        ))}
      </ul>
    </Panel>
  )
}
