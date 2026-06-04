'use client'

import { Mail, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ResumenEstadisticas } from '@/lib/types'

interface StatsCardsProps {
  resumen: ResumenEstadisticas
}

export function StatsCards({ resumen }: StatsCardsProps) {
  const tarjetas = [
    {
      titulo: 'Total Correos',
      valor: resumen.totalCorreos.toString(),
      descripcion: 'Correos procesados',
      icono: Mail,
      colorIcono: 'text-blue-500',
      colorFondo: 'bg-blue-500/10',
    },
    {
      titulo: 'Casos Escalados',
      valor: `${resumen.porcentajeEscalados}%`,
      descripcion: 'Requieren atención',
      icono: AlertTriangle,
      colorIcono: 'text-amber-500',
      colorFondo: 'bg-amber-500/10',
    },
    {
      titulo: 'Tiempo Promedio',
      valor: `${resumen.tiempoPromedioRespuesta}min`,
      descripcion: 'De respuesta',
      icono: Clock,
      colorIcono: 'text-emerald-500',
      colorFondo: 'bg-emerald-500/10',
    },
    {
      titulo: 'Prioridad Principal',
      valor: resumen.prioridadPredominante.charAt(0).toUpperCase() + resumen.prioridadPredominante.slice(1),
      descripcion: 'Más frecuente',
      icono: TrendingUp,
      colorIcono: resumen.prioridadPredominante === 'alta' 
        ? 'text-red-500' 
        : resumen.prioridadPredominante === 'media' 
          ? 'text-amber-500' 
          : 'text-emerald-500',
      colorFondo: resumen.prioridadPredominante === 'alta' 
        ? 'bg-red-500/10' 
        : resumen.prioridadPredominante === 'media' 
          ? 'bg-amber-500/10' 
          : 'bg-emerald-500/10',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {tarjetas.map((tarjeta) => (
        <Card key={tarjeta.titulo} className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {tarjeta.titulo}
            </CardTitle>
            <div className={`rounded-lg p-2 ${tarjeta.colorFondo}`}>
              <tarjeta.icono className={`h-4 w-4 ${tarjeta.colorIcono}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {tarjeta.valor}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tarjeta.descripcion}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
