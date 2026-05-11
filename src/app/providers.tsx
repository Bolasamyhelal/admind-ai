"use client"

import { type ReactNode } from "react"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { LanguageProvider } from "@/context/language-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
