import { en, type MessageKey } from './messages/en.ts'
import { es } from './messages/es.ts'

export type Lang = 'en' | 'es'
export type Params = Record<string, string | number>
/** Looks a message up by key and fills its {placeholders}. */
export type Translate = (key: MessageKey, params?: Params) => string

const DICTIONARIES: Record<Lang, Record<MessageKey, string>> = { en, es }
export const STORAGE_KEY = 'tea8_lang'

export function translator(lang: Lang): Translate {
  const messages = DICTIONARIES[lang]
  return (key, params) =>
    params === undefined ? messages[key] : messages[key].replace(/\{(\w+)\}/g, (whole, name: string) => String(params[name] ?? whole))
}

/** The saved choice, else the language of the browser (Spanish or English), else English. */
export function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'es') return saved
  } catch {
    // Storage can be blocked: the choice then lasts for this visit only.
  }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}


/** A crop of the data file ("Corn", "small grain") in the chosen language, in lower case; a name it does not know stays as written. */
export function cropName(t: Translate, crop: string): string {
  const key = `crop.${crop.toLowerCase()}` as MessageKey
  return key in en ? t(key) : crop
}

/** "Point A" of the data file as "Point A" or "Punto A". */
export function pointName(t: Translate, label: string): string {
  return t('point.name', { letter: label.replace(/^Point\s+/, '') })
}

/** The text with only its first letter in capitals. */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
