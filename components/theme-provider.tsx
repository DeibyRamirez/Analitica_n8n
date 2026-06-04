'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Palette = 'mono' | 'blue' | 'green' | 'purple'

interface ThemeContextType {
  palette: Palette
  setPalette: (palette: Palette) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPalette] = useState<Palette>('blue')

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-palette') as Palette
    if (saved && ['mono', 'blue', 'green', 'purple'].includes(saved)) {
      setPalette(saved)
      document.documentElement.setAttribute('data-palette', saved)
    } else {
      document.documentElement.setAttribute('data-palette', 'blue')
    }
  }, [])

  const handleSetPalette = (newPalette: Palette) => {
    setPalette(newPalette)
    document.documentElement.setAttribute('data-palette', newPalette)
    localStorage.setItem('dashboard-palette', newPalette)
  }

  return (
    <ThemeContext.Provider value={{ palette, setPalette: handleSetPalette }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}