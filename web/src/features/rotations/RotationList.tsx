import type { RotationSummary } from './compare.ts'
import { RotationCard } from './RotationCard.tsx'
import './rotations.css'

type Props = { summaries: RotationSummary[]; selectedId: string; onSelect: (id: string) => void }

/** The rotations side by side. There is no ranking and no "best" marker. */
export function RotationList({ summaries, selectedId, onSelect }: Props) {
  return (
    <>
      <p className="rotations__note">
        The counts only tell how much each rotation has behind it. They are not a score: a larger number is not better or worse.
      </p>
      <div className="rotations">
      {summaries.map((summary) => (
        <RotationCard
          key={summary.id}
          summary={summary}
          selected={summary.id === selectedId}
          onSelect={() => onSelect(summary.id)}
        />
      ))}
      </div>
    </>
  )
}
