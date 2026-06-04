'use client'

import { Palette } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

const palettes = [
  { id: 'mono', name: 'Monocromático', icon: '⚫' },
  { id: 'blue', name: 'Azul Profesional', icon: '🔵' },
  { id: 'green', name: 'Verde Ejecutivo', icon: '🟢' },
  { id: 'purple', name: 'Púrpura Creativo', icon: '🟣' }
] as const

export default function PaletteSelector() {
  const { palette, setPalette } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">🎨</span>
      <select
        value={palette}
        onChange={(e) => setPalette(e.target.value as any)}
        className="bg-background border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {palettes.map((p) => (
          <option key={p.id} value={p.id}>
            {p.icon} {p.name}
          </option>
        ))}
      </select>
    </div>
  )
}