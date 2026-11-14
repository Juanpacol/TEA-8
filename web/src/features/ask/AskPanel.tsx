import { useState, type FormEvent } from 'react'
import { Button, OriginLabel, Panel } from '../../shared/components/index.ts'
import type { Rotation } from '../../shared/lib/rotation.ts'
import { ClaimView } from './ClaimView.tsx'
import { useAsk } from './useAsk.ts'
import './ask.css'

const MAX_LENGTH = 500

/** Ask a question about the data. If the service fails or is slow, the pre-generated explanation is shown instead. */
export function AskPanel({ rotation }: { rotation: Rotation }) {
  const [question, setQuestion] = useState('')
  const { state, ask } = useAsk(rotation.id)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (question.trim()) void ask(question.trim())
  }

  return (
    <Panel title="Ask the data a question">
      <form className="ask__form" onSubmit={submit}>
        <label htmlFor="question">Your question</label>
        <textarea
          id="question"
          value={question}
          maxLength={MAX_LENGTH}
          rows={2}
          placeholder="For example: how dry was summer 2012?"
          onChange={(event) => setQuestion(event.target.value)}
        />
        <Button type="submit" disabled={state.status === 'loading' || !question.trim()}>
          {state.status === 'loading' ? 'Checking the data…' : 'Ask'}
        </Button>
      </form>

      {state.status === 'answered' && (
        <div className="ask__result" aria-live="polite">
          <p className="ask__answer">{state.response.answer}</p>
          {state.response.claims.length > 0 && (
            <ul className="ask__claims">
              {state.response.claims.map((claim) => (
                <ClaimView key={claim.text} claim={claim} />
              ))}
            </ul>
          )}
          <p className="ask__notice">{state.response.notice}</p>
        </div>
      )}

      {state.status === 'failed' && (
        <div className="ask__result" aria-live="polite">
          <p className="ask__failed">
            The question service did not answer. Showing the pre-generated explanation of {rotation.name} instead.
          </p>
          <ul className="ask__claims">
            {rotation.explanation.why.map((statement) => (
              <li key={statement.text}>
                <OriginLabel origin={statement.origin} /> {statement.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  )
}
