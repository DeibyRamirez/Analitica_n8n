-- Tabla para almacenar correos procesados por el flujo de IA de n8n
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS correos_ia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  remitente TEXT NOT NULL,
  tipo_consulta TEXT NOT NULL,
  prioridad TEXT NOT NULL CHECK (prioridad IN ('alta', 'media', 'baja')),
  escalado BOOLEAN DEFAULT FALSE,
  respuesta_ia TEXT NOT NULL,
  razon_escalado TEXT,
  seccion_aplicada TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_correos_ia_fecha ON correos_ia(fecha);
CREATE INDEX IF NOT EXISTS idx_correos_ia_prioridad ON correos_ia(prioridad);
CREATE INDEX IF NOT EXISTS idx_correos_ia_escalado ON correos_ia(escalado);
CREATE INDEX IF NOT EXISTS idx_correos_ia_tipo_consulta ON correos_ia(tipo_consulta);
CREATE INDEX IF NOT EXISTS idx_correos_ia_created_at ON correos_ia(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE correos_ia ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública (ajustar según necesidades)
CREATE POLICY "Permitir lectura de correos" ON correos_ia
  FOR SELECT
  USING (true);

-- Política para permitir inserción (para webhooks de n8n)
CREATE POLICY "Permitir inserción de correos" ON correos_ia
  FOR INSERT
  WITH CHECK (true);

-- Comentarios de tabla y columnas
COMMENT ON TABLE correos_ia IS 'Almacena correos procesados por el flujo de automatización de n8n con Ollama y RAG';
COMMENT ON COLUMN correos_ia.fecha IS 'Fecha del correo recibido';
COMMENT ON COLUMN correos_ia.remitente IS 'Email del remitente';
COMMENT ON COLUMN correos_ia.tipo_consulta IS 'Tipo de consulta: Facturación, Soporte Técnico, Devoluciones, Consulta General, etc.';
COMMENT ON COLUMN correos_ia.prioridad IS 'Nivel de prioridad: alta, media, baja';
COMMENT ON COLUMN correos_ia.escalado IS 'Si el correo fue escalado a un agente humano';
COMMENT ON COLUMN correos_ia.respuesta_ia IS 'Respuesta generada por la IA';
COMMENT ON COLUMN correos_ia.razon_escalado IS 'Razón del escalamiento (si aplica)';
COMMENT ON COLUMN correos_ia.seccion_aplicada IS 'Sección del conocimiento aplicada por RAG';

-- Datos de ejemplo para demostración (opcional)
INSERT INTO correos_ia (fecha, remitente, tipo_consulta, prioridad, escalado, respuesta_ia, razon_escalado, seccion_aplicada) VALUES
  ('2026-05-10', 'cliente1@ejemplo.com', 'Facturación', 'alta', false, 'Su factura ha sido procesada correctamente.', null, 'Política de Facturación'),
  ('2026-05-10', 'cliente2@ejemplo.com', 'Soporte Técnico', 'media', true, 'Se requiere asistencia técnica especializada.', 'Problema complejo fuera del alcance de la IA', 'Protocolo de Escalamiento'),
  ('2026-05-09', 'cliente3@ejemplo.com', 'Devoluciones', 'baja', false, 'Su solicitud de devolución ha sido aprobada.', null, 'Política de Devoluciones'),
  ('2026-05-09', 'cliente4@ejemplo.com', 'Consulta General', 'baja', false, 'Gracias por su consulta. Aquí está la información solicitada.', null, 'FAQ General'),
  ('2026-05-08', 'cliente5@ejemplo.com', 'Facturación', 'alta', true, 'Detectamos una discrepancia en su cuenta.', 'Requiere revisión manual de facturación', 'Política de Facturación'),
  ('2026-05-08', 'cliente6@ejemplo.com', 'Soporte Técnico', 'media', false, 'El problema se ha resuelto reiniciando el servicio.', null, 'Guía de Solución de Problemas'),
  ('2026-05-07', 'cliente7@ejemplo.com', 'Devoluciones', 'alta', true, 'Su caso requiere aprobación especial.', 'Monto excede el límite automático', 'Política de Devoluciones'),
  ('2026-05-07', 'cliente8@ejemplo.com', 'Consulta General', 'baja', false, 'Información enviada a su correo electrónico.', null, 'FAQ General'),
  ('2026-05-06', 'cliente9@ejemplo.com', 'Facturación', 'media', false, 'Su pago ha sido confirmado exitosamente.', null, 'Política de Facturación'),
  ('2026-05-06', 'cliente10@ejemplo.com', 'Soporte Técnico', 'alta', true, 'Error crítico detectado en su cuenta.', 'Problema de seguridad identificado', 'Protocolo de Seguridad')
ON CONFLICT DO NOTHING;
