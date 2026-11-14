import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../shared/i18n/index.ts'
import { OriginLabel } from '../../shared/components/index.ts'
import type { Rotation } from '../../shared/lib/rotation.ts'
import { rotationName } from '../rotations/labels.ts'
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
  const { t } = useI18n()
  const english = t('ask.englishOnly')
  const [question, setQuestion] = useState('')
  const { state, ask } = useAsk(rotation.id)
  const outcome = useRef<HTMLDivElement>(null)

  // The result sits under the form, below the fold of the side panel: bring it into view.
  useEffect(() => {
    if (state.status === 'answered' || state.status === 'failed') outcome.current?.scrollIntoView({ block: 'nearest' })
  }, [state])

  function submit(event: { preventDefault: () => void }) {
    event.preventDefault()
    if (question.trim()) void ask(question.trim())
  }

  function askExample(example: string) {
    setQuestion(example)
    void ask(example)
  }

  const loading = state.status === 'loading'
  return (
    <div className="ask">
      {english && (
        <p className="ask__language">
          <span aria-hidden="true">ⓘ</span> {english}
        </p>
      )}
      <form className="ask__form" onSubmit={submit}>
        <label htmlFor="question" className="ask__label">
          {t('ask.question')}
        </label>
        <div className="ask__composer">
          <textarea
            id="question"
            value={question}
            maxLength={MAX_LENGTH}
            rows={2}
            placeholder={t('ask.placeholder')}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit(event)
              }
            }}
          />
          <button type="submit" className="ask__send" aria-label={t('ask.send')} disabled={loading || !question.trim()}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
        <ul className="ask__examples" aria-label={t('ask.examplesAria')}>
          {EXAMPLES.map((example) => (
            <li key={example}>
              <button type="button" className="ask__example" disabled={loading} onClick={() => askExample(example)}>
                <span>{example}</span>
                <span aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </ul>
        {loading && (
          <p className="ask__loading" role="status">
            <span className="ask__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {t('ask.loading')}
          </p>
        )}
      </form>

      <div ref={outcome}>
      {state.status === 'answered' && (
        <div className="ask__result" aria-live="polite">
          {!state.response.answered && (
            <p className="ask__nodata">
              {t('ask.nodata')}
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
          {t('ask.daily')}
        </p>
      )}

      {state.status === 'failed' && state.kind === 'busy' && (
        <p className="ask__failed" role="status">
          {t('ask.busy')}
        </p>
      )}

      {state.status === 'failed' && state.kind === 'unavailable' && (
        <div className="ask__result" aria-live="polite">
          <p className="ask__failed">
            {t('ask.unavailable', { name: rotationName(t, rotation) })}
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
