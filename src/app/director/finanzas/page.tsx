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
// Tabs import removed - using manual tab switching for reliability
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

const statusColors: Record<string, string> = {
  "Al día": "bg-emerald-100 text-emerald-700",
  Retrasado: "bg-red-100 text-red-700",
  Pendiente: "bg-amber-100 text-amber-700",
  Emitida: "bg-blue-100 text-blue-700",
  Cobrada: "bg-emerald-100 text-emerald-700",
  Vencida: "bg-red-100 text-red-700",
  pendiente: "bg-amber-100 text-amber-700",
  aprobada: "bg-emerald-100 text-emerald-700",
  rechazada: "bg-red-100 text-red-700",
  enviada: "bg-blue-100 text-blue-700",
}

function formatMXN(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatMXNShort(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  return formatMXN(amount)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

interface ResumenFinanciero {
  ingresosMes: number
  egresosMes: number
  utilidadMes: number
  cuentasPorCobrar: number
  margenUtilidad: number
  presupuestoTotal: number
  obrasActivas: number
}

interface PresupuestoObra {
  obra: string
  id: string
  presupuesto: number
  facturado: number
  cobrado: number
  porCobrar: number
  avanceFinanciero: number
  status: string
}

interface FacturaReciente {
  numero: string
  cliente: string
  obra: string
  monto: number
  fecha: string
  status: string
}

interface GastoMensual {
  concepto: string
  monto: number
  porcentaje: number
}

export default function FinanzasPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState("presupuestos")
  const [loading, setLoading] = useState(true)
  const [resumenFinanciero, setResumenFinanciero] = useState<ResumenFinanciero>({
    ingresosMes: 0,
    egresosMes: 0,
    utilidadMes: 0,
    cuentasPorCobrar: 0,
    margenUtilidad: 0,
    presupuestoTotal: 0,
    obrasActivas: 0,
  })
  const [presupuestosObra, setPresupuestosObra] = useState<PresupuestoObra[]>([])
  const [facturasRecientes, setFacturasRecientes] = useState<FacturaReciente[]>([])
  const [gastosMensuales, setGastosMensuales] = useState<GastoMensual[]>([])

  useEffect(() => {
    async function fetchFinanzas() {
      const supabase = createClient()

      const [obrasRes, finanzasRes, estimacionesRes, ordenesRes, gasolinaRes] = await Promise.all([
        supabase.from("obras").select("*").eq("estatus", "activa"),
        supabase.from("finanzas_obra").select("*, obra:obras(nombre)"),
        supabase
          .from("estimaciones")
          .select("*, obra:obras(nombre)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("ordenes_compra").select("*").order("created_at", { ascending: false }),
        supabase.from("gastos_gasolina").select("monto"),
      ])

      const obras = obrasRes.data ?? []
      const finanzas = finanzasRes.data ?? []
      const estimaciones = estimacionesRes.data ?? []
      const ordenes = ordenesRes.data ?? []
      const gasolina = gasolinaRes.data ?? []

      // --- Resumen Financiero KPIs ---
      const ingresosMes = finanzas.reduce(
        (sum: number, f: any) => sum + (Number(f.cobrado_acumulado) || 0),
        0
      )
      const totalOrdenes = ordenes.reduce(
        (sum: number, o: any) => sum + (Number(o.total) || 0),
        0
      )
      const totalGasolina = gasolina.reduce(
        (sum: number, g: any) => sum + (Number(g.monto) || 0),
        0
      )
      const egresosMes = totalOrdenes + totalGasolina
      const utilidadMes = ingresosMes - egresosMes
      const cuentasPorCobrar = finanzas.reduce(
        (sum: number, f: any) =>
          sum + ((Number(f.estimado_acumulado) || 0) - (Number(f.cobrado_acumulado) || 0)),
        0
      )
      const margenUtilidad = ingresosMes > 0 ? (utilidadMes / ingresosMes) * 100 : 0
      const presupuestoTotal = finanzas.reduce(
        (sum: number, f: any) => sum + (Number(f.contrato_total) || 0),
        0
      )

      setResumenFinanciero({
        ingresosMes,
        egresosMes,
        utilidadMes,
        cuentasPorCobrar,
        margenUtilidad,
        presupuestoTotal,
        obrasActivas: obras.length,
      })

      // --- Presupuestos por Obra ---
      const presupuestos: PresupuestoObra[] = finanzas.map((f: any) => {
        const contrato = Number(f.contrato_total) || 0
        const estimado = Number(f.estimado_acumulado) || 0
        const cobrado = Number(f.cobrado_acumulado) || 0
        const porCobrar = estimado - cobrado
        const avance = contrato > 0 ? Math.round((cobrado / contrato) * 100) : 0
        let status = "Al día"
        if (avance < 30 && estimado > 0 && porCobrar > 0) {
          status = "Retrasado"
        } else if (porCobrar > 0 && avance >= 30) {
          status = "Pendiente"
        }
        if (porCobrar <= 0 && estimado > 0) {
          status = "Al día"
        }

        const obraNombre =
          f.obra && typeof f.obra === "object" ? f.obra.nombre : `Obra ${f.obra_id}`

        return {
          obra: obraNombre,
          id: f.obra_id ? `OBR-${String(f.obra_id).padStart(3, "0")}` : f.id,
          presupuesto: contrato,
          facturado: estimado,
          cobrado,
          porCobrar: Math.max(porCobrar, 0),
          avanceFinanciero: avance,
          status,
        }
      })
      setPresupuestosObra(presupuestos)

      // --- Facturas Recientes (from estimaciones) ---
      const facturas: FacturaReciente[] = estimaciones.map((e: any, idx: number) => {
        const obraNombre =
          e.obra && typeof e.obra === "object" ? e.obra.nombre : `Obra ${e.obra_id}`
        const numero = `EST-2026-${String(e.id ?? idx + 1).padStart(4, "0")}`
        let status = e.estatus ?? "Pendiente"
        // Capitalize first letter for display
        status = status.charAt(0).toUpperCase() + status.slice(1)

        return {
          numero,
          cliente: obraNombre,
          obra: obraNombre,
          monto: Number(e.monto_bruto) || 0,
          fecha: e.created_at ? formatDate(e.created_at) : "—",
          status,
        }
      })
      setFacturasRecientes(facturas)

      // --- Gastos Mensuales ---
      const gastosArr: GastoMensual[] = []
      const totalGastos = totalOrdenes + totalGasolina

      if (totalOrdenes > 0) {
        gastosArr.push({
          concepto: "Materiales",
          monto: totalOrdenes,
          porcentaje: totalGastos > 0 ? Math.round((totalOrdenes / totalGastos) * 100 * 10) / 10 : 0,
        })
      }
      if (totalGasolina > 0) {
        gastosArr.push({
          concepto: "Transporte",
          monto: totalGasolina,
          porcentaje: totalGastos > 0 ? Math.round((totalGasolina / totalGastos) * 100 * 10) / 10 : 0,
        })
      }
      if (gastosArr.length === 0 && totalGastos === 0) {
        // No data - show empty state
      }
      setGastosMensuales(gastosArr)

      setLoading(false)
    }

    fetchFinanzas()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4A843]" />
          <p className="text-sm text-[#7A6D5A]">Cargando datos financieros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Finanzas</h1>
          <p className="mt-1 text-sm text-[#7A6D5A]">
            Resumen financiero, facturación y control de presupuestos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast({ title: "Exportando reporte...", description: "El archivo se descargará en breve." })}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="gap-2 bg-[#D4A843] text-white hover:bg-[#C49A3A]" onClick={() => toast({ title: "Próximamente", description: "Esta funcionalidad estará disponible pronto." })}>
            <Receipt className="h-4 w-4" />
            Nueva Factura
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A] mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Ingresos (Mes)</span>
            </div>
            <p className="text-xl font-bold text-[#1E1A14]">{formatMXN(resumenFinanciero.ingresosMes)}</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              Acumulado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A] mb-2">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs">Egresos (Mes)</span>
            </div>
            <p className="text-xl font-bold text-[#1E1A14]">{formatMXN(resumenFinanciero.egresosMes)}</p>
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              Acumulado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A] mb-2">
              <PiggyBank className="h-4 w-4" />
              <span className="text-xs">Utilidad Neta</span>
            </div>
            <p className={`text-xl font-bold ${resumenFinanciero.utilidadMes >= 0 ? "text-[#22C55E]" : "text-red-500"}`}>
              {formatMXN(resumenFinanciero.utilidadMes)}
            </p>
            <p className="text-xs text-[#7A6D5A] mt-1">
              Margen: {resumenFinanciero.margenUtilidad.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A] mb-2">
              <Wallet className="h-4 w-4" />
              <span className="text-xs">Por Cobrar</span>
            </div>
            <p className="text-xl font-bold text-[#D4A843]">
              {formatMXN(resumenFinanciero.cuentasPorCobrar)}
            </p>
            <p className="text-xs text-[#7A6D5A] mt-1">
              {presupuestosObra.filter((p) => p.porCobrar > 0).length} obras con saldo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A] mb-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Presupuesto Total</span>
            </div>
            <p className="text-xl font-bold text-[#1E1A14]">
              {formatMXNShort(resumenFinanciero.presupuestoTotal)}
            </p>
            <p className="text-xs text-[#7A6D5A] mt-1">
              {resumenFinanciero.obrasActivas} obras activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gastos breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Distribución de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          {gastosMensuales.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#7A6D5A]">
              No hay datos de gastos disponibles
            </div>
          ) : (
            <div className={`grid grid-cols-${Math.min(gastosMensuales.length, 6)} gap-4`}>
              {gastosMensuales.map((gasto) => (
                <div key={gasto.concepto} className="text-center">
                  <div className="relative mx-auto mb-2 h-24 w-full">
                    <div className="absolute bottom-0 w-full rounded-t-lg bg-[#D4A843]/20">
                      <div
                        className="w-full rounded-t-lg bg-[#D4A843] transition-all"
                        style={{ height: `${gasto.porcentaje * 2.2}px` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-[#1E1A14]">{formatMXN(gasto.monto)}</p>
                  <p className="text-[10px] text-[#7A6D5A]">{gasto.concepto}</p>
                  <p className="text-[10px] font-medium text-[#D4A843]">{gasto.porcentaje}%</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div>
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
          <button
            onClick={() => setTab("presupuestos")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${
              tab === "presupuestos"
                ? "bg-background text-foreground shadow"
                : ""
            }`}
          >
            Presupuestos por Obra
          </button>
          <button
            onClick={() => setTab("facturas")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${
              tab === "facturas"
                ? "bg-background text-foreground shadow"
                : ""
            }`}
          >
            Facturas Recientes
          </button>
        </div>

        {tab === "presupuestos" && (
          <div className="mt-2">
            <Card>
              <CardContent className="pt-6">
                {presupuestosObra.length === 0 ? (
                  <div className="text-center py-8 text-sm text-[#7A6D5A]">
                    No hay presupuestos de obra registrados
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Obra</TableHead>
                        <TableHead className="text-right">Presupuesto</TableHead>
                        <TableHead className="text-right">Facturado</TableHead>
                        <TableHead className="text-right">Cobrado</TableHead>
                        <TableHead className="text-right">Por Cobrar</TableHead>
                        <TableHead>Avance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {presupuestosObra.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <p className="font-medium text-[#1E1A14]">{p.obra}</p>
                            <p className="text-[10px] text-[#7A6D5A]">{p.id}</p>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatMXN(p.presupuesto)}</TableCell>
                          <TableCell className="text-right text-sm">{formatMXN(p.facturado)}</TableCell>
                          <TableCell className="text-right text-sm text-[#22C55E]">
                            {formatMXN(p.cobrado)}
                          </TableCell>
                          <TableCell className="text-right text-sm text-[#D4A843]">
                            {formatMXN(p.porCobrar)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-[#F0EDE8]">
                                <div
                                  className="h-1.5 rounded-full bg-[#D4A843]"
                                  style={{ width: `${p.avanceFinanciero}%` }}
                                />
                              </div>
                              <span className="text-xs">{p.avanceFinanciero}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={(statusColors[p.status] || "bg-gray-100 text-gray-700") + " text-[10px]"}>
                              {p.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "facturas" && (
          <div className="mt-2">
            <Card>
              <CardContent className="pt-6">
                {facturasRecientes.length === 0 ? (
                  <div className="text-center py-8 text-sm text-[#7A6D5A]">
                    No hay estimaciones recientes
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Estimación</TableHead>
                        <TableHead>Obra</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {facturasRecientes.map((f) => (
                        <TableRow key={f.numero}>
                          <TableCell className="font-mono text-xs">{f.numero}</TableCell>
                          <TableCell className="text-sm text-[#7A6D5A]">{f.obra}</TableCell>
                          <TableCell className="text-right font-semibold">{formatMXN(f.monto)}</TableCell>
                          <TableCell className="text-sm">{f.fecha}</TableCell>
                          <TableCell>
                            <Badge className={(statusColors[f.status] || statusColors[f.status.toLowerCase()] || "bg-gray-100 text-gray-700") + " text-[10px]"}>
                              {f.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
