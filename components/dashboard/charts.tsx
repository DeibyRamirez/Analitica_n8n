'use client'

import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ConsultaPorTipo, CorreosPorDia } from '@/lib/types'

interface ChartsProps {
  consultasPorTipo: ConsultaPorTipo[]
  correosPorDia: CorreosPorDia[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Trunca un string y añade "…" si supera maxLen caracteres */
function truncar(text: string, maxLen = 22): string {
  if (!text) return ''
  const str = String(text)
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}

/** Extrae el nombre limpio del tipo (limpia JSON/objetos si los hay) */
function limpiarTipo(raw: string): string {
  if (!raw) return ''
  const str = String(raw).trim()
  // Si parece JSON o contiene comillas/llaves, intenta parsear
  if (str.startsWith('{') || str.startsWith('"')) {
    try {
      const parsed = JSON.parse(str)
      // Busca campos comunes de nombre
      const nombre =
        parsed?.tipo || parsed?.nombre || parsed?.name || parsed?.categoria || parsed?.category
      if (nombre) return String(nombre)
    } catch {
      // no es JSON válido, continuamos
    }
  }
  return str
}

// ─── Tooltip personalizado ──────────────────────────────────────────────────

function TooltipPersonalizado({
  active,
  payload,
  label,
  unidad = 'items',
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  unidad?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm px-4 py-3 shadow-2xl max-w-[240px]">
        <p className="text-xs font-medium text-muted-foreground mb-1 leading-snug break-words">
          {label}
        </p>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {payload[0].value}
          <span className="text-sm font-normal text-muted-foreground ml-1">{unidad}</span>
        </p>
      </div>
    )
  }
  return null
}

// ─── Custom Y-Axis Tick ─────────────────────────────────────────────────────

interface CustomTickProps {
  x?: number
  y?: number
  payload?: { value: string }
  maxWidth?: number
}

function CustomYAxisTick({ x = 0, y = 0, payload, maxWidth = 160 }: CustomTickProps) {
  if (!payload?.value) return null

  const label = limpiarTipo(payload.value)
  const truncated = truncar(label, 28)
  const needsTooltip = label.length > 28

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{needsTooltip ? label : ''}</title>
      <text
        x={-6}
        y={0}
        dy={4}
        textAnchor="end"
        fontSize={11}
        fontFamily="inherit"
        fill="var(--muted-foreground)"
        style={{ cursor: needsTooltip ? 'help' : 'default' }}
      >
        {truncated}
      </text>
    </g>
  )
}

// ─── Componente principal ───────────────────────────────────────────────────

export function Charts({ consultasPorTipo, correosPorDia }: ChartsProps) {
  // Limpiar tipos antes de pasarlos al gráfico
  const consultasLimpias = consultasPorTipo.map((item) => ({
    ...item,
    tipoLimpio: limpiarTipo(String(item.tipo)),
  }))

  // Formatear fecha para el gráfico de área
  const correosPorDiaFormateados = correosPorDia.map((item) => ({
    ...item,
    fechaCorta: new Date(item.fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    }),
  }))

  // Altura dinámica: mínimo 280px, +32px por cada barra extra sobre 5
  const alturaBarras = Math.max(280, consultasLimpias.length * 44)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* ── Gráfico de Barras – Consultas por Tipo ── */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">
            Consultas por Tipo
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Distribución de consultas según categoría
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0 pr-4">
          {/* Scroll vertical si hay muchas categorías */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 360, paddingLeft: 0 }}
          >
            <div style={{ height: alturaBarras, minHeight: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={consultasLimpias}
                  layout="vertical"
                  margin={{ top: 4, right: 12, bottom: 4, left: 120 }}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.55} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    vertical={true}
                    stroke="var(--border)"
                    opacity={0.25}
                  />

                  {/* Eje X (valores numéricos) */}
                  <XAxis
                    type="number"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />

                  {/* Eje Y con tick personalizado que muestra tipos completos */}
                  <YAxis
                    dataKey="tipoLimpio"
                    type="category"
                    width={140}
                    tick={<CustomYAxisTick maxWidth={132} />}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    content={
                      <TooltipPersonalizado
                        unidad="consultas"
                      />
                    }
                    cursor={{ fill: 'var(--muted)', opacity: 0.08 }}
                  />

                  <Bar
                    dataKey="cantidad"
                    fill="url(#barGradient)"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Gráfico de Área – Flujo de Correos ── */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">
            Flujo de Correos
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Correos procesados por día (últimos 7 días)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={correosPorDiaFormateados}
                margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="var(--chart-2)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.3}
                  vertical={false}
                />

                <XAxis
                  dataKey="fechaCorta"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />

                <YAxis
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                  allowDecimals={false}
                />

                <Tooltip
                  content={<TooltipPersonalizado unidad="correos" />}
                  cursor={{
                    stroke: 'var(--chart-2)',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="cantidad"
                  stroke="var(--chart-2)"
                  strokeWidth={2.5}
                  fill="url(#areaGradient)"
                  dot={{
                    fill: 'hsl(var(--card))',
                    stroke: 'var(--chart-2)',
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    fill: 'var(--chart-2)',
                    stroke: 'hsl(var(--card))',
                    strokeWidth: 2,
                    r: 6,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}