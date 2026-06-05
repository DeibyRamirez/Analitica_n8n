# Asistente Correo

Dashboard de analítica avanzada para el monitoreo y gestión de correos electrónicos procesados automáticamente mediante **n8n**, **Inteligencia Artificial (Ollama + RAG)** y **Supabase**. El frontend está construido con Next.js y estilizado meticulosamente a través de v0.

---

## 🚀 Tecnologías

El ecosistema del proyecto está compuesto por las siguientes tecnologías:

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **UI & Componentes:** Shadcn/ui adaptado de forma personalizada en `components/ui` y `components/dashboard`
- **Base de Datos & Auth:** Supabase utilizando el SDK modular moderno (`@supabase/ssr` y `@supabase/supabase-js`)
- **Visualización de Datos:** Recharts para gráficos interactivos y dinámicos
- **Despliegue:** Optimizado para Vercel

---

## 📂 Estructura del Proyecto

A continuación se detallan los componentes y directorios principales del repositorio:

| Ruta | Descripción |
|------|-------------|
| `app/page.tsx` | Vista principal del Dashboard. Ensambla la barra lateral y las secciones analíticas. |
| `app/api/correos/route.ts` | API interna que expone los registros procesados de la base de datos y calcula métricas en tiempo real. |
| `app/api/webhooks/n8n/route.ts` | Endpoint (Webhook) encargado de recibir, validar (vía Zod) y limpiar los datos enviados por el flujo de n8n. |
| `components/dashboard/` | Lógica visual modular del sistema: tarjetas de métricas, gráficos de Recharts y tablas de datos. |
| `flujo_n8n/` | Archivos de configuración `.json` que componen el flujo del Asistente de Correos. |
| `utils/supabase/` | Configuración de los clientes de Supabase para Browser, Server Components y Middleware. |
| `lib/types.ts` | Definiciones y tipados estáticos compartidos a lo largo del Dashboard. |
| `supabase/schema.sql` | Estructura SQL, índices de rendimiento y políticas de seguridad (RLS). |

---

## 🤖 Flujo de Automatización (n8n)

Dentro de la carpeta `flujo_n8n/` encontrarás **3 archivos `.json`** listos para ser importados en tu instancia de n8n. Estos nodos estructuran el flujo del **Asistente de Correos**, encargándose de:

1. Recibir y leer los correos entrantes de Gmail.
2. Procesar el texto mediante modelos de lenguaje (LLM) locales con Ollama, enriqueciendo el contexto con técnicas RAG.
3. Clasificar la urgencia/tipo de consulta y generar una respuesta sugerida automáticamente.
4. Notificar los resultados enviando un payload `POST` hacia este Dashboard.

---

## 🗄️ Base de Datos (Supabase)

La persistencia de los datos analíticos se gestiona en Postgres. El archivo de inicialización se encuentra en `supabase/schema.sql`.

El núcleo del almacenamiento reside en la tabla `correos_ia`, la cual cuenta con:

- Políticas **RLS (Row Level Security)** activas para asegurar las inserciones remotas del Webhook y lecturas públicas controladas.
- **Índices optimizados** en campos de alta frecuencia de consulta: `fecha`, `prioridad`, `escalado` y `created_at`.

---

## ⚙️ Variables de Entorno

Copia el archivo `.env.example` a `.env.local` en la raíz del proyecto y completa las credenciales con los datos de tu proyecto de Supabase:

```env
# URL base de tu proyecto Supabase (sin /rest/v1/ al final)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# Llave pública de acceso (anon key)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_anon_key_aqui
```

> ⚠️ **Nota importante:** El SDK de Supabase autocompleta internamente los paths REST. Si añades sufijos de enrutamiento a la URL base, Supabase rechazará las conexiones devolviendo un error HTTP 500 (`Invalid path specified`).

---

## 🛠️ Instalación y Ejecución

Asegúrate de ejecutar los comandos desde la raíz del proyecto.

### 1. Instalar pnpm (si no está instalado globalmente)

```bash
npm install -g pnpm
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Levantar entorno de desarrollo local

```bash
pnpm dev
```

El dashboard estará disponible en [http://localhost:3000](http://localhost:3000).

### 4. Compilar para producción

```bash
pnpm build
```

### 5. Iniciar modo producción en local

```bash
pnpm start
```

---

## 💡 Notas de Interés

- **Modo Demo:** Si las variables de Supabase no están configuradas en el entorno local, el sistema renderizará datos estáticos de demostración para pruebas de interfaz.

- **Navegación Intrapágina:** El menú lateral interactúa directamente mediante anclajes dinámicos optimizados en la misma pantalla.

- **Compilación de Imágenes (`sharp`):** La configuración de dependencias permite compilar de forma nativa la librería `sharp`, indispensable para la optimización y renderizado eficiente de imágenes en Next.js bajo entornos restringidos.