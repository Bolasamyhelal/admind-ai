"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export type Language = "ar" | "en"

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  dir: "rtl" | "ltr"
}

const LanguageContext = createContext<LanguageContextType>({ lang: "ar", setLang: () => {}, dir: "rtl" })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("ar")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("admind-lang") as Language | null
    if (stored === "en" || stored === "ar") setLangState(stored)
    setMounted(true)
  }, [])

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem("admind-lang", newLang)
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = newLang
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
      document.documentElement.lang = lang
    }
  }, [lang, mounted])

  if (!mounted) return <>{children}</>

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
