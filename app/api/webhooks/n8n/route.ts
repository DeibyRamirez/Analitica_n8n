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
    
    // Validar con Zod
    const resultado = webhookSchema.safeParse(body)
    
    if (!resultado.success) {
      const errores = resultado.error.errors.map(e => ({
        campo: e.path.join('.'),
        mensaje: e.message
      }))
      
      return NextResponse.json(
        { 
          error: 'Datos de entrada inválidos',
          detalles: errores
        },
        { status: 400 }
      )
    }
    
    const payload = resultado.data

    // Limpiar el remitente
    const { email: emailLimpio, nombre } = limpiarRemitente(payload.remitente)
    const remitenteFormateado = nombre ? `${nombre} (${emailLimpio})` : emailLimpio

    // Crear cliente Supabase
    const supabase = await createRouteClient()

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('correos_ia')
      .insert([
        {
          fecha: payload.fecha,
          remitente: remitenteFormateado,
          tipo_consulta: payload.tipo_consulta || 'Sin especificar',
          prioridad: payload.prioridad,
          escalado: payload.escalado,
          respuesta_ia: payload.respuesta_ia || 'Sin respuesta',
          razon_escalado: payload.razon_escalado || null,
          seccion_aplicada: payload.seccion_aplicada || 'Sin especificar',
        },
      ])
      .select('id')
      .single()

    if (error) {
      console.error('Error insertando en Supabase:', error)
      return NextResponse.json(
        { error: 'Error guardando el correo en la base de datos' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        mensaje: 'Correo procesado correctamente',
        id: data.id,
        remitente_procesado: remitenteFormateado,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error procesando webhook de n8n:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
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
