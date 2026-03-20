"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Download,
  Warehouse,
  ArrowUpRight,
} from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const resumen = {
  totalItems: 148,
  valorTotal: "$4,250,000",
  stockCritico: 8,
  entradasHoy: 12,
}

const materiales = [
  {
    id: "MAT-001",
    nombre: "Mármol Carrara White",
    tipo: "Mármol Natural",
    existencia: 20,
    unidad: "m²",
    minimo: 50,
    precio: "$2,800/m²",
    ubicacion: "Nave A - Rack 1",
    status: "critico",
    ultimoMovimiento: "18 Mar 2026",
  },
  {
    id: "MAT-002",
    nombre: "Ocean Blue Quartz",
    tipo: "Cuarzo",
    existencia: 12,
    unidad: "m²",
    minimo: 30,
    precio: "$3,200/m²",
    ubicacion: "Nave A - Rack 3",
    status: "critico",
    ultimoMovimiento: "17 Mar 2026",
  },
  {
    id: "MAT-003",
    nombre: "Emperador Dark",
    tipo: "Mármol Natural",
    existencia: 35,
    unidad: "m²",
    minimo: 40,
    precio: "$2,400/m²",
    ubicacion: "Nave B - Rack 1",
    status: "bajo",
    ultimoMovimiento: "16 Mar 2026",
  },
  {
    id: "MAT-004",
    nombre: "Granito Negro Absoluto",
    tipo: "Granito",
    existencia: 8,
    unidad: "m²",
    minimo: 25,
    precio: "$1,900/m²",
    ubicacion: "Nave B - Rack 4",
    status: "critico",
    ultimoMovimiento: "18 Mar 2026",
  },
  {
    id: "MAT-005",
    nombre: "Crema Maya",
    tipo: "Mármol Regional",
    existencia: 45,
    unidad: "m²",
    minimo: 60,
    precio: "$1,200/m²",
    ubicacion: "Nave A - Rack 2",
    status: "bajo",
    ultimoMovimiento: "15 Mar 2026",
  },
  {
    id: "MAT-006",
    nombre: "Travertino Romano",
    tipo: "Travertino",
    existencia: 85,
    unidad: "m²",
    minimo: 40,
    precio: "$2,100/m²",
    ubicacion: "Nave C - Rack 1",
    status: "ok",
    ultimoMovimiento: "18 Mar 2026",
  },
  {
    id: "MAT-007",
    nombre: "Onyx Honey",
    tipo: "Ónix",
    existencia: 6,
    unidad: "m²",
    minimo: 10,
    precio: "$8,500/m²",
    ubicacion: "Nave A - Especial",
    status: "critico",
    ultimoMovimiento: "14 Mar 2026",
  },
  {
    id: "MAT-008",
    nombre: "Calacatta Gold",
    tipo: "Mármol Natural",
    existencia: 28,
    unidad: "m²",
    minimo: 20,
    precio: "$5,600/m²",
    ubicacion: "Nave A - Rack 5",
    status: "ok",
    ultimoMovimiento: "17 Mar 2026",
  },
  {
    id: "MAT-009",
    nombre: "Silestone Blanco Zeus",
    tipo: "Cuarzo Compacto",
    existencia: 62,
    unidad: "m²",
    minimo: 30,
    precio: "$3,400/m²",
    ubicacion: "Nave C - Rack 2",
    status: "ok",
    ultimoMovimiento: "18 Mar 2026",
  },
  {
    id: "MAT-010",
    nombre: "Piedra Conchuela",
    tipo: "Piedra Natural",
    existencia: 120,
    unidad: "m²",
    minimo: 50,
    precio: "$650/m²",
    ubicacion: "Patio Exterior",
    status: "ok",
    ultimoMovimiento: "16 Mar 2026",
  },
]

const movimientosRecientes = [
  { tipo: "Salida", material: "Carrara White", cantidad: "12 m²", destino: "OBR-001 Las Nubes", fecha: "18 Mar", user: "A. Nah" },
  { tipo: "Salida", material: "Negro Absoluto", cantidad: "8 m²", destino: "OBR-003 Torre Corp.", fecha: "18 Mar", user: "A. Nah" },
  { tipo: "Entrada", material: "Travertino Romano", cantidad: "40 m²", destino: "Proveedor: Mármoles del Valle", fecha: "18 Mar", user: "A. Nah" },
  { tipo: "Salida", material: "Crema Maya", cantidad: "6 m²", destino: "OBR-005 Montejo 480", fecha: "17 Mar", user: "L. Balam" },
  { tipo: "Entrada", material: "Silestone Blanco", cantidad: "25 m²", destino: "Proveedor: Cosentino MX", fecha: "17 Mar", user: "A. Nah" },
]

