'use client'

import useSWR from 'swr'
import { RefreshCw } from 'lucide-react'

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StatsCards } from './stats-cards'
import { Charts } from './charts'
import { DataTable } from './data-table'
import type {
  CorreoIA,
  ResumenEstadisticas,
  ConsultaPorTipo,
  CorreosPorDia,
} from '@/lib/types'
import PaletteSelector from '../ui/cambio-paleta'
import PaletteDebug  from '../ui/PaletteDebug'

interface DashboardData {
  correos: CorreoIA[]
  resumen: ResumenEstadisticas
  consultasPorTipo: ConsultaPorTipo[]
  correosPorDia: CorreosPorDia[]
  isDemo: boolean
}

// Fetcher para SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Componente de carga
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-lg" />
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[400px] rounded-lg" />
        <Skeleton className="h-[400px] rounded-lg" />
      </div>
      {/* Table skeleton */}
      <Skeleton className="h-[500px] rounded-lg" />
    </div>
  )
}

export function DashboardContent() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    '/api/correos',
    fetcher,
    {
      refreshInterval: 30000, // Actualizar cada 30 segundos
      revalidateOnFocus: true,
    }
  )

  const correosEscalados = data?.correos.filter((correo) => correo.escalado) ?? []
  const correosResueltos = data ? data.correos.length - correosEscalados.length : 0
  const respuestasRecientes = correosEscalados.slice(0, 3)

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Dashboard de Analítica
            </h1>
            <p className="text-sm text-muted-foreground">
              Automatización n8n + IA (Ollama + RAG)
            </p>
          </div>
          
          <PaletteSelector/>
            
          <PaletteDebug/>


          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500">
            Error al cargar los datos. Por favor, intenta de nuevo.
          </div>
        )}

        {isLoading && <LoadingSkeleton />}

        {data && !isLoading && (
          <div className="space-y-6">
            <section id="panel-principal" className="scroll-mt-24 space-y-6">
              <StatsCards resumen={data.resumen} />
            </section>

            <section id="analiticas" className="scroll-mt-24 space-y-6">
              <Charts
                consultasPorTipo={data.consultasPorTipo}
                correosPorDia={data.correosPorDia}
              />
            </section>

            <section id="escalamientos" className="scroll-mt-24 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Escalados activos</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {correosEscalados.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Casos que requieren atención humana.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Resueltos automáticamente</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {correosResueltos}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Correos cerrados sin intervención manual.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Últimos motivos</p>
                    <div className="mt-2 space-y-2 text-sm text-foreground">
                      {respuestasRecientes.length ? (
                        respuestasRecientes.map((correo) => (
                          <div key={correo.id} className="rounded-md border border-border/50 bg-muted/30 px-3 py-2">
                            <p className="font-medium">{correo.tipo_consulta}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {correo.razon_escalado || correo.respuesta_ia}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Todavía no hay casos escalados.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section id="correos-procesados" className="scroll-mt-24 space-y-6">
              <DataTable data={data.correos} />
            </section>

            <section id="rendimiento-ia" className="scroll-mt-24">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Rendimiento IA</CardTitle>
                  <CardDescription>
                    Indicadores operativos del motor de automatización.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Tiempo promedio</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {data.resumen.tiempoPromedioRespuesta} min
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Prioridad predominante</p>
                    <p className="mt-2 text-2xl font-bold capitalize text-foreground">
                      {data.resumen.prioridadPredominante}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Actualización</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">30 s</p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="configuracion" className="scroll-mt-24">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Configuración</CardTitle>
                  <CardDescription>
                    Estado de conexión y notas rápidas del entorno.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Base de datos</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {data.isDemo ? 'Modo demo' : 'Supabase conectado'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rapidez de respuesta y persistencia de datos garantizadas.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Rutas activas</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      /api/correos y /api/webhooks/n8n
                    </p>
                    <p className="text-xs text-muted-foreground">
                      El tablero refresca cada 30 segundos y mantiene sincronía con n8n.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </main>
    </SidebarInset>

    
  )
}
