import type { TEA8DataFile } from './data-types.ts'

const SUPPORTED_VERSION = '1'

/** Fetches a data file written by the pipeline from `public/data/`. */
export async function loadData(file = 'summary.json'): Promise<TEA8DataFile> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/${file}`)
  if (!response.ok) {
    throw new Error(`Could not load ${file}: HTTP ${response.status}`)
  }
  const data = (await response.json()) as TEA8DataFile
  if (data.schema_version !== SUPPORTED_VERSION) {
    throw new Error(`Unsupported data schema version: ${String(data.schema_version)}`)
  }
  return data
}
