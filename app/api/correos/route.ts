import { NextResponse } from 'next/server'
import type {
  ResumenEstadisticas,
  ConsultaPorTipo,
  CorreosPorDia,
  CorreoIA,
} from '@/lib/types'

// Función para limpiar y estandarizar tipos de consulta
function limpiarTipo(raw: string): string {
  if (!raw) return 'Sin especificar'
  const str = String(raw).trim()
  
  // Si parece JSON o contiene comillas/llaves, intenta parsear
  if (str.startsWith('{') || str.startsWith('"')) {
    try {
      const parsed = JSON.parse(str)
      // Busca campos comunes de nombre
      const nombre =
        parsed?.tipo || parsed?.nombre || parsed?.name || parsed?.categoria || parsed?.category
      if (nombre) return String(nombre).trim()
    } catch {
      // Si el JSON es inválido, intenta extraer un valor entre comillas
      const match = str.match(/"([^"]+)"\s*:\s*"([^"]+)"/)
      if (match && match[2]) {
        return String(match[2]).trim()
      }
      // Si aún así falla, busca cualquier texto entre comillas
      const simpleMatch = str.match(/"([^"]+)"/)
      if (simpleMatch && simpleMatch[1]) {
        return String(simpleMatch[1]).trim()
      }
    }
  }
  return str
}

