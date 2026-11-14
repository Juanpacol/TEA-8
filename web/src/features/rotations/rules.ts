// Pure rules: no React, no fetch, no files. The pipeline decides the agronomy;
// these helpers only classify what the data file already says.
import type { Origin, TEA8DataFile } from '../../shared/lib/data-types.ts'

export type Rotation = TEA8DataFile['rotations'][number]

/** A source that was opened and read. `citation_to_verify` was not. */
export function isSourceRead(origin: Origin): boolean {
  return origin === 'citation'
}

export function isSourceToVerify(origin: Origin): boolean {
  return origin === 'citation_to_verify'
}

/** Crops of a rotation that the reference rotation does not grow. */
export function addedCrops(rotation: Rotation, reference: Rotation): string[] {
  const known = new Set(reference.sequence)
  return [...new Set(rotation.sequence)].filter((crop) => !known.has(crop))
}
