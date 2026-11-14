import { useState } from 'react'
import { AskFailure, askQuestion, type AskResponse, type FailureKind } from '../../shared/lib/askApi.ts'

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'answered'; response: AskResponse }
  | { status: 'failed'; kind: FailureKind }

/** Sends a question and keeps the result. Any failure becomes `failed` with its kind; the page decides what to say. */
export function useAsk(rotationId?: string) {
  const [state, setState] = useState<State>({ status: 'idle' })

  async function ask(question: string) {
    setState({ status: 'loading' })
    try {
      setState({ status: 'answered', response: await askQuestion(question, rotationId) })
    } catch (error) {
      setState({ status: 'failed', kind: error instanceof AskFailure ? error.kind : 'unavailable' })
    }
  }

  return { state, ask }
}
