import { createContext, useContext, useState } from 'react'
import { en } from './en'
import { es } from './es'

export type Lang = 'en' | 'es'

type Dict = typeof en
const dicts: Record<Lang, Dict> = { en, es }

interface I18nCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: keyof Dict, params?: Record<string, string>) => string
}

const I18nContext = createContext<I18nCtx>({
  lang: 'en',
  setLang: () => {},
  t: (key) => String(key),
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  function t(key: keyof Dict, params?: Record<string, string>): string {
    const template: string = dicts[lang][key] ?? dicts.en[key]
    if (!params) return template
    return template.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`)
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
