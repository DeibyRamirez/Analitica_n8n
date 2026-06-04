// Tipos de datos para el Dashboard de Analítica de n8n
// Estos tipos definen la estructura de los datos recibidos desde el flujo de automatización

export interface CorreoIA {
  id: string
  fecha: string
  remitente: string
  tipo_consulta: string
  prioridad: 'alta' | 'media' | 'baja'
  escalado: boolean
  respuesta_ia: string
  razon_escalado: string | null
  seccion_aplicada: string
  created_at: string
}

export interface WebhookPayload {
  fecha: string
  remitente: string
  tipo_consulta: string
  prioridad: 'alta' | 'media' | 'baja'
  escalado: boolean
  respuesta_ia: string
  razon_escalado: string | null
  seccion_aplicada: string
}

export interface ResumenEstadisticas {
  totalCorreos: number
  porcentajeEscalados: number
  tiempoPromedioRespuesta: number
  prioridadPredominante: 'alta' | 'media' | 'baja'
}

export interface ConsultaPorTipo {
  tipo: string
  cantidad: number
}

export interface CorreosPorDia {
  fecha: string
  cantidad: number
}
