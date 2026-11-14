import { useEffect, useState } from 'react'
import { loadData } from '../lib/loadData.ts'
import type { TEA8DataFile } from '../lib/data-types.ts'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: TEA8DataFile }

/** Loads the data file once and exposes its loading, error and ready states. */
export function useData(file?: string): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    loadData(file)
      .then((data) => !cancelled && setState({ status: 'ready', data }))
      .catch((error: Error) => !cancelled && setState({ status: 'error', message: error.message }))
    return () => {
      cancelled = true
    }
  }, [file])

  return state
}
