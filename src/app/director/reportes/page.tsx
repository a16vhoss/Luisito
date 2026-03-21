"use client"

import { useState, useEffect } from "react"
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
import {
  FileBarChart,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  FileText,
  Clock,
  Filter,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

const reportesDisponibles = [
  {
    id: "RPT-001",
    nombre: "Reporte de Producción Semanal",
    descripcion: "M² procesados, piezas cortadas, eficiencia por máquina",
    tipo: "Producción",
    frecuencia: "Semanal",
    ultimaGeneracion: "17 Mar 2026",
    icon: BarChart3,
  },
  {
    id: "RPT-002",
    nombre: "Estado Financiero Mensual",
    descripcion: "Ingresos, egresos, utilidad, cuentas por cobrar",
    tipo: "Finanzas",
    frecuencia: "Mensual",
    ultimaGeneracion: "01 Mar 2026",
    icon: PieChart,
  },
  {
    id: "RPT-003",
    nombre: "Avance de Obras",
    descripcion: "Progreso por obra, semáforo, desviaciones de programa",
    tipo: "Operaciones",
    frecuencia: "Semanal",
    ultimaGeneracion: "17 Mar 2026",
    icon: TrendingUp,
  },
  {
    id: "RPT-004",
    nombre: "Control de Asistencia",
    descripcion: "Asistencia, retardos, faltas, horas extra por empleado",
    tipo: "RRHH",
    frecuencia: "Quincenal",
    ultimaGeneracion: "15 Mar 2026",
    icon: Clock,
  },
  {
    id: "RPT-005",
    nombre: "Inventario y Movimientos",
    descripcion: "Existencias, entradas, salidas, stock crítico",
    tipo: "Almacén",
    frecuencia: "Semanal",
    ultimaGeneracion: "17 Mar 2026",
    icon: FileText,
  },
  {
    id: "RPT-006",
    nombre: "Logística y Entregas",
    descripcion: "Remisiones, tiempos de entrega, eficiencia de rutas",
    tipo: "Logística",
    frecuencia: "Semanal",
    ultimaGeneracion: "17 Mar 2026",
    icon: FileBarChart,
  },
]

const reportesGenerados = [
  {
    nombre: "Producción Sem. 12",
    tipo: "Producción",
    fecha: "17 Mar 2026",
    generadoPor: "Sistema",
    formato: "PDF",
    tamaño: "2.4 MB",
  },
  {
    nombre: "Avance Obras Sem. 12",
    tipo: "Operaciones",
    fecha: "17 Mar 2026",
    generadoPor: "Sistema",
    formato: "PDF",
    tamaño: "3.1 MB",
  },
  {
    nombre: "Inventario Sem. 12",
    tipo: "Almacén",
    fecha: "17 Mar 2026",
    generadoPor: "A. Nah",
    formato: "Excel",
    tamaño: "1.8 MB",
  },
  {
    nombre: "Asistencia Qna. 6",
    tipo: "RRHH",
    fecha: "15 Mar 2026",
    generadoPor: "Sistema",
    formato: "PDF",
    tamaño: "980 KB",
  },
  {
    nombre: "Estado Financiero Feb",
    tipo: "Finanzas",
    fecha: "01 Mar 2026",
    generadoPor: "Lic. Gómez",
    formato: "PDF",
    tamaño: "4.2 MB",
  },
  {
    nombre: "Logística Sem. 11",
    tipo: "Logística",
    fecha: "10 Mar 2026",
    generadoPor: "Sistema",
    formato: "PDF",
    tamaño: "1.5 MB",
  },
  {
    nombre: "Producción Sem. 11",
    tipo: "Producción",
    fecha: "10 Mar 2026",
    generadoPor: "Sistema",
    formato: "PDF",
    tamaño: "2.2 MB",
  },
  {
    nombre: "Avance Obras Sem. 11",
    tipo: "Operaciones",
    fecha: "10 Mar 2026",
    generadoPor: "Sistema",
    formato: "PDF",
    tamaño: "2.9 MB",
  },
]

const tipoColors: Record<string, string> = {
  "Producción": "bg-blue-100 text-blue-700",
  Finanzas: "bg-emerald-100 text-emerald-700",
  Operaciones: "bg-purple-100 text-purple-700",
  RRHH: "bg-amber-100 text-amber-700",
  "Almacén": "bg-orange-100 text-orange-700",
  "Logística": "bg-cyan-100 text-cyan-700",
}

export default function ReportesPage() {
  const { toast } = useToast()
  const [kpis, setKpis] = useState<
    { label: string; value: string; cambio: string; positivo: boolean }[]
  >([])
  const [kpisLoading, setKpisLoading] = useState(true)

  useEffect(() => {
    async function fetchKpis() {
      const supabase = createClient()
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

      try {
        // --- M² Procesados (current month) ---
        const { data: conceptosCurrent } = await supabase
          .from("conceptos_obra")
          .select("cantidad_enviada, medida_largo, medida_ancho, created_at")
          .gte("created_at", currentMonthStart)

        const m2Current = (conceptosCurrent ?? []).reduce(
          (sum, c) => sum + (c.cantidad_enviada * c.medida_largo * c.medida_ancho) / 10000,
          0
        )

        // M² previous month
        const { data: conceptosPrev } = await supabase
          .from("conceptos_obra")
          .select("cantidad_enviada, medida_largo, medida_ancho, created_at")
          .gte("created_at", prevMonthStart)
          .lte("created_at", prevMonthEnd)

        const m2Prev = (conceptosPrev ?? []).reduce(
          (sum, c) => sum + (c.cantidad_enviada * c.medida_largo * c.medida_ancho) / 10000,
          0
        )

        const m2Change = m2Prev > 0 ? ((m2Current - m2Prev) / m2Prev) * 100 : 0

        // --- Piezas Entregadas (current month) ---
        const { count: piezasCurrent } = await supabase
          .from("piezas")
          .select("*", { count: "exact", head: true })
          .gte("created_at", currentMonthStart)

        const { count: piezasPrev } = await supabase
          .from("piezas")
          .select("*", { count: "exact", head: true })
          .gte("created_at", prevMonthStart)
          .lte("created_at", prevMonthEnd)

        const pzCurrent = piezasCurrent ?? 0
        const pzPrev = piezasPrev ?? 0
        const piezasChange = pzPrev > 0 ? ((pzCurrent - pzPrev) / pzPrev) * 100 : 0

        // --- Eficiencia Taller (avg porcentaje_aprovechamiento current month) ---
        const { data: planesCurrent } = await supabase
          .from("planes_corte")
          .select("porcentaje_aprovechamiento")
          .gte("created_at", currentMonthStart)

        const eficienciaCurrent =
          (planesCurrent ?? []).length > 0
            ? (planesCurrent ?? []).reduce((s, p) => s + p.porcentaje_aprovechamiento, 0) /
              (planesCurrent ?? []).length
            : 0

        const { data: planesPrev } = await supabase
          .from("planes_corte")
          .select("porcentaje_aprovechamiento")
          .gte("created_at", prevMonthStart)
          .lte("created_at", prevMonthEnd)

        const eficienciaPrev =
          (planesPrev ?? []).length > 0
            ? (planesPrev ?? []).reduce((s, p) => s + p.porcentaje_aprovechamiento, 0) /
              (planesPrev ?? []).length
            : 0

        const efChange = eficienciaCurrent - eficienciaPrev

        // --- Tiempo Prom. Entrega (avg days between created_at and fecha_envio) ---
        const { data: piezasConEnvio } = await supabase
          .from("piezas")
          .select("created_at, fecha_envio")
          .gte("fecha_envio", currentMonthStart)
          .not("fecha_envio", "is", null)

        let tiempoPromCurrent = 0
        if ((piezasConEnvio ?? []).length > 0) {
          const totalDays = (piezasConEnvio ?? []).reduce((sum, p) => {
            const created = new Date(p.created_at).getTime()
            const envio = new Date(p.fecha_envio!).getTime()
            return sum + (envio - created) / (1000 * 60 * 60 * 24)
          }, 0)
          tiempoPromCurrent = totalDays / (piezasConEnvio ?? []).length
        }

        const { data: piezasConEnvioPrev } = await supabase
          .from("piezas")
          .select("created_at, fecha_envio")
          .gte("fecha_envio", prevMonthStart)
          .lte("fecha_envio", prevMonthEnd)
          .not("fecha_envio", "is", null)

        let tiempoPromPrev = 0
        if ((piezasConEnvioPrev ?? []).length > 0) {
          const totalDays = (piezasConEnvioPrev ?? []).reduce((sum, p) => {
            const created = new Date(p.created_at).getTime()
            const envio = new Date(p.fecha_envio!).getTime()
            return sum + (envio - created) / (1000 * 60 * 60 * 24)
          }, 0)
          tiempoPromPrev = totalDays / (piezasConEnvioPrev ?? []).length
        }

        const tiempoChange = tiempoPromPrev > 0 ? tiempoPromCurrent - tiempoPromPrev : 0

        // Build KPIs
        const formatNum = (n: number) => n.toLocaleString("es-MX", { maximumFractionDigits: 0 })
        const formatPct = (n: number) =>
          (n >= 0 ? "+" : "") + n.toFixed(1) + "%"
        const formatDelta = (n: number) =>
          (n >= 0 ? "+" : "") + n.toFixed(1)

        setKpis([
          {
            label: "M² Procesados (Mes)",
            value: `${formatNum(m2Current)} m²`,
            cambio: formatPct(m2Change),
            positivo: m2Change >= 0,
          },
          {
            label: "Piezas Entregadas",
            value: formatNum(pzCurrent),
            cambio: formatPct(piezasChange),
            positivo: piezasChange >= 0,
          },
          {
            label: "Eficiencia Taller",
            value: `${eficienciaCurrent.toFixed(1)}%`,
            cambio: formatDelta(efChange) + "%",
            positivo: efChange >= 0,
          },
          {
            label: "Tiempo Prom. Entrega",
            value: `${tiempoPromCurrent.toFixed(1)} días`,
            cambio: formatDelta(tiempoChange),
            positivo: tiempoChange <= 0, // lower is better
          },
        ])
      } catch (err) {
        console.error("Error fetching KPIs:", err)
        setKpis([
          { label: "M² Procesados (Mes)", value: "0 m²", cambio: "+0%", positivo: true },
          { label: "Piezas Entregadas", value: "0", cambio: "+0%", positivo: true },
          { label: "Eficiencia Taller", value: "0%", cambio: "+0%", positivo: true },
          { label: "Tiempo Prom. Entrega", value: "0 días", cambio: "+0", positivo: true },
        ])
      } finally {
        setKpisLoading(false)
      }
    }

    fetchKpis()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Reportes</h1>
          <p className="mt-1 text-sm text-[#7A6D5A]">
            Generación y consulta de reportes operativos y financieros
          </p>
        </div>
        <Button className="gap-2 bg-[#D4A843] text-white hover:bg-[#C49A3A]" onClick={() => toast({ title: "Exportando reporte...", description: "El archivo se descargará en breve." })}>
          <FileBarChart className="h-4 w-4" />
          Generar Reporte
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center justify-center h-[88px]">
                <Loader2 className="h-5 w-5 animate-spin text-[#D4A843]" />
              </CardContent>
            </Card>
          ))
        ) : (
          kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-4">
                <p className="text-xs text-[#7A6D5A] mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-[#1E1A14]">{kpi.value}</p>
                <p
                  className={`text-xs mt-1 flex items-center gap-1 ${
                    kpi.positivo ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  <TrendingUp className="h-3 w-3" />
                  {kpi.cambio} vs mes anterior
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reportes disponibles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Reportes Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {reportesDisponibles.map((rpt) => (
              <div
                key={rpt.id}
                className="group flex gap-3 rounded-lg border border-[#E0DBD1] p-4 transition-shadow hover:shadow-md cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FAF9F7]">
                  <rpt.icon className="h-5 w-5 text-[#D4A843]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#1E1A14] group-hover:text-[#D4A843] transition-colors">
                    {rpt.nombre}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#7A6D5A] line-clamp-2">{rpt.descripcion}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className={tipoColors[rpt.tipo] + " text-[10px]"}>{rpt.tipo}</Badge>
                    <span className="text-[10px] text-[#7A6D5A]">{rpt.frecuencia}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historial */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Historial de Reportes Generados</CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reporte</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Generado por</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportesGenerados.map((rpt, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{rpt.nombre}</TableCell>
                  <TableCell>
                    <Badge className={tipoColors[rpt.tipo] + " text-[10px]"}>{rpt.tipo}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{rpt.fecha}</TableCell>
                  <TableCell className="text-sm text-[#7A6D5A]">{rpt.generadoPor}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {rpt.formato}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#7A6D5A]">{rpt.tamaño}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => toast({ title: "Exportando reporte...", description: "El archivo se descargará en breve." })}>
                      <Download className="h-4 w-4 text-[#7A6D5A]" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
