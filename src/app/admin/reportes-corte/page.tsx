"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Package,
  Recycle,
  TrendingUp,
  DollarSign,
  Scissors,
  Clock,
  AlertTriangle,
  Calendar,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

// ── Mock data ──
const mockKpis = {
  sobrantesDisponibles: 42,
  areaDisponibleM2: 8.75,
  reutilizadosMes: 12,
  aprovechamientoPromedio: 84,
  ahorroEstimado: 156000,
}

const mockSobrantesPorMaterial = [
  { material: "Mármol Blanco Carrara", count: 14 },
  { material: "Mármol Crema Marfil", count: 9 },
  { material: "Travertino Noce", count: 7 },
  { material: "Granito Gris Oxford", count: 6 },
  { material: "Mármol Negro Monterrey", count: 4 },
  { material: "Mármol Rosa Zarci", count: 2 },
]

const mockPlanesPorMes = [
  { mes: "Oct", count: 8 },
  { mes: "Nov", count: 12 },
  { mes: "Dic", count: 6 },
  { mes: "Ene", count: 14 },
  { mes: "Feb", count: 11 },
  { mes: "Mar", count: 9 },
]

const mockCalidadDistribucion = [
  { calidad: "Buena", count: 24, color: "#10B981" },
  { calidad: "Regular", count: 12, color: "#F59E0B" },
  { calidad: "Solo peq.", count: 6, color: "#F97316" },
]

const mockAprovechamientoPorObra = [
  { obra: "Torre Esmeralda", porcentaje: 91 },
  { obra: "Residencial Las Palmas", porcentaje: 87 },
  { obra: "Hotel Atlántico", porcentaje: 84 },
  { obra: "Plaza Coral", porcentaje: 79 },
  { obra: "Casa Riviera", porcentaje: 76 },
]

const mockUltimosPlanes = [
  { id: "plan-001", folio: "PC-2026-001", obra: "Torre Esmeralda", fecha: "2026-03-19", piezas: 24, aprovechamiento: 87, estatus: "ejecutado" },
  { id: "plan-002", folio: "PC-2026-002", obra: "Residencial Las Palmas", fecha: "2026-03-17", piezas: 18, aprovechamiento: 82, estatus: "aprobado" },
  { id: "plan-003", folio: "PC-2026-003", obra: "Hotel Atlántico", fecha: "2026-03-14", piezas: 32, aprovechamiento: 91, estatus: "ejecutado" },
  { id: "plan-004", folio: "PC-2026-004", obra: "Plaza Coral", fecha: "2026-03-12", piezas: 15, aprovechamiento: 79, estatus: "borrador" },
  { id: "plan-005", folio: "PC-2026-005", obra: "Casa Riviera", fecha: "2026-03-10", piezas: 20, aprovechamiento: 76, estatus: "ejecutado" },
  { id: "plan-006", folio: "PC-2026-006", obra: "Torre Esmeralda", fecha: "2026-03-08", piezas: 28, aprovechamiento: 89, estatus: "ejecutado" },
  { id: "plan-007", folio: "PC-2026-007", obra: "Hotel Atlántico", fecha: "2026-03-05", piezas: 12, aprovechamiento: 85, estatus: "ejecutado" },
  { id: "plan-008", folio: "PC-2026-008", obra: "Residencial Las Palmas", fecha: "2026-03-03", piezas: 22, aprovechamiento: 80, estatus: "aprobado" },
  { id: "plan-009", folio: "PC-2026-009", obra: "Plaza Coral", fecha: "2026-02-28", piezas: 16, aprovechamiento: 74, estatus: "ejecutado" },
  { id: "plan-010", folio: "PC-2026-010", obra: "Casa Riviera", fecha: "2026-02-25", piezas: 19, aprovechamiento: 78, estatus: "ejecutado" },
]