function obtenerFechaLocal(valor: string): string {
  const fecha = new Date(valor)

  if (Number.isNaN(fecha.getTime())) {
    return valor.slice(0, 10)
  }

  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function obtenerFechaLocalHoyBase(fechaBase: Date): string {
  const year = fechaBase.getFullYear()
  const month = String(fechaBase.getMonth() + 1).padStart(2, '0')
  const day = String(fechaBase.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function generarUltimos7DiasHastaHoy(): string[] {
  const hoy = new Date()
  const dias: string[] = []

  for (let offset = 6; offset >= 0; offset -= 1) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() - offset)
    dias.push(obtenerFechaLocalHoyBase(fecha))
  }

  return dias
}

// Datos de demostración cuando Supabase no está configurado
const DEMO_DATA: CorreoIA[] = [
  {
    id: '1',
    fecha: '2026-05-06',
    remitente: 'cliente9@ejemplo.com',
    tipo_consulta: 'Facturación',
    prioridad: 'media',
    escalado: false,
    respuesta_ia: 'Su pago ha sido confirmado exitosamente.',
    razon_escalado: null,
    seccion_aplicada: 'pagos',
    created_at: '2026-05-06T10:00:00Z',
  },
  {
    id: '2',
    fecha: '2026-05-09',
    remitente: 'cliente3@ejemplo.com',
    tipo_consulta: 'Devoluciones',
    prioridad: 'baja',
    escalado: false,
    respuesta_ia: 'Su solicitud de devolución ha sido aprobada.',
    razon_escalado: null,
    seccion_aplicada: 'devoluciones',
    created_at: '2026-05-09T10:00:00Z',
  },
  {
    id: '3',
    fecha: '2026-05-07',
    remitente: 'cliente8@ejemplo.com',
    tipo_consulta: 'Consulta General',
    prioridad: 'baja',
    escalado: false,
    respuesta_ia: 'Información enviada a su correo electrónico.',
    razon_escalado: null,
    seccion_aplicada: 'general',
    created_at: '2026-05-07T10:00:00Z',
  },
  {
    id: '4',
    fecha: '2026-05-10',
    remitente: 'cliente2@ejemplo.com',
    tipo_consulta: 'Soporte Técnico',
    prioridad: 'media',
    escalado: true,
    respuesta_ia: 'Se requiere asistencia técnica especializada.',
    razon_escalado: 'Problema complejo requiere intervención humana',
    seccion_aplicada: 'soporte',
    created_at: '2026-05-10T10:00:00Z',
  },
  {
    id: '5',
    fecha: '2026-05-06',
    remitente: 'cliente10@ejemplo.com',
    tipo_consulta: 'Soporte Técnico',
    prioridad: 'alta',
    escalado: true,
    respuesta_ia: 'Error crítico detectado en su cuenta.',
    razon_escalado: 'Error crítico del sistema',
    seccion_aplicada: 'soporte',
    created_at: '2026-05-06T11:00:00Z',
  },
  {
    id: '6',
    fecha: '2026-05-08',
    remitente: 'cliente6@ejemplo.com',
    tipo_consulta: 'Soporte Técnico',
    prioridad: 'media',
    escalado: false,
    respuesta_ia: 'El problema se ha resuelto reiniciando el servicio.',
    razon_escalado: null,
    seccion_aplicada: 'soporte',
    created_at: '2026-05-08T10:00:00Z',
  },
  {
    id: '7',
    fecha: '2026-05-08',
    remitente: 'cliente5@ejemplo.com',
    tipo_consulta: 'Facturación',
    prioridad: 'alta',
    escalado: true,
    respuesta_ia: 'Detectamos una discrepancia en su cuenta.',
    razon_escalado: 'Discrepancia financiera detectada',
    seccion_aplicada: 'facturacion',
    created_at: '2026-05-08T11:00:00Z',
  },
  {
    id: '8',
    fecha: '2026-05-09',
    remitente: 'cliente4@ejemplo.com',
    tipo_consulta: 'Consulta General',
    prioridad: 'baja',
    escalado: false,
    respuesta_ia: 'Gracias por su consulta. Aquí está la información solicitada.',
    razon_escalado: null,
    seccion_aplicada: 'general',
    created_at: '2026-05-09T11:00:00Z',
  },
  {
    id: '9',
    fecha: '2026-05-07',
    remitente: 'cliente7@ejemplo.com',
    tipo_consulta: 'Devoluciones',
    prioridad: 'alta',
    escalado: true,
    respuesta_ia: 'Su caso requiere aprobación especial.',
    razon_escalado: 'Monto de devolución excede el límite',
    seccion_aplicada: 'devoluciones',
    created_at: '2026-05-07T11:00:00Z',
  },
  {
    id: '10',
    fecha: '2026-05-10',
    remitente: 'cliente1@ejemplo.com',
    tipo_consulta: 'Facturación',
    prioridad: 'alta',
    escalado: false,
    respuesta_ia: 'Su factura ha sido procesada correctamente.',
    razon_escalado: null,
    seccion_aplicada: 'facturacion',
    created_at: '2026-05-10T11:00:00Z',
  },
]

function calcularEstadisticas(correosData: CorreoIA[]) {
  const totalCorreos = correosData.length
  const correosEscalados = correosData.filter((c) => c.escalado).length
  const porcentajeEscalados =
    totalCorreos > 0 ? Math.round((correosEscalados / totalCorreos) * 100) : 0

  const tiempoPromedioRespuesta = 2.5

  const contadorPrioridades = correosData.reduce(
    (acc, c) => {
      acc[c.prioridad]++
      return acc
    },
    { alta: 0, media: 0, baja: 0 }
  )

  const prioridadPredominante =
    totalCorreos > 0
      ? (
          Object.entries(contadorPrioridades) as [
            'alta' | 'media' | 'baja',
            number,
          ][]
        ).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
      : 'baja'

  const resumen: ResumenEstadisticas = {
    totalCorreos,
    porcentajeEscalados,
    tiempoPromedioRespuesta,
    prioridadPredominante,
  }

  const consultasPorTipoMap = correosData.reduce(
    (acc, c) => {
      const tipoLimpio = limpiarTipo(c.tipo_consulta)
      acc[tipoLimpio] = (acc[tipoLimpio] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const consultasPorTipo: ConsultaPorTipo[] = Object.entries(
    consultasPorTipoMap
  ).map(([tipo, cantidad]) => ({
    tipo,
    cantidad,
  }))
  .sort((a, b) => b.cantidad - a.cantidad)

  const correosPorDiaMap = correosData.reduce(
    (acc, c) => {
      const fecha = obtenerFechaLocal(c.created_at || c.fecha)
      acc[fecha] = (acc[fecha] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const ultimos7Dias = generarUltimos7DiasHastaHoy()
  const correosPorDia: CorreosPorDia[] = ultimos7Dias.map((fecha) => ({
    fecha,
    cantidad: correosPorDiaMap[fecha] || 0,
  }))

  return { resumen, consultasPorTipo, correosPorDia }
}

// GET /api/correos
export async function GET() {
  try {
    // Verificar si Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    let correosData: CorreoIA[] = DEMO_DATA

    if (supabaseUrl && supabaseKey) {
      // Usar Supabase si está configurado
      const { createServerClient } = await import('@supabase/ssr')
      const { cookies } = await import('next/headers')
      
      const cookieStore = await cookies()
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignorar errores de cookies
            }
          },
        },
      })

      const { data: correos, error } = await supabase
        .from('correos_ia')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && correos) {
        correosData = correos
      }
    }

    const { resumen, consultasPorTipo, correosPorDia } = calcularEstadisticas(correosData)

    return NextResponse.json({
      correos: correosData,
      resumen,
      consultasPorTipo,
      correosPorDia,
      isDemo: !supabaseUrl || !supabaseKey,
    })
  } catch (error) {
    console.error('Error obteniendo correos:', error)
    
    // Fallback a datos de demo en caso de error
    const { resumen, consultasPorTipo, correosPorDia } = calcularEstadisticas(DEMO_DATA)
    
    return NextResponse.json({
      correos: DEMO_DATA,
      resumen,
      consultasPorTipo,
      correosPorDia,
      isDemo: true,
    })
  }
}
