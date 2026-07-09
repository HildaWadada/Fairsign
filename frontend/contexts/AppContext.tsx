'use client'
// frontend/contexts/AppContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Lang } from '@/lib/i18n'

type Theme = 'light' | 'dark'

interface AppContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

const AppContext = createContext<AppContextValue>({
  lang: 'english',
  setLang: () => {},
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('english')
  const [theme, setThemeState] = useState<Theme>('light')

  // Load saved preferences on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as Lang | null
    const savedTheme = localStorage.getItem('app-theme') as Theme | null
    if (savedLang) setLangState(savedLang)
    if (savedTheme) {
      setThemeState(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  function applyTheme(t: Theme) {
    const root = document.documentElement
    if (t === 'dark') {
      root.classList.add('dark')
      root.style.setProperty('--bg', '#0f172a')
      root.style.setProperty('--bg2', '#1e293b')
      root.style.setProperty('--card', '#1e293b')
      root.style.setProperty('--border', '#334155')
      root.style.setProperty('--text', '#f1f5f9')
      root.style.setProperty('--text2', '#94a3b8')
      root.style.setProperty('--primary', '#6366f1')
    } else {
      root.classList.remove('dark')
      root.style.setProperty('--bg', '#f8fafc')
      root.style.setProperty('--bg2', '#ffffff')
      root.style.setProperty('--card', '#ffffff')
      root.style.setProperty('--border', '#e2e8f0')
      root.style.setProperty('--text', '#0f172a')
      root.style.setProperty('--text2', '#64748b')
      root.style.setProperty('--primary', '#6366f1')
    }
  }

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('app-lang', l)
    // RTL support for Arabic
    document.documentElement.dir = 'ltr'
  }

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('app-theme', t)
    applyTheme(t)
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <AppContext.Provider value={{ lang, setLang, theme, setTheme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}

export default AppProvider
