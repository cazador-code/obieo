'use client'

import { createContext, useContext, useEffect, useState, useCallback, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Subscribe to theme changes (no-op since we control changes)
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getThemeSnapshot(): Theme {
  const stored = localStorage.getItem('theme') as Theme | null
  if (stored) return stored
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

function getServerSnapshot(): Theme {
  return 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initialTheme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot)
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [mounted, setMounted] = useState(false)

  // Mark as mounted after hydration - intentional setState for hydration sync
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Sync theme to DOM and localStorage when theme changes
  useEffect(() => {
    if (!mounted) return
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
