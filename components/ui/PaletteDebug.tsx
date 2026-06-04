'use client'

import { useTheme } from '@/components/theme-provider'

export default function PaletteDebug() {
  const { palette } = useTheme()
  
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-black/80 px-3 py-1 text-xs text-white font-mono">
      🎨 Paleta: {palette}
    </div>
  )
}