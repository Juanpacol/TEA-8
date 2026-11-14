import { useState } from 'react'
import { askQuestion, type AskResponse } from '../../shared/lib/askApi.ts'

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'answered'; response: AskResponse }
  | { status: 'failed' }

/** Sends a question and keeps the result. Any failure becomes `failed`, which the page answers with the pre-generated text. */
export function useAsk(rotationId?: string) {
  const [state, setState] = useState<State>({ status: 'idle' })

  async function ask(question: string) {
    setState({ status: 'loading' })
    try {
      setState({ status: 'answered', response: await askQuestion(question, rotationId) })
    } catch {
      setState({ status: 'failed' })
    }
  }

  return { state, ask }
}
