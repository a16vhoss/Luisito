"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  Layers,
  RotateCcw,
  Package,
  User,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react"

// ── Types ──
type PlacedPiece = {
  label: string
  x: number
  y: number
  w: number
  h: number
  rotated: boolean
}

type Remnant = { x: number; y: number; w: number; h: number }

type FuenteDetail = {
  id: string
  tipo: "lamina" | "sobrante"
  nombre: string
  largo_cm: number
  ancho_cm: number
  pieces: PlacedPiece[]
  remnants: Remnant[]
  utilization: number
}

type PlanDetail = {
  id: string
  obra: string
  creado_por: string
  aprobado_por: string | null
  estatus: "borrador" | "aprobado" | "ejecutado" | "cancelado"
  total_piezas: number
  porcentaje_aprovechamiento: number
  area_total_material: number
  area_total_piezas: number
  area_total_desperdicio: number
  notas: string | null
  created_at: string
  fuentes: FuenteDetail[]
}

// ── Mock data for a single plan ──
const mockPlan: PlanDetail = {
  id: "plan-001",
  obra: "Torre Esmeralda",
  creado_por: "Laura Castro",
  aprobado_por: "Carlos Méndez",
  estatus: "ejecutado",
  total_piezas: 24,
  porcentaje_aprovechamiento: 87,
  area_total_material: 8.96,
  area_total_piezas: 7.80,
  area_total_desperdicio: 1.16,
  notas: "Corte para pisos vestíbulo principal. Priorizar sobrantes grandes.",
  created_at: "2026-03-19T10:30:00Z",
  fuentes: [
    {
      id: "f1",
      tipo: "lamina",
      nombre: "Mármol Blanco Carrara #12",
      largo_cm: 280,
      ancho_cm: 160,
      pieces: [
        { label: "A-1", x: 0, y: 0, w: 60, h: 40, rotated: false },
        { label: "A-2", x: 60, y: 0, w: 60, h: 40, rotated: false },
        { label: "A-3", x: 120, y: 0, w: 60, h: 40, rotated: false },
        { label: "A-4", x: 180, y: 0, w: 60, h: 40, rotated: false },
        { label: "B-1", x: 0, y: 40, w: 30, h: 25, rotated: false },
        { label: "B-2", x: 30, y: 40, w: 30, h: 25, rotated: false },
        { label: "B-3", x: 60, y: 40, w: 30, h: 25, rotated: false },
        { label: "B-4", x: 90, y: 40, w: 30, h: 25, rotated: false },
        { label: "B-5", x: 120, y: 40, w: 30, h: 25, rotated: false },
        { label: "B-6", x: 150, y: 40, w: 30, h: 25, rotated: false },
        { label: "C-1", x: 0, y: 65, w: 45, h: 35, rotated: false },
        { label: "C-2", x: 45, y: 65, w: 45, h: 35, rotated: false },
        { label: "C-3", x: 90, y: 65, w: 45, h: 35, rotated: false },
        { label: "C-4", x: 135, y: 65, w: 45, h: 35, rotated: false },
      ],
      remnants: [
        { x: 240, y: 0, w: 40, h: 100 },
        { x: 0, y: 100, w: 280, h: 60 },
      ],
      utilization: 85,
    },
    {
      id: "f2",
      tipo: "sobrante",
      nombre: "Sobrante Carrara - 70x50",
      largo_cm: 70,
      ancho_cm: 50,
      pieces: [
        { label: "A-5", x: 0, y: 0, w: 60, h: 40, rotated: false },
        { label: "B-7", x: 0, y: 40, w: 30, h: 10, rotated: true },
      ],
      remnants: [
        { x: 60, y: 0, w: 10, h: 50 },
      ],
      utilization: 77,
    },
  ],
}

const estatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  borrador: { label: "Borrador", color: "bg-gray-100 text-gray-700", icon: FileText },
  aprobado: { label: "Aprobado", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  ejecutado: { label: "Ejecutado", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: Clock },
}