const statusLabels: Record<string, { label: string; color: string }> = {
  critico: { label: "Crítico", color: "bg-red-100 text-red-700" },
  bajo: { label: "Bajo", color: "bg-amber-100 text-amber-700" },
  ok: { label: "OK", color: "bg-emerald-100 text-emerald-700" },
}

export default function AlmacenPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState("inventario")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Almacén &amp; Inventario</h1>
          <p className="mt-1 text-sm text-[#7A6D5A]">
            Control de existencias y movimientos de materiales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast({ title: "Exportando reporte...", description: "El archivo se descargará en breve." })}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="gap-2 bg-[#D4A843] text-white hover:bg-[#C49A3A]" onClick={() => toast({ title: "Próximamente", description: "Esta funcionalidad estará disponible pronto." })}>
            <Plus className="h-4 w-4" />
            Registrar Entrada
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAF9F7]">
              <Package className="h-5 w-5 text-[#D4A843]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{resumen.totalItems}</p>
              <p className="text-xs text-[#7A6D5A]">Total Ítems</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAF9F7]">
              <Warehouse className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{resumen.valorTotal}</p>
              <p className="text-xs text-[#7A6D5A]">Valor en Inventario</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{resumen.stockCritico}</p>
              <p className="text-xs text-[#7A6D5A]">Stock Crítico</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingUp className="h-5 w-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{resumen.entradasHoy}</p>
              <p className="text-xs text-[#7A6D5A]">Entradas Hoy</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos Recientes</TabsTrigger>
        </TabsList>

        <TabsContent value="inventario">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Materiales en Stock</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7A6D5A]" />
                    <input
                      type="text"
                      placeholder="Buscar material..."
                      className="h-8 w-56 rounded-lg border border-[#E0DBD1] bg-[#FAF9F7] pl-8 pr-3 text-xs focus:border-[#D4A843] focus:outline-none"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Filter className="h-3.5 w-3.5" />
                    Filtrar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Existencia</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materiales.map((mat) => {
                    const st = statusLabels[mat.status]
                    const pct = Math.min((mat.existencia / mat.minimo) * 100, 100)
                    return (
                      <TableRow key={mat.id}>
                        <TableCell className="font-mono text-xs text-[#7A6D5A]">
                          {mat.id}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-[#1E1A14]">{mat.nombre}</p>
                          <p className="text-[10px] text-[#7A6D5A]">Últ. mov: {mat.ultimoMovimiento}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {mat.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{mat.existencia}</span>
                          <span className="text-[#7A6D5A]"> {mat.unidad}</span>
                        </TableCell>
                        <TableCell className="text-sm text-[#7A6D5A]">
                          {mat.minimo} {mat.unidad}
                        </TableCell>
                        <TableCell className="text-sm font-medium">{mat.precio}</TableCell>
                        <TableCell className="text-sm text-[#7A6D5A]">{mat.ubicacion}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-12 rounded-full bg-[#F0EDE8]">
                              <div
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor:
                                    mat.status === "critico"
                                      ? "#EF4444"
                                      : mat.status === "bajo"
                                      ? "#F59E0B"
                                      : "#22C55E",
                                }}
                              />
                            </div>
                            <Badge className={st.color + " text-[10px]"}>{st.label}</Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimientos">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Movimientos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Destino / Origen</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Registró</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientosRecientes.map((mov, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Badge
                          className={
                            mov.tipo === "Entrada"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }
                        >
                          {mov.tipo === "Entrada" ? (
                            <TrendingUp className="mr-1 h-3 w-3" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3" />
                          )}
                          {mov.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{mov.material}</TableCell>
                      <TableCell>{mov.cantidad}</TableCell>
                      <TableCell className="text-sm text-[#7A6D5A]">{mov.destino}</TableCell>
                      <TableCell className="text-sm">{mov.fecha}</TableCell>
                      <TableCell className="text-sm text-[#7A6D5A]">{mov.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
