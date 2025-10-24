"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { Locale, defaultLocale } from "@/lib/i18n"

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

const STORAGE_KEY = "app_locale"

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const saved = (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY)) as Locale | null
    if (saved && (["en","pt","es"] as Locale[]).includes(saved)) {
      setLocaleState(saved)
      if (typeof document !== "undefined") document.documentElement.lang = saved
    } else {
      if (typeof document !== "undefined") document.documentElement.lang = defaultLocale
    }
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l)
    if (typeof document !== "undefined") document.documentElement.lang = l
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}