// ── CuttingPlanViewer ──
function CuttingPlanViewer({ fuente, maxWidth = 560 }: { fuente: FuenteDetail; maxWidth?: number }) {
  const scale = Math.min(maxWidth / fuente.largo_cm, 300 / fuente.ancho_cm)
  const svgW = fuente.largo_cm * scale
  const svgH = fuente.ancho_cm * scale

  const colors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
  ]

  return (
    <div className="overflow-x-auto">
      <svg width={svgW + 2} height={svgH + 2} className="border border-[#E0DBD1] rounded-lg bg-white">
        <rect x={1} y={1} width={svgW} height={svgH} fill="#F5F5F0" stroke="#E0DBD1" strokeWidth={1} />
        {fuente.remnants.map((r, i) => (
          <rect
            key={`r-${i}`}
            x={r.x * scale + 1}
            y={r.y * scale + 1}
            width={r.w * scale}
            height={r.h * scale}
            fill="#FEF3C7"
            stroke="#F59E0B"
            strokeWidth={0.5}
            strokeDasharray="4 2"
          />
        ))}
        {fuente.pieces.map((p, i) => (
          <g key={`p-${i}`}>
            <rect
              x={p.x * scale + 1}
              y={p.y * scale + 1}
              width={p.w * scale}
              height={p.h * scale}
              fill={colors[i % colors.length] + "33"}
              stroke={colors[i % colors.length]}
              strokeWidth={1.5}
              rx={2}
            />
            {p.w * scale > 25 && p.h * scale > 12 && (
              <text
                x={(p.x + p.w / 2) * scale + 1}
                y={(p.y + p.h / 2) * scale + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={Math.min(10, p.w * scale * 0.15)}
                fill={colors[i % colors.length]}
                fontWeight={600}
              >
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

export default function PlanDetallePage() {
  const params = useParams()
  const planId = params.id as string
  const [plan, setPlan] = useState<PlanDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In production, fetch from Supabase
    // const supabase = createClient()
    // const { data } = await supabase.from('plan_corte').select('*').eq('id', planId).single()
    setTimeout(() => {
      setPlan({ ...mockPlan, id: planId })
      setLoading(false)
    }, 300)
  }, [planId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#7A6D5A]" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="py-24 text-center text-sm text-[#7A6D5A]">
        Plan de corte no encontrado.
      </div>
    )
  }

  const est = estatusConfig[plan.estatus]
  const EstatusIcon = est.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/optimizador"
          className="rounded-lg border border-[#E0DBD1] p-2 text-[#7A6D5A] hover:bg-[#F0EDE8]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1E1A14]">Plan de Corte</h1>
            <span className="font-mono text-sm text-[#7A6D5A]">{plan.id}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${est.color}`}>
              <EstatusIcon className="h-3 w-3" />
              {est.label}
            </span>
          </div>
          <p className="text-sm text-[#7A6D5A]">{plan.obra}</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-[#E0DBD1] bg-white px-4 py-2.5 text-sm font-medium text-[#1E1A14] transition-colors hover:bg-[#F0EDE8]">
          <Download className="h-4 w-4" />
          Exportar PDF
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <p className="text-xs text-[#7A6D5A]">Total piezas</p>
          <p className="text-xl font-bold text-[#1E1A14]">{plan.total_piezas}</p>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <p className="text-xs text-[#7A6D5A]">Aprovechamiento</p>
          <p className={`text-xl font-bold ${plan.porcentaje_aprovechamiento >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
            {plan.porcentaje_aprovechamiento}%
          </p>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <p className="text-xs text-[#7A6D5A]">&Aacute;rea material</p>
          <p className="text-xl font-bold text-[#1E1A14]">{plan.area_total_material.toFixed(2)} m&sup2;</p>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <p className="text-xs text-[#7A6D5A]">&Aacute;rea piezas</p>
          <p className="text-xl font-bold text-[#1E1A14]">{plan.area_total_piezas.toFixed(2)} m&sup2;</p>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <p className="text-xs text-[#7A6D5A]">&Aacute;rea desperdicio</p>
          <p className="text-xl font-bold text-red-600">{plan.area_total_desperdicio.toFixed(2)} m&sup2;</p>
        </div>
      </div>

      {/* Meta info */}
      <div className="rounded-xl border border-[#E0DBD1] bg-white p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-[#7A6D5A]" />
            <div>
              <p className="text-xs text-[#7A6D5A]">Creado por</p>
              <p className="font-medium text-[#1E1A14]">{plan.creado_por}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-[#7A6D5A]" />
            <div>
              <p className="text-xs text-[#7A6D5A]">Aprobado por</p>
              <p className="font-medium text-[#1E1A14]">{plan.aprobado_por ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-[#7A6D5A]" />
            <div>
              <p className="text-xs text-[#7A6D5A]">Fecha</p>
              <p className="font-medium text-[#1E1A14]">
                {new Date(plan.created_at).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Layers className="h-4 w-4 text-[#7A6D5A]" />
            <div>
              <p className="text-xs text-[#7A6D5A]">Fuentes</p>
              <p className="font-medium text-[#1E1A14]">{plan.fuentes.length} (l&aacute;minas + sobrantes)</p>
            </div>
          </div>
        </div>
        {plan.notas && (
          <div className="mt-4 rounded-lg bg-[#FAF9F7] px-4 py-3">
            <p className="text-xs font-medium text-[#7A6D5A] mb-1">Notas</p>
            <p className="text-sm text-[#1E1A14]">{plan.notas}</p>
          </div>
        )}
      </div>

      {/* Fuentes detail */}
      {plan.fuentes.map((fuente) => (
        <div key={fuente.id} className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#1E1A14]">{fuente.nombre}</h3>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    fuente.tipo === "lamina" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {fuente.tipo === "lamina" ? "Lámina" : "Sobrante"}
                </span>
              </div>
              <p className="text-xs text-[#7A6D5A]">
                {fuente.largo_cm} &times; {fuente.ancho_cm} cm — {fuente.pieces.length} pieza(s)
              </p>
            </div>
            <div
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                fuente.utilization >= 80
                  ? "bg-emerald-100 text-emerald-700"
                  : fuente.utilization >= 60
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {fuente.utilization}%
            </div>
          </div>

          <CuttingPlanViewer fuente={fuente} />

          {/* Pieces list */}
          <div className="flex flex-wrap gap-2">
            {fuente.pieces.map((p, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md bg-[#F0EDE8] px-2 py-1 text-xs text-[#1E1A14]"
              >
                {p.label}: {p.w}&times;{p.h}cm
                {p.rotated && <RotateCcw className="h-3 w-3 text-[#7A6D5A]" />}
              </span>
            ))}
          </div>

          {/* Remnants */}
          {fuente.remnants.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[#7A6D5A] mb-1">Sobrantes generados</p>
              <div className="flex flex-wrap gap-2">
                {fuente.remnants.map((r, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-1 text-xs text-amber-700">
                    <Package className="h-3 w-3" />
                    {r.w}&times;{r.h}cm ({((r.w * r.h) / 10000).toFixed(3)} m&sup2;)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
