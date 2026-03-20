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
} from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const resumenFinanciero = {
  ingresosMes: "$1,420,000",
  egresosMes: "$890,000",
  utilidadMes: "$530,000",
  cuentasPorCobrar: "$840,000",
  margenUtilidad: "37.3%",
  cambioIngresos: "+12.4%",
  cambioEgresos: "+5.2%",
}

const presupuestosObra = [
  {
    obra: "Residencia Las Nubes",
    id: "OBR-001",
    presupuesto: "$485,000",
    facturado: "$421,000",
    cobrado: "$380,000",
    porCobrar: "$41,000",
    avanceFinanciero: 87,
    status: "Al día",
  },
  {
    obra: "Hotel Regency Lobby",
    id: "OBR-002",
    presupuesto: "$1,250,000",
    facturado: "$750,000",
    cobrado: "$600,000",
    porCobrar: "$150,000",
    avanceFinanciero: 60,
    status: "Al día",
  },
  {
    obra: "Torre Corporate VII",
    id: "OBR-003",
    presupuesto: "$2,100,000",
    facturado: "$630,000",
    cobrado: "$420,000",
    porCobrar: "$210,000",
    avanceFinanciero: 30,
    status: "Retrasado",
  },
  {
    obra: "Plaza Kukulcán",
    id: "OBR-004",
    presupuesto: "$890,000",
    facturado: "$712,000",
    cobrado: "$712,000",
    porCobrar: "$0",
    avanceFinanciero: 80,
    status: "Al día",
  },
  {
    obra: "Residencia Montejo 480",
    id: "OBR-005",
    presupuesto: "$320,000",
    facturado: "$192,000",
    cobrado: "$128,000",
    porCobrar: "$64,000",
    avanceFinanciero: 60,
    status: "Pendiente",
  },
  {
    obra: "Club de Playa Sisal",
    id: "OBR-006",
    presupuesto: "$1,750,000",
    facturado: "$262,500",
    cobrado: "$262,500",
    porCobrar: "$0",
    avanceFinanciero: 15,
    status: "Al día",
  },
]

const facturasRecientes = [
  {
    numero: "FAC-2026-0342",
    cliente: "Arq. Roberto Medina",
    obra: "Las Nubes",
    monto: "$68,000",
    fecha: "18 Mar 2026",
    vencimiento: "17 Abr 2026",
    status: "Emitida",
  },
  {
    numero: "FAC-2026-0341",
    cliente: "Grupo Hotelero del Sureste",
    obra: "Hotel Regency",
    monto: "$185,000",
    fecha: "15 Mar 2026",
    vencimiento: "14 Abr 2026",
    status: "Emitida",
  },
  {
    numero: "FAC-2026-0338",
    cliente: "Inmobiliaria Peninsular",
    obra: "Torre Corporate VII",
    monto: "$210,000",
    fecha: "10 Mar 2026",
    vencimiento: "09 Abr 2026",
    status: "Vencida",
  },
  {
    numero: "FAC-2026-0335",
    cliente: "Desarrollos Peninsulares S.A.",
    obra: "Plaza Kukulcán",
    monto: "$142,000",
    fecha: "05 Mar 2026",
    vencimiento: "04 Abr 2026",
    status: "Cobrada",
  },
  {
    numero: "FAC-2026-0330",
    cliente: "Familia Cámara Zavala",
    obra: "Montejo 480",
    monto: "$64,000",
    fecha: "01 Mar 2026",
    vencimiento: "31 Mar 2026",
    status: "Pendiente",
  },
]

const gastosMensuales = [
  { concepto: "Nómina", monto: "$380,000", porcentaje: 42.7 },
  { concepto: "Materiales", monto: "$285,000", porcentaje: 32.0 },
  { concepto: "Transporte y Logística", monto: "$95,000", porcentaje: 10.7 },
  { concepto: "Servicios y Renta", monto: "$65,000", porcentaje: 7.3 },
  { concepto: "Mantenimiento Equipo", monto: "$42,000", porcentaje: 4.7 },
  { concepto: "Otros", monto: "$23,000", porcentaje: 2.6 },
]

const statusColors: Record<string, string> = {
  "Al día": "bg-emerald-100 text-emerald-700",
  Retrasado: "bg-red-100 text-red-700",
  Pendiente: "bg-amber-100 text-amber-700",
  Emitida: "bg-blue-100 text-blue-700",
  Cobrada: "bg-emerald-100 text-emerald-700",
  Vencida: "bg-red-100 text-red-700",
}

export default function FinanzasPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState("presupuestos")

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
            <p className="text-xl font-bold text-[#1E1A14]">{resumenFinanciero.ingresosMes}</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              {resumenFinanciero.cambioIngresos}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A] mb-2">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs">Egresos (Mes)</span>
            </div>
            <p className="text-xl font-bold text-[#1E1A14]">{resumenFinanciero.egresosMes}</p>
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              {resumenFinanciero.cambioEgresos}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A] mb-2">
              <PiggyBank className="h-4 w-4" />
              <span className="text-xs">Utilidad Neta</span>
            </div>
            <p className="text-xl font-bold text-[#22C55E]">{resumenFinanciero.utilidadMes}</p>
            <p className="text-xs text-[#7A6D5A] mt-1">
              Margen: {resumenFinanciero.margenUtilidad}
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
              {resumenFinanciero.cuentasPorCobrar}
            </p>
            <p className="text-xs text-[#7A6D5A] mt-1">5 facturas pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A] mb-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Presupuesto Total</span>
            </div>
            <p className="text-xl font-bold text-[#1E1A14]">$6.8M</p>
            <p className="text-xs text-[#7A6D5A] mt-1">6 obras activas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gastos breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Distribución de Gastos - Marzo 2026</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
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
                <p className="text-xs font-semibold text-[#1E1A14]">{gasto.monto}</p>
                <p className="text-[10px] text-[#7A6D5A]">{gasto.concepto}</p>
                <p className="text-[10px] font-medium text-[#D4A843]">{gasto.porcentaje}%</p>
              </div>
            ))}
          </div>
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
                        <TableCell className="text-right font-medium">{p.presupuesto}</TableCell>
                        <TableCell className="text-right text-sm">{p.facturado}</TableCell>
                        <TableCell className="text-right text-sm text-[#22C55E]">
                          {p.cobrado}
                        </TableCell>
                        <TableCell className="text-right text-sm text-[#D4A843]">
                          {p.porCobrar}
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
                          <Badge className={statusColors[p.status] + " text-[10px]"}>
                            {p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "facturas" && (
          <div className="mt-2">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Factura</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Obra</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Emisión</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturasRecientes.map((f) => (
                      <TableRow key={f.numero}>
                        <TableCell className="font-mono text-xs">{f.numero}</TableCell>
                        <TableCell className="text-sm">{f.cliente}</TableCell>
                        <TableCell className="text-sm text-[#7A6D5A]">{f.obra}</TableCell>
                        <TableCell className="text-right font-semibold">{f.monto}</TableCell>
                        <TableCell className="text-sm">{f.fecha}</TableCell>
                        <TableCell className="text-sm">{f.vencimiento}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[f.status] + " text-[10px]"}>
                            {f.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
