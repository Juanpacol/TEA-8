import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button, OriginLabel } from '../../shared/components/index.ts'
import type { Rotation } from '../../shared/lib/rotation.ts'
import { ClaimView } from './ClaimView.tsx'
import { useAsk } from './useAsk.ts'
import './ask.css'

const MAX_LENGTH = 500

const EXAMPLES = [
  'How dry was summer 2012?',
  'How did summer 2023 compare with the 2001-2023 average?',
  'Which rotation will give me the best yield?',
]

/** Ask a question about the data. If the service fails or is slow, the pre-generated explanation is shown instead. */
export function AskPanel({ rotation }: { rotation: Rotation }) {
  const [question, setQuestion] = useState('')
  const { state, ask } = useAsk(rotation.id)
  const outcome = useRef<HTMLDivElement>(null)

  // The result sits under the form, below the fold of the side panel: bring it into view.
  useEffect(() => {
    if (state.status === 'answered' || state.status === 'failed') outcome.current?.scrollIntoView({ block: 'nearest' })
  }, [state])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (question.trim()) void ask(question.trim())
  }

  function askExample(example: string) {
    setQuestion(example)
    void ask(example)
  }

  return (
    <div className="ask">
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
        <ul className="ask__examples" aria-label="Example questions">
          {EXAMPLES.map((example) => (
            <li key={example}>
              <Button type="button" variant="ghost" disabled={state.status === 'loading'} onClick={() => askExample(example)}>
                {example}
              </Button>
            </li>
          ))}
        </ul>
        <Button type="submit" disabled={state.status === 'loading' || !question.trim()}>
          {state.status === 'loading' ? 'Checking the data…' : 'Ask'}
        </Button>
      </form>

      <div ref={outcome}>
      {state.status === 'answered' && (
        <div className="ask__result" aria-live="polite">
          {!state.response.answered && (
            <p className="ask__nodata">
              The project data does not cover this question, so TEA-8 will not guess. Try asking about rainfall,
              temperature or soil wetness of a summer between 2001 and 2023.
            </p>
          )}
          {state.response.answered && <p className="ask__answer">{state.response.answer}</p>}
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

      {state.status === 'failed' && state.kind === 'daily_limit' && (
        <p className="ask__failed" role="status">
          The daily limit of questions was reached. Try again tomorrow; the explanations above need no questions.
        </p>
      )}

      {state.status === 'failed' && state.kind === 'busy' && (
        <p className="ask__failed" role="status">
          Too many questions in a short time. Wait a minute and ask again.
        </p>
      )}

      {state.status === 'failed' && state.kind === 'unavailable' && (
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
      </div>
    </div>
  )
}
