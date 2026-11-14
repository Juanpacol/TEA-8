import type { TEA8DataFile } from './data-types.ts'

/** One rotation of the data file. Kept apart from `data-types.ts`, which is generated from the schema. */
export type Rotation = TEA8DataFile['rotations'][number]
