import { useMemo, useState } from 'react'
import type { TEA8DataFile } from '../../shared/lib/data-types.ts'
import { compareRotations } from './compare.ts'

/** The compared rotations and which one the farmer is looking at. */
export function useRotations(data: TEA8DataFile) {
  const summaries = useMemo(() => compareRotations(data.rotations), [data.rotations])
  const [selectedId, setSelectedId] = useState(summaries[0]?.id ?? '')
  const selected = data.rotations.find((rotation) => rotation.id === selectedId)
  return { summaries, selectedId, selected, select: setSelectedId }
}
