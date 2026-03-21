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
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

const statusLabels: Record<string, { label: string; color: string }> = {
  critico: { label: "Crítico", color: "bg-red-100 text-red-700" },
  bajo: { label: "Bajo", color: "bg-amber-100 text-amber-700" },
  ok: { label: "OK", color: "bg-emerald-100 text-emerald-700" },
}

export default function AlmacenPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState("inventario")
  const [materiales, setMateriales] = useState<any[]>([])
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAlmacen() {
      const supabase = createClient()
      const [matRes, movRes] = await Promise.all([
        supabase.from("materiales").select("*").eq("activo", true).order("nombre"),
        supabase.from("movimientos_almacen")
          .select("*, material:materiales(nombre, unidad_medida), responsable:users(nombre), obra:obras(nombre)")
          .order("created_at", { ascending: false })
          .limit(10),
      ])

      if (!matRes.error && matRes.data) {
        setMateriales(matRes.data.map((m: any) => ({
          id: m.id,
          nombre: m.nombre,
          tipo: m.tipo,
          existencia: m.stock_actual,
          unidad: m.unidad_medida,
          minimo: m.stock_minimo,
          precio: m.precio_referencia ? `$${Number(m.precio_referencia).toLocaleString("es-MX")}/${m.unidad_medida}` : "—",
          ubicacion: "Almacén",
          status: m.stock_actual < m.stock_minimo * 0.5 ? "critico" : m.stock_actual < m.stock_minimo ? "bajo" : "ok",
          ultimoMovimiento: "—",
          _stock_actual: m.stock_actual,
          _precio_referencia: m.precio_referencia,
        })))
      }

      if (!movRes.error && movRes.data) {
        setMovimientos(movRes.data.map((mov: any) => ({
          tipo: mov.tipo === "entrada" ? "Entrada" : "Salida",
          material: mov.material?.nombre ?? "—",
          cantidad: `${mov.cantidad} ${mov.material?.unidad_medida ?? ""}`,
          destino: mov.tipo === "entrada"
            ? `Proveedor`
            : mov.obra?.nombre ? `OBR - ${mov.obra.nombre}` : "—",
          fecha: new Date(mov.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
          user: mov.responsable?.nombre?.split(" ").map((n: string) => n[0]).join(". ") ?? "—",
          _tipo_raw: mov.tipo,
          _created_at: mov.created_at,
        })))
      }
      setLoading(false)
    }
    fetchAlmacen()
  }, [])

  const resumen = {
    totalItems: materiales.length,
    valorTotal: `$${materiales.reduce((sum, m) => sum + (m._stock_actual ?? 0) * (m._precio_referencia ?? 0), 0).toLocaleString("es-MX")}`,
    stockCritico: materiales.filter((m) => m.status === "critico").length,
    entradasHoy: movimientos.filter((mov) => {
      if (mov._tipo_raw !== "entrada") return false
      const today = new Date()
      const movDate = new Date(mov._created_at)
      return movDate.toDateString() === today.toDateString()
    }).length,
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4A843]" />
      </div>
    )
  }

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
              {materiales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#7A6D5A]">
                  <Package className="mb-3 h-10 w-10 text-[#D4A843]/40" />
                  <p className="text-sm font-medium">No hay materiales registrados</p>
                  <p className="text-xs">Los materiales aparecerán aquí una vez que se registren.</p>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimientos">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Movimientos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {movimientos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#7A6D5A]">
                  <ArrowUpRight className="mb-3 h-10 w-10 text-[#D4A843]/40" />
                  <p className="text-sm font-medium">Sin movimientos recientes</p>
                  <p className="text-xs">Los movimientos aparecerán aquí conforme se registren.</p>
                </div>
              ) : (
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
                  {movimientos.map((mov, i) => (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
