# v0-analytics-dashboard

Dashboard de analítica para automatización con n8n, IA y Supabase. El proyecto está basado en Next.js y fue generado con v0.

## Tecnologías

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS.
- UI: componentes propios en `components/ui` y `components/dashboard`.
- Datos: Supabase con SDK modular (`@supabase/ssr` y `@supabase/supabase-js`).
- Gráficas: Recharts.
- Despliegue: Vercel.

## Base de Datos

La estructura de la base vive en [supabase/schema.sql](supabase/schema.sql). El esquema principal es la tabla `correos_ia`, usada por el dashboard y por el webhook de n8n.

## Estructura Principal

- [app/page.tsx](app/page.tsx): ensambla el sidebar y el contenido principal.
- [app/api/correos/route.ts](app/api/correos/route.ts): expone los correos procesados y calcula métricas.
- [app/api/webhooks/n8n/route.ts](app/api/webhooks/n8n/route.ts): recibe los datos del flujo de n8n.
- [components/dashboard](components/dashboard): sidebar, tarjetas, gráficas y tabla.
- [utils/supabase](utils/supabase): clientes de Supabase para browser, servidor y middleware.
- [lib/types.ts](lib/types.ts): tipos compartidos del dashboard.
- [supabase/schema.sql](supabase/schema.sql): SQL de tablas, índices y políticas.

## Variables de Entorno

Copia [.env.example](.env.example) a [.env.local](.env.local) en la raíz del proyecto y completa estas variables si vas a usar Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Instalación y Ejecución

Ruta base del proyecto:

```bash
D:\PROYECTOS VSCODE\v0-analytics-dashboard
```

1. Instalar pnpm si no está disponible:

```bash
npm install -g pnpm
```

2. Instalar dependencias. Ejecutar en:

```bash
D:\PROYECTOS VSCODE\v0-analytics-dashboard
```

```bash
pnpm install
```

3. Levantar el entorno local. Ejecutar en:

```bash
D:\PROYECTOS VSCODE\v0-analytics-dashboard
```

```bash
pnpm dev
```

4. Validar build de producción. Ejecutar en:

```bash
D:\PROYECTOS VSCODE\v0-analytics-dashboard
```

```bash
pnpm build
```

5. Ejecutar en modo producción local. Ejecutar en:

```bash
D:\PROYECTOS VSCODE\v0-analytics-dashboard
```

```bash
pnpm start
```

## Notas

- El proyecto funciona en modo demo si Supabase no está configurado.
- El bloque de navegación del dashboard está organizado por secciones ancladas en la misma página.
- La política de pnpm del repositorio permite compilar `sharp`, necesario para el build de Next en este entorno.
