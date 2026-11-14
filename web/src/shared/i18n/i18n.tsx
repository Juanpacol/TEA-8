import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { STORAGE_KEY, initialLang, translator, type Lang, type Translate } from './translate.ts'

type I18n = { lang: Lang; setLang: (lang: Lang) => void; t: Translate }

const Context = createContext<I18n>({ lang: 'en', setLang: () => {}, t: translator('en') })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Not saved: see initialLang.
    }
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  const value = useMemo(() => ({ lang, setLang, t: translator(lang) }), [lang, setLang])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useI18n(): I18n {
  return useContext(Context)
}