const mockSobrantesAntiguos = [
  { id: "sob-010", material: "Mármol Crema Marfil", dimensiones: "90 × 45 cm", area: "0.405 m²", calidad: "Buena", fecha: "2026-03-08", dias: 12 },
  { id: "sob-009", material: "Granito Gris Oxford", dimensiones: "30 × 18 cm", area: "0.054 m²", calidad: "Solo peq.", fecha: "2026-03-10", dias: 10 },
  { id: "sob-008", material: "Travertino Noce", dimensiones: "70 × 50 cm", area: "0.350 m²", calidad: "Buena", fecha: "2026-03-12", dias: 8 },
  { id: "sob-006", material: "Mármol Blanco Carrara", dimensiones: "55 × 35 cm", area: "0.193 m²", calidad: "Buena", fecha: "2026-03-14", dias: 6 },
  { id: "sob-005", material: "Mármol Negro Monterrey", dimensiones: "25 × 15 cm", area: "0.038 m²", calidad: "Solo peq.", fecha: "2026-03-15", dias: 5 },
]

const mockTopDesperdicio = [
  { material: "Mármol Blanco Carrara", areaTotal: "2.45 m²", piezas: 14, precioRef: "$15,000/lám" },
  { material: "Travertino Noce", areaTotal: "1.82 m²", piezas: 7, precioRef: "$14,000/lám" },
  { material: "Mármol Crema Marfil", areaTotal: "1.56 m²", piezas: 9, precioRef: "$12,000/lám" },
  { material: "Granito Gris Oxford", areaTotal: "1.20 m²", piezas: 6, precioRef: "$11,000/lám" },
  { material: "Mármol Negro Monterrey", areaTotal: "0.78 m²", piezas: 4, precioRef: "$18,000/lám" },
]

const estatusColors: Record<string, string> = {
  borrador: "bg-gray-100 text-gray-700",
  aprobado: "bg-blue-100 text-blue-700",
  ejecutado: "bg-emerald-100 text-emerald-700",
  cancelado: "bg-red-100 text-red-700",
}

// ── SVG Chart Components ──

