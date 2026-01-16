'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'ib-drpetry-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null

    if (stored) {
      setThemeState(stored)
      applyTheme(stored)
    } else {
      // Fall back to system preference
      const systemPreference = window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
      setThemeState(systemPreference)
      applyTheme(systemPreference)
    }

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply if no stored preference
      if (!localStorage.getItem(STORAGE_KEY)) {
        const newTheme = e.matches ? 'light' : 'dark'
        setThemeState(newTheme)
        applyTheme(newTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === 'light') {
      root.classList.add('light')
    } else {
      root.classList.remove('light')
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)

  // Return default values during SSR/prerendering
  if (context === undefined) {
    return {
      theme: 'dark',
      toggleTheme: () => {},
      setTheme: () => {}
    }
  }

  return context
}
