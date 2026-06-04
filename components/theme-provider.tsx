'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Palette = 'mono' | 'blue' | 'green' | 'purple'

interface ThemeContextType {
  palette: Palette
  setPalette: (palette: Palette) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const VALID_PALETTES: Palette[] = ['mono', 'blue', 'green', 'purple']

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPalette] = useState<Palette>('green')

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-palette') as Palette
    const initial = saved && VALID_PALETTES.includes(saved) ? saved : 'green'
    setPalette(initial)
    // Aplica paleta y dark mode al <html>
    document.documentElement.setAttribute('data-palette', initial)
    document.documentElement.classList.add('dark')
  }, [])

  const handleSetPalette = (newPalette: Palette) => {
    setPalette(newPalette)
    document.documentElement.setAttribute('data-palette', newPalette)
    // Mantener dark mode al cambiar paleta
    document.documentElement.classList.add('dark')
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