function BarChart({ data, maxWidth = 500 }: { data: { label: string; value: number }[]; maxWidth?: number }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1)
  const barH = 28
  const gap = 8
  const labelW = 160
  const chartW = maxWidth - labelW - 50
  const totalH = data.length * (barH + gap) + gap

  return (
    <svg width={maxWidth} height={totalH} className="w-full">
      {data.map((d, i) => {
        const y = i * (barH + gap) + gap
        const barWidth = (d.value / maxVal) * chartW
        return (
          <g key={i}>
            <text x={labelW - 8} y={y + barH / 2 + 1} textAnchor="end" dominantBaseline="central" fontSize={11} fill="#7A6D5A">
              {d.label}
            </text>
            <rect x={labelW} y={y} width={barWidth} height={barH} fill="#D4A843" rx={4} opacity={0.8} />
            <text x={labelW + barWidth + 6} y={y + barH / 2 + 1} dominantBaseline="central" fontSize={12} fontWeight={600} fill="#1E1A14">
              {d.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function BarChartVertical({ data }: { data: { label: string; value: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1)
  const barW = 48
  const gap = 16
  const chartH = 140
  const totalW = data.length * (barW + gap) + gap
  const bottomPad = 24

  return (
    <svg width={totalW} height={chartH + bottomPad + 10} className="w-full max-w-full">
      {data.map((d, i) => {
        const x = i * (barW + gap) + gap
        const barHeight = (d.value / maxVal) * chartH
        const y = chartH - barHeight
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barHeight} fill="#3B82F6" rx={4} opacity={0.75} />
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="#1E1A14">
              {d.value}
            </text>
            <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize={10} fill="#7A6D5A">
              {d.label}
            </text>
          </g>
        )
      })}
      {/* Baseline */}
      <line x1={0} y1={chartH} x2={totalW} y2={chartH} stroke="#E0DBD1" strokeWidth={1} />
    </svg>
  )
}

function PieChart({ data, size = 160 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 8

  let cumAngle = -Math.PI / 2 // Start from top

  const slices = data.map((d) => {
    const angle = (d.value / total) * Math.PI * 2
    const startAngle = cumAngle
    const endAngle = cumAngle + angle
    cumAngle = endAngle

    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = angle > Math.PI ? 1 : 0

    const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`

    return { ...d, pathD }
  })

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size}>
        {slices.map((s, i) => (
          <path key={i} d={s.pathD} fill={s.color} stroke="white" strokeWidth={2} />
        ))}
        {/* Center white circle for donut look */}
        <circle cx={cx} cy={cy} r={r * 0.5} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={16} fontWeight={700} fill="#1E1A14">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fill="#7A6D5A">
          total
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-[#7A6D5A]">{d.label}</span>
            <span className="text-xs font-semibold text-[#1E1A14]">{d.value}</span>
            <span className="text-[10px] text-[#7A6D5A]">({Math.round((d.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HorizontalBarSimple({ data }: { data: { label: string; value: number }[] }) {
  const maxVal = 100

  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#7A6D5A] truncate max-w-[200px]">{d.label}</span>
            <span className={`text-xs font-semibold ${d.value >= 80 ? "text-emerald-600" : d.value >= 70 ? "text-amber-600" : "text-red-600"}`}>
              {d.value}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#F0EDE8]">
            <div
              className={`h-2 rounded-full ${d.value >= 80 ? "bg-emerald-400" : d.value >= 70 ? "bg-amber-400" : "bg-red-400"}`}
              style={{ width: `${d.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function formatMoney(n: number) {
  return "$" + n.toLocaleString("es-MX")
}

export default function ReportesCortePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E1A14]">Reportes de Corte</h1>
        <p className="text-sm text-[#7A6D5A]">An&aacute;lisis de aprovechamiento de material y gesti&oacute;n de sobrantes</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Sobrantes disponibles</p>
              <p className="text-xl font-bold text-[#1E1A14]">{mockKpis.sobrantesDisponibles}</p>
              <p className="text-[10px] text-[#7A6D5A]">{mockKpis.areaDisponibleM2} m&sup2; totales</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <Recycle className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Reutilizados este mes</p>
              <p className="text-xl font-bold text-emerald-600">{mockKpis.reutilizadosMes}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Aprovechamiento promedio</p>
              <p className={`text-xl font-bold ${mockKpis.aprovechamientoPromedio >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                {mockKpis.aprovechamientoPromedio}%
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <DollarSign className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Ahorro estimado</p>
              <p className="text-xl font-bold text-[#1E1A14]">{formatMoney(mockKpis.ahorroEstimado)}</p>
              <p className="text-[10px] text-[#7A6D5A]">sobrantes reutilizados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sobrantes por material */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#1E1A14]">Sobrantes por tipo de material</h3>
          <BarChart
            data={mockSobrantesPorMaterial.map((d) => ({ label: d.material, value: d.count }))}
          />
        </div>

        {/* Planes por mes */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#1E1A14]">Planes de corte por mes (&uacute;ltimos 6 meses)</h3>
          <BarChartVertical
            data={mockPlanesPorMes.map((d) => ({ label: d.mes, value: d.count }))}
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Calidad distribution */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#1E1A14]">Distribuci&oacute;n de calidad de sobrantes</h3>
          <PieChart data={mockCalidadDistribucion.map((d) => ({ label: d.calidad, value: d.count, color: d.color }))} />
        </div>

        {/* Aprovechamiento por obra */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#1E1A14]">Aprovechamiento promedio por obra</h3>
          <HorizontalBarSimple
            data={mockAprovechamientoPorObra.map((d) => ({ label: d.obra, value: d.porcentaje }))}
          />
        </div>
      </div>

      {/* Table: Últimos planes de corte */}
      <div className="rounded-xl border border-[#E0DBD1] bg-white">
        <div className="border-b border-[#E0DBD1] px-5 py-3">
          <h3 className="text-sm font-semibold text-[#1E1A14]">&Uacute;ltimos 10 planes de corte</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E0DBD1] text-left text-xs text-[#7A6D5A]">
                <th className="px-5 py-3 font-medium">Folio</th>
                <th className="px-5 py-3 font-medium">Obra</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Piezas</th>
                <th className="px-5 py-3 font-medium">Aprovechamiento</th>
                <th className="px-5 py-3 font-medium">Estatus</th>
                <th className="px-5 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mockUltimosPlanes.map((plan) => (
                <tr key={plan.id} className="border-b border-[#F0EDE8] hover:bg-[#FAF9F7] transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-[#7A6D5A]">{plan.folio}</td>
                  <td className="px-5 py-3 font-medium text-[#1E1A14]">{plan.obra}</td>
                  <td className="px-5 py-3 text-[#7A6D5A]">{plan.fecha}</td>
                  <td className="px-5 py-3 text-[#1E1A14]">{plan.piezas}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-[#F0EDE8]">
                        <div
                          className={`h-1.5 rounded-full ${
                            plan.aprovechamiento >= 80 ? "bg-emerald-400" : plan.aprovechamiento >= 70 ? "bg-amber-400" : "bg-red-400"
                          }`}
                          style={{ width: `${plan.aprovechamiento}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#1E1A14]">{plan.aprovechamiento}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${estatusColors[plan.estatus]}`}>
                      {plan.estatus.charAt(0).toUpperCase() + plan.estatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/optimizador/${plan.id}`}
                      className="rounded-md p-1.5 text-[#7A6D5A] hover:bg-[#F0EDE8] inline-flex"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table: Sobrantes más antiguos */}
      <div className="rounded-xl border border-[#E0DBD1] bg-white">
        <div className="border-b border-[#E0DBD1] px-5 py-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-[#1E1A14]">Sobrantes m&aacute;s antiguos sin usar</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E0DBD1] text-left text-xs text-[#7A6D5A]">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Material</th>
                <th className="px-5 py-3 font-medium">Dimensiones</th>
                <th className="px-5 py-3 font-medium">&Aacute;rea</th>
                <th className="px-5 py-3 font-medium">Calidad</th>
                <th className="px-5 py-3 font-medium">Fecha registro</th>
                <th className="px-5 py-3 font-medium">D&iacute;as sin uso</th>
              </tr>
            </thead>
            <tbody>
              {mockSobrantesAntiguos.map((sob) => (
                <tr key={sob.id} className="border-b border-[#F0EDE8] hover:bg-[#FAF9F7] transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-[#7A6D5A]">{sob.id}</td>
                  <td className="px-5 py-3 font-medium text-[#1E1A14]">{sob.material}</td>
                  <td className="px-5 py-3 text-[#7A6D5A]">{sob.dimensiones}</td>
                  <td className="px-5 py-3 text-[#7A6D5A]">{sob.area}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      sob.calidad === "Buena" ? "bg-emerald-100 text-emerald-700" :
                      sob.calidad === "Regular" ? "bg-amber-100 text-amber-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {sob.calidad}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#7A6D5A]">{sob.fecha}</td>
                  <td className="px-5 py-3">
                    <span className={`font-semibold ${sob.dias >= 10 ? "text-red-600" : sob.dias >= 7 ? "text-amber-600" : "text-[#1E1A14]"}`}>
                      {sob.dias} d&iacute;as
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table: Top materiales con más desperdicio */}
      <div className="rounded-xl border border-[#E0DBD1] bg-white">
        <div className="border-b border-[#E0DBD1] px-5 py-3">
          <h3 className="text-sm font-semibold text-[#1E1A14]">Top 5 materiales con m&aacute;s desperdicio</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E0DBD1] text-left text-xs text-[#7A6D5A]">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Material</th>
                <th className="px-5 py-3 font-medium">&Aacute;rea total sobrantes</th>
                <th className="px-5 py-3 font-medium">Piezas sobrantes</th>
                <th className="px-5 py-3 font-medium">Precio ref.</th>
              </tr>
            </thead>
            <tbody>
              {mockTopDesperdicio.map((d, i) => (
                <tr key={i} className="border-b border-[#F0EDE8] hover:bg-[#FAF9F7] transition-colors">
                  <td className="px-5 py-3">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      i === 0 ? "bg-red-100 text-red-700" : i === 1 ? "bg-amber-100 text-amber-700" : "bg-[#F0EDE8] text-[#7A6D5A]"
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-[#1E1A14]">{d.material}</td>
                  <td className="px-5 py-3 text-[#1E1A14] font-semibold">{d.areaTotal}</td>
                  <td className="px-5 py-3 text-[#7A6D5A]">{d.piezas}</td>
                  <td className="px-5 py-3 text-[#7A6D5A]">{d.precioRef}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
