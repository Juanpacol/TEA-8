import { useState } from 'react'
import { ClaimView } from '../ask/ClaimView.tsx'
import { useI18n } from '../../shared/i18n/index.ts'
import { askQuestion, type AskContext, type AskResponse } from '../../shared/lib/askApi.ts'

type State = { status: 'idle' } | { status: 'loading' } | { status: 'answered'; response: AskResponse } | { status: 'failed' }

const MAX_LENGTH = 500
const TIMEOUT_MS = 90_000

/** Ask the AI about the place or field just analyzed. Every claim is checked against the evidence of that place. */
export function PlaceAsk({ context, examples }: { context: AskContext; examples: string[] }) {
  const { t } = useI18n()
  const [question, setQuestion] = useState('')
  const [state, setState] = useState<State>({ status: 'idle' })

  async function ask(text: string) {
    if (!text.trim()) return
    setQuestion(text)
    setState({ status: 'loading' })
    try {
      setState({ status: 'answered', response: await askQuestion(text.trim(), undefined, { context, timeoutMs: TIMEOUT_MS }) })
    } catch {
      setState({ status: 'failed' })
    }
  }

  const loading = state.status === 'loading'
  return (
    <section className="place-ask">
      <h4>{t('placeAsk.title')}</h4>
      <p className="place-panel__source">{t('placeAsk.intro')}</p>
      <ul className="place-ask__examples">
        {examples.map((example) => (
          <li key={example}>
            <button type="button" disabled={loading} onClick={() => void ask(example)}>
              {example}
            </button>
          </li>
        ))}
      </ul>
      <form
        className="place-ask__form"
        onSubmit={(event) => {
          event.preventDefault()
          void ask(question)
        }}
      >
        <input
          type="text"
          value={question}
          maxLength={MAX_LENGTH}
          aria-label={t('ask.question')}
          placeholder={t('placeAsk.placeholder')}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button type="submit" disabled={loading || !question.trim()}>
          {t('ask.send')}
        </button>
      </form>
      <div role="status">
        {loading && <p>{t('ask.stage.waiting')}</p>}
        {state.status === 'failed' && <p>{t('placeAsk.failed')}</p>}
      </div>
      {state.status === 'answered' && (
        <div className="place-ask__result" aria-live="polite">
          {state.response.answered ? <p>{state.response.answer}</p> : <p>{t('ask.nodata')}</p>}
          {state.response.claims.length > 0 && (
            <>
              <p className="place-panel__source">
                {t('ask.stage.checked', {
                  verified: state.response.claims.filter((claim) => claim.verified).length,
                  total: state.response.claims.length,
                })}
              </p>
              <ul className="ask__claims">
                {state.response.claims.map((claim) => (
                  <ClaimView key={claim.text} claim={claim} />
                ))}
              </ul>
            </>
          )}
          <p className="place-panel__source">{state.response.notice}</p>
        </div>
      )}
    </section>
  )
}
