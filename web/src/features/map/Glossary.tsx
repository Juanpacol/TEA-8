import { useI18n } from '../../shared/i18n/index.ts'
import type { MessageKey } from '../../shared/i18n/index.ts'
import './map.css'

const TERMS: { term: MessageKey; meaning: MessageKey }[] = [
  { term: 'glossary.ndvi', meaning: 'glossary.ndvi.text' },
  { term: 'glossary.wetness', meaning: 'glossary.wetness.text' },
  { term: 'glossary.satellite', meaning: 'glossary.satellite.text' },
  { term: 'glossary.uncertainty', meaning: 'glossary.uncertainty.text' },
]

/** Plain meanings of the words the tool uses. Shown next to the map, where they first appear. */
export function Glossary() {
  const { t } = useI18n()
  return (
    <details className="glossary">
      <summary>{t('glossary.title')}</summary>
      <dl>
        {TERMS.map(({ term, meaning }) => (
          <div key={term}>
            <dt>{t(term)}</dt>
            <dd>{t(meaning)}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
