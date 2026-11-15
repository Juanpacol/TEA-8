import { Footer, FooterConnector, Reveal } from '../features/landing/index.ts'
import { LanguageSwitch, useI18n } from '../shared/i18n/index.ts'

const REPO = 'https://github.com/Juanpacol/TEA-8'

const USES = [1, 2] as const
const STACK = [
  { n: 1, ai: false },
  { n: 2, ai: false },
  { n: 3, ai: false },
  { n: 4, ai: false },
  { n: 5, ai: true },
  { n: 6, ai: false },
] as const
const CHECKS = [1, 2, 3, 4] as const
const RULES = [1, 2, 3, 4, 5, 6] as const

/** How AI was used in this project, laid out like the reference page: big cut-outs, a stat, numbered steps. */
export function AiUsagePage() {
  const { t } = useI18n()
  return (
    <>
      <main className="ai-page" style={{ maxWidth: 820, margin: '0 auto', padding: '0 var(--space-3)' }}>
        <p style={{ margin: 'var(--space-4) 0 var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="#/">&larr; TEA-8</a>
          <LanguageSwitch />
        </p>

        <section className="ai-hero">
          <div className="ai-hero__art ai-hero__art--farmer" aria-hidden="true" />
          <div className="ai-hero__art ai-hero__art--field" aria-hidden="true" />
          <div className="ai-intro">
            <h1>{t('ai.title')}</h1>
            <p>{t('ai.intro')}</p>
          </div>
        </section>

        <Reveal>
          <section className="ai-stat">
            <div className="ai-stat__art" aria-hidden="true" />
            <h2>{t('ai.stat.big')}</h2>
            <p className="ai-stat__sub">{t('ai.stat.sub')}</p>
            <ul className="ai-dots" aria-label={t('ai.stat.dots')}>
              {STACK.map(({ n, ai }) => (
                <li key={n} className={ai ? 'ai-dots__item ai-dots__item--lit' : 'ai-dots__item'}>
                  {t(`ai.stack.${n}.layer`)}
                </li>
              ))}
            </ul>
            <p className="ai-stat__lead">{t('ai.stat.lead')}</p>
          </section>
        </Reveal>

        <Reveal>
          <section className="ai-open ai-bleed">
            <div className="ai-bleed__art ai-bleed__art--orbit" aria-hidden="true" />
            <h2>{t('ai.uses.title')}</h2>
            <ol className="ai-numbered">
              {USES.map((n) => (
                <li key={n}>
                  <h3>{t(`ai.use.${n}.title`)}</h3>
                  <p>{t(`ai.use.${n}.text`)}</p>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        <Reveal>
          <section className="ai-open">
            <h2>{t('ai.stack.title')}</h2>
            <p className="section__note">{t('ai.stack.note')}</p>
            <ul className="stack">
              {STACK.map(({ n, ai }) => (
                <li key={n}>
                  <span className="stack__layer">{t(`ai.stack.${n}.layer`)}</span>
                  <span className="stack__tech">{t(`ai.stack.${n}.tech`)}</span>
                  <span className={`stack__tag${ai ? ' stack__tag--ai' : ''}`}>{t(ai ? 'ai.tag.yes' : 'ai.tag.no')}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <Reveal>
          <section className="ai-open ai-bleed ai-bleed--contain">
            <div className="ai-bleed__art ai-bleed__art--checks" aria-hidden="true" />
            <h2>{t('ai.checks.title')}</h2>
            <ol className="ai-numbered">
              {CHECKS.map((n) => (
                <li key={n}>
                  <h3>{t(`ai.check.${n}.title`)}</h3>
                  <p>{t(`ai.check.${n}.text`)}</p>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>
      </main>

      <FooterConnector>
        <div className="ai-bleed ai-bleed--contain ai-bleed--tail">
          <div className="ai-bleed__art ai-bleed__art--tail" aria-hidden="true" />
          <Reveal>
            <section className="ai-open">
              <h2>{t('ai.rules.title')}</h2>
              <ul className="checklist">
                {RULES.map((n) => (
                  <li key={n}>{t(`ai.rule.${n}`)}</li>
                ))}
              </ul>
            </section>
          </Reveal>

          <Reveal>
            <section className="ai-open ai-open--end">
              <h2>{t('ai.log.title')}</h2>
              <p>{t('ai.log.text')}</p>
              <a className="outline-link" href={`${REPO}/blob/main/CONTRIBUTING.md`}>
                {t('ai.log.button')}
              </a>
            </section>
          </Reveal>
        </div>

        <Footer />
      </FooterConnector>
    </>
  )
}
