'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { CorreoIA } from '@/lib/types'

interface DataTableProps {
  data: CorreoIA[]
}

function obtenerTextoLegible(valor: string) {
  const texto = valor.trim()

  if (!texto) {
    return 'Sin dato'
  }

  if ((texto.startsWith('{') && texto.endsWith('}')) || (texto.startsWith('[') && texto.endsWith(']'))) {
    try {
      const parseado = JSON.parse(texto)

      if (typeof parseado === 'string') {
        return parseado
      }

      const candidato =
        parseado.tipo ??
        parseado.tipo_consulta ??
        parseado.consulta ??
        parseado.categoria ??
        parseado.nombre ??
        parseado.seccion_aplicada ??
        parseado.respuesta_sugerida

      if (typeof candidato === 'string' && candidato.trim()) {
        return candidato.trim()
      }
    } catch {
      return texto.replace(/\s+/g, ' ')
    }
  }

  return texto.replace(/\s+/g, ' ')
}

// Columnas de la tabla
const columnas: ColumnDef<CorreoIA>[] = [
  {
    accessorKey: 'fecha',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          Fecha
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const correo = row.original
      const fechaStr = row.getValue('fecha') as string
      // Parsear fecha en formato ISO (YYYY-MM-DD) correctamente sin problemas de zona horaria
      const [year, month, day] = fechaStr.split('-')
      const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      
      // Obtener hora desde created_at
      const fechaCreacion = new Date(correo.created_at)
      const horaStr = fechaCreacion.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      
      return (
        <span className="text-foreground text-sm">
          {fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
          <br />
          <span className="text-xs text-muted-foreground">{horaStr}</span>
        </span>
      )
    },
  },
  {
    accessorKey: 'remitente',
    header: () => <span className="text-muted-foreground">Remitente</span>,
    cell: ({ row }) => (
      <span className="text-foreground font-medium">
        {row.getValue('remitente')}
      </span>
    ),
  },
  {
    accessorKey: 'tipo_consulta',
    header: () => <span className="text-muted-foreground">Tipo</span>,
    cell: ({ row }) => (
      <Badge variant="outline" className="max-w-[220px] font-normal text-foreground">
        <span className="truncate">
          {obtenerTextoLegible(row.getValue('tipo_consulta'))}
        </span>
      </Badge>
    ),
  },
  {
    accessorKey: 'prioridad',
    header: () => <span className="text-muted-foreground">Prioridad</span>,
    cell: ({ row }) => {
      const prioridad = row.getValue('prioridad') as string
      const colores = {
        alta: 'bg-red-500/10 text-red-500 border-red-500/20',
        media: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        baja: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      }
      return (
        <Badge className={colores[prioridad as keyof typeof colores]}>
          {prioridad.charAt(0).toUpperCase() + prioridad.slice(1)}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value === 'todas' || row.getValue(id) === value
    },
  },
  {
    accessorKey: 'escalado',
    header: () => <span className="text-muted-foreground">Estado</span>,
    cell: ({ row }) => {
      const escalado = row.getValue('escalado') as boolean
      return (
        <Badge
          className={
            escalado
              ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
              : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
          }
        >
          {escalado ? 'Escalado' : 'Resuelto'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      if (value === 'todos') return true
      return value === 'escalado' ? row.getValue(id) === true : row.getValue(id) === false
    },
  },
  {
    accessorKey: 'seccion_aplicada',
    header: () => <span className="text-muted-foreground">Sección Aplicada</span>,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {obtenerTextoLegible(row.getValue('seccion_aplicada'))}
      </span>
    ),
  },
]

export function DataTable({ data }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns: columnas,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-foreground">Correos Procesados</CardTitle>
            <CardDescription>
              Últimas consultas procesadas por la IA
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Filtro de Prioridad */}
            <Select
              onValueChange={(value) =>
                table.getColumn('prioridad')?.setFilterValue(value === 'todas' ? '' : value)
              }
              defaultValue="todas"
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro de Estado */}
            <Select
              onValueChange={(value) =>
                table.getColumn('escalado')?.setFilterValue(value === 'todos' ? '' : value)
              }
              defaultValue="todos"
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="escalado">Escalados</SelectItem>
                <SelectItem value="resuelto">Resueltos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-border">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="bg-muted/50 text-muted-foreground">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="border-border"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="align-top">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columnas.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Paginación */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            de {table.getFilteredRowModel().rows.length} registros
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
