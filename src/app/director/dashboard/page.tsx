"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  HardHat,
  Truck,
  FileText,
  AlertTriangle,
  TrendingUp,
  Plus,
  Download,
  Factory,
  Building2,
  ArrowUpRight,
  Package,
  DollarSign,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

// ── Types ──
interface AsistenciaData {
  presentes: number
  total: number
  porcentaje: number
  desglose: { lugar: string; cantidad: number; icon: typeof Factory }[]
}

interface KpiData {
  label: string
  value: string
  icon: typeof HardHat
  color: string
}

interface ObraSemaforo {
  nombre: string
  descripcion: string
  piezas: { actual: number; total: number }
  progreso: number
  status: string
  color: string
}

interface StockCriticoItem {
  material: string
  stock: string
  minimo: string
  urgencia: string
}

interface ResumenFinanciero {
  totalUSD: string
  items: { label: string; monto: string; progreso: number; color: string }[]
}

interface M2Semanal {
  total: string
  unidad: string
  cambio: string
  positivo: boolean
  dias: { dia: string; valor: number }[]
}

// ── Helper: format currency ──
function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${value.toLocaleString("en-US")}`
  }
  return `$${value}`
}

// ── Componente ──
export default function DashboardPage() {
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [asistencia, setAsistencia] = useState<AsistenciaData>({
    presentes: 0,
    total: 0,
    porcentaje: 0,
    desglose: [
      { lugar: "Planta", cantidad: 0, icon: Factory },
      { lugar: "En Ruta", cantidad: 0, icon: Truck },
      { lugar: "Obra", cantidad: 0, icon: Building2 },
    ],
  })
  const [kpis, setKpis] = useState<KpiData[]>([
    { label: "Obras Activas", value: "0", icon: HardHat, color: "text-[#D4A843]" },
    { label: "Choferes en Ruta", value: "0", icon: Truck, color: "text-blue-500" },
    { label: "Remisiones Hoy", value: "0", icon: FileText, color: "text-emerald-500" },
    { label: "Alertas", value: "0", icon: AlertTriangle, color: "text-[#EF4444]" },
  ])
  const [obrasSemaforo, setObrasSemaforo] = useState<ObraSemaforo[]>([])
  const [stockCritico, setStockCritico] = useState<StockCriticoItem[]>([])
  const [resumenFinanciero, setResumenFinanciero] = useState<ResumenFinanciero>({
    totalUSD: "$0",
    items: [
      { label: "Total Presupuesto", monto: "$0", progreso: 100, color: "#1E1A14" },
      { label: "Facturado", monto: "$0", progreso: 0, color: "#D4A843" },
      { label: "Por Cobrar", monto: "$0", progreso: 0, color: "#7A6D5A" },
    ],
  })
  const [m2Semanal, setM2Semanal] = useState<M2Semanal>({
    total: "0",
    unidad: "m²",
    cambio: "—",
    positivo: true,
    dias: [
      { dia: "Lun", valor: 0 },
      { dia: "Mar", valor: 0 },
      { dia: "Mié", valor: 0 },
      { dia: "Jue", valor: 0 },
      { dia: "Vie", valor: 0 },
      { dia: "Sáb", valor: 0 },
    ],
  })

  useEffect(() => {
    async function fetchDashboard() {
      const supabase = createClient()
      const today = new Date().toISOString().split("T")[0]

      // Calculate start of current week (Monday)
      const now = new Date()
      const dayOfWeek = now.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const monday = new Date(now)
      monday.setDate(now.getDate() + mondayOffset)
      const weekStart = monday.toISOString().split("T")[0]

      const [obrasRes, asistenciaRes, remisionesRes, materialesRes, finanzasRes, conceptosRes] =
        await Promise.all([
          supabase.from("obras").select("*").eq("estatus", "activa"),
          supabase
            .from("asistencia")
            .select("*, usuario:users!usuario_id(role)")
            .eq("fecha", today),
          supabase.from("remisiones").select("id").gte("created_at", today + "T00:00:00"),
          supabase.from("materiales").select("*").eq("activo", true),
          supabase.from("finanzas_obra").select("*"),
          supabase
            .from("conceptos_obra")
            .select("*, obra:obras!obra_id(nombre, estatus)"),
        ])

      // ── Asistencia ──
      const asistRows = asistenciaRes.data ?? []
      const presentes = asistRows.filter(
        (r: any) => r.tipo === "normal" || r.tipo === "retardo"
      ).length
      const totalAsist = asistRows.length || 1
      const porcentaje = totalAsist > 0 ? Math.round((presentes / totalAsist) * 1000) / 10 : 0

      const enPlanta = asistRows.filter((r: any) => r.registrado_en === "planta").length
      const enObra = asistRows.filter((r: any) => r.registrado_en === "obra").length
      const choferes = asistRows.filter(
        (r: any) => r.usuario?.role === "chofer" && (r.tipo === "normal" || r.tipo === "retardo")
      ).length

      setAsistencia({
        presentes,
        total: totalAsist,
        porcentaje,
        desglose: [
          { lugar: "Planta", cantidad: enPlanta, icon: Factory },
          { lugar: "En Ruta", cantidad: choferes, icon: Truck },
          { lugar: "Obra", cantidad: enObra, icon: Building2 },
        ],
      })

      // ── KPIs ──
      const obrasActivas = obrasRes.data?.length ?? 0
      const choferesEnRuta = choferes
      const remisionesHoy = remisionesRes.data?.length ?? 0
      const materialesData = materialesRes.data ?? []
      const alertas = materialesData.filter(
        (m: any) => m.stock_actual != null && m.stock_minimo != null && m.stock_actual < m.stock_minimo
      ).length

      setKpis([
        {
          label: "Obras Activas",
          value: String(obrasActivas).padStart(2, "0"),
          icon: HardHat,
          color: "text-[#D4A843]",
        },
        {
          label: "Choferes en Ruta",
          value: String(choferesEnRuta).padStart(2, "0"),
          icon: Truck,
          color: "text-blue-500",
        },
        {
          label: "Remisiones Hoy",
          value: String(remisionesHoy).padStart(2, "0"),
          icon: FileText,
          color: "text-emerald-500",
        },
        {
          label: "Alertas",
          value: String(alertas).padStart(2, "0"),
          icon: AlertTriangle,
          color: "text-[#EF4444]",
        },
      ])

      // ── Obras Semáforo ──
      const conceptos = conceptosRes.data ?? []
      const obras = obrasRes.data ?? []

      // Group conceptos by obra_id
      const conceptosPorObra: Record<string, any[]> = {}
      for (const c of conceptos) {
        if (!conceptosPorObra[c.obra_id]) conceptosPorObra[c.obra_id] = []
        conceptosPorObra[c.obra_id].push(c)
      }

      const semaforo: ObraSemaforo[] = obras.map((obra: any) => {
        const cs = conceptosPorObra[obra.id] ?? []
        const totalVendida = cs.reduce(
          (sum: number, c: any) => sum + (Number(c.cantidad_vendida) || 0),
          0
        )
        const totalVerificada = cs.reduce(
          (sum: number, c: any) => sum + (Number(c.cantidad_verificada) || 0),
          0
        )
        const progreso = totalVendida > 0 ? Math.round((totalVerificada / totalVendida) * 100) : 0

        let status: string
        let color: string
        if (progreso >= 80) {
          status = "A Tiempo"
          color = "#22C55E"
        } else if (progreso >= 50) {
          status = "En Riesgo"
          color = "#F59E0B"
        } else {
          status = "Crítico"
          color = "#EF4444"
        }

        return {
          nombre: obra.nombre ?? "Sin nombre",
          descripcion: obra.descripcion ?? "",
          piezas: { actual: totalVerificada, total: totalVendida },
          progreso,
          status,
          color,
        }
      })

      setObrasSemaforo(semaforo)

      // ── Stock Crítico ──
      const criticos: StockCriticoItem[] = materialesData
        .filter(
          (m: any) =>
            m.stock_actual != null &&
            m.stock_minimo != null &&
            m.stock_actual < m.stock_minimo
        )
        .map((m: any) => {
          const ratio = m.stock_minimo > 0 ? m.stock_actual / m.stock_minimo : 0
          return {
            material: m.nombre ?? "—",
            stock: `${m.stock_actual} ${m.unidad ?? "m²"}`,
            minimo: `${m.stock_minimo} ${m.unidad ?? "m²"}`,
            urgencia: ratio < 0.5 ? "critico" : "bajo",
          }
        })

      setStockCritico(criticos)

      // ── Resumen Financiero ──
      const finanzas = finanzasRes.data ?? []
      const totalPresupuesto = finanzas.reduce(
        (sum: number, f: any) => sum + (Number(f.contrato_total) || 0),
        0
      )
      const facturado = finanzas.reduce(
        (sum: number, f: any) => sum + (Number(f.estimado_acumulado) || 0),
        0
      )
      const porCobrar = finanzas.reduce(
        (sum: number, f: any) =>
          sum + ((Number(f.estimado_acumulado) || 0) - (Number(f.cobrado_acumulado) || 0)),
        0
      )

      const facturadoPct = totalPresupuesto > 0 ? Math.round((facturado / totalPresupuesto) * 100) : 0
      const porCobrarPct = totalPresupuesto > 0 ? Math.round((porCobrar / totalPresupuesto) * 100) : 0

      setResumenFinanciero({
        totalUSD: formatCurrency(totalPresupuesto),
        items: [
          {
            label: "Total Presupuesto",
            monto: formatCurrency(totalPresupuesto),
            progreso: 100,
            color: "#1E1A14",
          },
          {
            label: "Facturado",
            monto: formatCurrency(facturado),
            progreso: facturadoPct,
            color: "#D4A843",
          },
          {
            label: "Por Cobrar",
            monto: formatCurrency(porCobrar),
            progreso: porCobrarPct,
            color: "#7A6D5A",
          },
        ],
      })

      // ── M² Semanal ──
      // Attempt to fetch movimientos_almacen for the current week
      const { data: movimientos } = await supabase
        .from("movimientos_almacen")
        .select("fecha, cantidad")
        .gte("fecha", weekStart)
        .lte("fecha", today)

      const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      const diasData: { dia: string; valor: number }[] = diasSemana.map((dia, idx) => {
        const targetDate = new Date(monday)
        targetDate.setDate(monday.getDate() + idx)
        const dateStr = targetDate.toISOString().split("T")[0]
        const dayTotal = (movimientos ?? [])
          .filter((m: any) => m.fecha === dateStr)
          .reduce((sum: number, m: any) => sum + (Number(m.cantidad) || 0), 0)
        return { dia, valor: dayTotal }
      })

      const totalM2 = diasData.reduce((sum, d) => sum + d.valor, 0)

      setM2Semanal({
        total: totalM2.toLocaleString("en-US"),
        unidad: "m²",
        cambio: totalM2 > 0 ? "—" : "—",
        positivo: true,
        dias: diasData,
      })

      setLoading(false)
    }

    fetchDashboard()
  }, [])

  const maxBar = Math.max(...m2Semanal.dias.map((d) => d.valor), 1)

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4A843]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Director Dashboard</h1>
          <p className="mt-1 text-sm text-[#7A6D5A]">
            Monitorización en Tiempo Real &bull; Operaciones Activas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => toast({ title: "Exportando reporte...", description: "El archivo se descargará en breve." })}>
            <Download className="h-4 w-4" />
            Exportar Reporte
          </Button>
          <Button className="gap-2 bg-[#D4A843] text-white hover:bg-[#C49A3A]" onClick={() => toast({ title: "Próximamente", description: "Esta funcionalidad estará disponible pronto." })}>
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT COLUMN - Asistencia + KPIs + Semáforo */}
        <div className="col-span-8 space-y-6">
          {/* Asistencia + KPIs Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Asistencia Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Asistencia Hoy</CardTitle>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    {asistencia.porcentaje}% PRESENTE
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#1E1A14]">
                    {asistencia.presentes}
                  </span>
                  <span className="text-lg text-[#7A6D5A]">de {asistencia.total}</span>
                </div>
                {/* Progress bar */}
                <div className="mb-4 h-2 w-full rounded-full bg-[#F0EDE8]">
                  <div
                    className="h-2 rounded-full bg-[#22C55E]"
                    style={{ width: `${asistencia.porcentaje}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {asistencia.desglose.map((item) => (
                    <div
                      key={item.lugar}
                      className="flex flex-col items-center rounded-lg bg-[#FAF9F7] p-2.5"
                    >
                      <item.icon className="mb-1 h-4 w-4 text-[#7A6D5A]" />
                      <span className="text-lg font-bold text-[#1E1A14]">
                        {item.cantidad}
                      </span>
                      <span className="text-[11px] text-[#7A6D5A]">{item.lugar}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 gap-3">
              {kpis.map((kpi) => (
                <Card key={kpi.label} className="flex flex-col justify-center">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAF9F7]">
                        <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#1E1A14]">{kpi.value}</p>
                        <p className="text-xs text-[#7A6D5A]">{kpi.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Obras Semáforo */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Obras Semáforo</CardTitle>
                <Button variant="ghost" size="sm" className="text-[#D4A843]">
                  Ver todas <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {obrasSemaforo.length === 0 ? (
                  <p className="text-sm text-[#7A6D5A] text-center py-4">No hay obras activas</p>
                ) : (
                  obrasSemaforo.map((obra) => (
                    <div
                      key={obra.nombre}
                      className="flex items-center gap-4 rounded-lg border border-[#E0DBD1] p-4"
                      style={{ borderLeftWidth: 4, borderLeftColor: obra.color }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[#1E1A14] truncate">
                            {obra.nombre}
                          </h3>
                          <Badge
                            className="shrink-0 text-[10px]"
                            style={{
                              backgroundColor: `${obra.color}20`,
                              color: obra.color,
                              borderColor: obra.color,
                            }}
                          >
                            {obra.status}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-[#7A6D5A] truncate">
                          {obra.descripcion}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#1E1A14]">
                            {obra.piezas.actual}/{obra.piezas.total}
                          </p>
                          <p className="text-[10px] text-[#7A6D5A]">piezas</p>
                        </div>
                        <div className="w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium" style={{ color: obra.color }}>
                              {obra.progreso}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#F0EDE8]">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${obra.progreso}%`,
                                backgroundColor: obra.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-4 space-y-6">
          {/* M² Procesados Semanal */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">M² Procesados Semanal</CardTitle>
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">{m2Semanal.cambio} vs ant</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold text-[#1E1A14]">{m2Semanal.total}</span>
                <span className="ml-1 text-sm text-[#7A6D5A]">{m2Semanal.unidad}</span>
              </div>
              {/* Simple bar chart */}
              <div className="flex items-end justify-between gap-2 h-28">
                {m2Semanal.dias.map((dia) => (
                  <div key={dia.dia} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-[#D4A843]/80 hover:bg-[#D4A843] transition-colors"
                      style={{ height: `${(dia.valor / maxBar) * 100}%`, minHeight: dia.valor > 0 ? "4px" : "0px" }}
                    />
                    <span className="text-[10px] text-[#7A6D5A]">{dia.dia}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stock Crítico */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Stock Crítico Glass</CardTitle>
                <Package className="h-4 w-4 text-[#7A6D5A]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockCritico.length === 0 ? (
                  <p className="text-sm text-[#7A6D5A] text-center py-2">Sin alertas de stock</p>
                ) : (
                  stockCritico.map((item) => (
                    <div key={item.material} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            item.urgencia === "critico" ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                          }`}
                        />
                        <span className="text-sm text-[#1E1A14]">{item.material}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#1E1A14]">
                          {item.stock}
                        </span>
                        <span className="ml-1 text-[10px] text-[#7A6D5A]">
                          / mín {item.minimo}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumen Financiero */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Resumen Financiero</CardTitle>
                <DollarSign className="h-4 w-4 text-[#D4A843]" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-3xl font-bold text-[#1E1A14]">
                {resumenFinanciero.totalUSD}{" "}
                <span className="text-sm font-normal text-[#7A6D5A]">USD</span>
              </p>
              <div className="space-y-3">
                {resumenFinanciero.items.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-[#7A6D5A]">{item.label}</span>
                      <span className="font-semibold text-[#1E1A14]">{item.monto}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#F0EDE8]">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${item.progreso}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
