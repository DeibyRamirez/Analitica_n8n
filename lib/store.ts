// Funciones de acceso a datos con Supabase
// Tabla: correos_ia

import { createClient } from '@/utils/supabase/client'
import type { CorreoIA, WebhookPayload } from './types'

// Obtener todos los correos ordenados por fecha
export async function obtenerCorreos(): Promise<CorreoIA[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('correos_ia')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error obteniendo correos:', error)
    return []
  }

  return data || []
}

// Agregar un nuevo correo
export async function agregarCorreo(payload: WebhookPayload): Promise<{ id: string } | null> {
  const supabase = createClient()

  const nuevoCorreo = {
    fecha: payload.fecha,
    remitente: payload.remitente,
    tipo_consulta: payload.tipo_consulta,
    prioridad: payload.prioridad,
    escalado: Boolean(payload.escalado),
    respuesta_ia: payload.respuesta_ia,
    razon_escalado: payload.razon_escalado || null,
    seccion_aplicada: payload.seccion_aplicada,
  }

  const { data, error } = await supabase
    .from('correos_ia')
    .insert([nuevoCorreo])
    .select('id')
    .single()

  if (error) {
    console.error('Error agregando correo:', error)
    return null
  }

  return data
}

// Generar ID único (fallback para casos sin Supabase)
export function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
