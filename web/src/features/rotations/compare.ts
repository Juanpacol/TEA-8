// Pure comparison of rotations. It gives no score and no ranking: the decision
// belongs to the farmer.
import type { Rotation } from '../../shared/lib/rotation.ts'
import { addedCrops, isSourceRead, isSourceToVerify } from './rules.ts'

export type RotationSummary = {
  id: string
  name: string
  isCurrent: boolean
  hypothetical: boolean
  sequence: string[]
  addedCrops: string[]
  sourcesRead: number
  sourcesToVerify: number
  gaps: number
  risks: number
}

export function compareRotations(rotations: readonly Rotation[]): RotationSummary[] {
  const current = rotations.find((rotation) => rotation.is_current)
  return rotations.map((rotation) => ({
    id: rotation.id,
    name: rotation.name,
    isCurrent: rotation.is_current,
    hypothetical: rotation.hypothetical,
    sequence: rotation.sequence,
    addedCrops: current && !rotation.is_current ? addedCrops(rotation, current) : [],
    sourcesRead: rotation.rules.filter((rule) => isSourceRead(rule.origin)).length,
    sourcesToVerify: rotation.rules.filter((rule) => isSourceToVerify(rule.origin)).length,
    gaps: rotation.explanation.gaps.length,
    risks: rotation.explanation.risks.length,
  }))
}
