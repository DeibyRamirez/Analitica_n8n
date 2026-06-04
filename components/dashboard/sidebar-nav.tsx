'use client'

import * as React from 'react'

import {
  BarChart3,
  Bot,
  Home,
  Mail,
  Settings,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'

// Elementos del menú principal
const menuPrincipal = [
  {
    id: 'panel-principal',
    titulo: 'Panel Principal',
    icono: Home,
  },
  {
    id: 'correos-procesados',
    titulo: 'Correos Procesados',
    icono: Mail,
  },
  {
    id: 'analiticas',
    titulo: 'Analíticas',
    icono: BarChart3,
  },
  {
    id: 'escalamientos',
    titulo: 'Escalamientos',
    icono: AlertTriangle,
  },
]

// Elementos del menú secundario
const menuSecundario = [
  {
    id: 'rendimiento-ia',
    titulo: 'Rendimiento IA',
    icono: TrendingUp,
  },
  {
    id: 'configuracion',
    titulo: 'Configuración',
    icono: Settings,
  },
]

export function SidebarNav() {
  const [seccionActiva, setSeccionActiva] = React.useState('panel-principal')

  React.useEffect(() => {
    const actualizarSeccionActiva = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        setSeccionActiva(hash)
      }
    }

    actualizarSeccionActiva()
    window.addEventListener('hashchange', actualizarSeccionActiva)

    return () => window.removeEventListener('hashchange', actualizarSeccionActiva)
  }, [])

  const navegarASeccion = (seccionId: string) => {
    const destino = document.getElementById(seccionId)

    setSeccionActiva(seccionId)

    destino?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${seccionId}`)
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-foreground">
              n8n Analytics
            </span>
            <span className="text-xs text-muted-foreground">
              Dashboard IA
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuPrincipal.map((item) => (
                <SidebarMenuItem key={item.titulo}>
                  <SidebarMenuButton
                    isActive={seccionActiva === item.id}
                    tooltip={item.titulo}
                    onClick={() => navegarASeccion(item.id)}
                    type="button"
                  >
                    <item.icono className="h-4 w-4" />
                    <span>{item.titulo}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Herramientas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuSecundario.map((item) => (
                <SidebarMenuItem key={item.titulo}>
                  <SidebarMenuButton
                    tooltip={item.titulo}
                    onClick={() => navegarASeccion(item.id)}
                    isActive={seccionActiva === item.id}
                    type="button"
                  >
                    <item.icono className="h-4 w-4" />
                    <span>{item.titulo}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">
            Conectado a n8n
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-foreground">
              Webhook Activo
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
