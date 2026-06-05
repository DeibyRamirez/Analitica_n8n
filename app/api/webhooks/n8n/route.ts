import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Schema de validación con Zod
const webhookSchema = z.object({
  fecha: z.string().min(1, 'Fecha es requerida'),
  remitente: z.string().min(1, 'Remitente es requerido'),
  tipo_consulta: z.string().min(1, 'Tipo de consulta es requerido'),
  prioridad: z.enum(['alta', 'media', 'baja'], {
    errorMap: () => ({ message: 'Prioridad debe ser: alta, media o baja' })
  }),
  escalado: z.union([z.boolean(), z.string()]).transform(val => {
    if (typeof val === 'boolean') return val
    return val.toLowerCase() === 'true'
  }),
  respuesta_ia: z.string().min(1, 'Respuesta IA es requerida'),
  razon_escalado: z.string().nullable().optional(),
  seccion_aplicada: z.string().min(1, 'Sección aplicada es requerida'),
})

// Función para limpiar y extraer email del remitente
// Maneja formatos como: "Nombre <email@gmail.com>" o simplemente "email@gmail.com"
function limpiarRemitente(remitente: string): { email: string; nombre: string | null } {
  if (!remitente || remitente.trim() === '') {
    return { email: 'sin-especificar@desconocido.com', nombre: null }
  }

  const input = remitente.trim()
  
  // Patrón para "Nombre <email@domain.com>"
  const patronConNombre = /^(.+?)\s*<(.+@.+)>$/
  const matchConNombre = input.match(patronConNombre)
  
  if (matchConNombre) {
    const nombre = matchConNombre[1].trim().replace(/^["']|["']$/g, '')
    const email = matchConNombre[2].trim().toLowerCase()
    return { email, nombre: nombre || null }
  }
  
  // Patrón para solo email
  const patronEmail = /^[\w.+-]+@[\w.-]+\.\w+$/
  if (patronEmail.test(input)) {
    return { email: input.toLowerCase(), nombre: null }
  }
  
  // Si no es un formato reconocido, usar el input como está
  return { email: input, nombre: null }
}

// Crear cliente Supabase para Route Handlers
async function createRouteClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
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
            // Ignorar errores de cookies en Server Components
          }
        },
      },
    }
  )
}

// POST /api/webhooks/n8n
// Recibe datos del flujo de automatización de n8n
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 1. Validar con Zod los datos crudos del webhook
    const resultado = webhookSchema.safeParse(body)
    
    if (!resultado.success) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', detalles: resultado.error.errors },
        { status: 400 }
      )
    }
    
    const payload = resultado.data

    // 2. CORRECCIÓN DE FECHA: Extraer solo 'YYYY-MM-DD' del ISO String para la columna DATE
    const fechaLimpia = payload.fecha.split('T')[0]

    // 3. CORRECCIÓN DE JSON ESCAPADO: Parsear los strings JSON de n8n para extraer el texto plano
    let tipoConsultaLimpio = payload.tipo_consulta
    let respuestaIaLimpia = payload.respuesta_ia

    // Intentamos extraer el valor real de tipo_consulta si viene serializado
    try {
      const objetoConsulta = JSON.parse(payload.tipo_consulta)
      tipoConsultaLimpio = objetoConsulta.tipo || payload.tipo_consulta
    } catch {
      // Si no es un JSON, se queda con el string original
    }

    // Intentamos extraer la "respuesta_sugerida" del JSON de la IA
    try {
      const objetoRespuesta = JSON.parse(payload.respuesta_ia)
      respuestaIaLimpia = objetoRespuesta.respuesta_sugerida || payload.respuesta_ia
    } catch {
      // Si no es un JSON, se queda con el string original
    }

    // 4. CORRECCIÓN DE INCONSISTENCIAS ("N/A")
    // Si razon_escalado es "N/A", lo convertimos a null (ya que en SQL la columna acepta nulos)
    const razonEscaladoLimpia = payload.razon_escalado === 'N/A' ? null : payload.razon_escalado
    
    // Si seccion_aplicada es "N/A" o viene vacía, le dejamos un valor por defecto permitido por el NOT NULL
    const seccionAplicadaLimpia = (!payload.seccion_aplicada || payload.seccion_aplicada === 'N/A') 
      ? 'General / No especificado' 
      : payload.seccion_aplicada

    // Limpiar el remitente con tu función existente
    const { email: emailLimpio, nombre } = limpiarRemitente(payload.remitente)
    const remitenteFormateado = nombre ? `${nombre} (${emailLimpio})` : emailLimpio

    // Crear cliente Supabase e Insertar los datos perfectamente formateados
    const supabase = await createRouteClient()

    const { data, error } = await supabase
      .from('correos_ia')
      .insert([
        {
          fecha: fechaLimpia,                 // Ahora es '2026-06-05' -> Compatible con DATE
          remitente: remitenteFormateado,
          tipo_consulta: tipoConsultaLimpio,   // Ahora es 'queja' -> Texto limpio
          prioridad: payload.prioridad,
          escalado: payload.escalado,
          respuesta_ia: respuestaIaLimpia,     // Ahora es el texto de la respuesta sugerida -> Texto limpio
          razon_escalado: razonEscaladoLimpia, // Ahora es null si no aplica
          seccion_aplicada: seccionAplicadaLimpia, // Cumple con el NOT NULL sin romper lógicas
        },
      ])
      .select('id')
      .single()

    if (error) {
      // Importante: Imprimir el error exacto de Supabase en los logs de tu servidor para auditoría
      console.error('Error detallado de Supabase:', error.message, error.details, error.hint)
      return NextResponse.json(
        { error: 'Error guardando el correo en la base de datos', detalles: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        mensaje: 'Correo procesado correctamente',
        id: data.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error procesando webhook de n8n:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// GET /api/webhooks/n8n
// Verificar que el endpoint está activo
export async function GET() {
  return NextResponse.json({
    status: 'activo',
    mensaje: 'Endpoint de webhook n8n funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '2.0',
  })
}
