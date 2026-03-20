"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Scissors,
  Ruler,
  Clock,
  Play,
  AlertTriangle,
  FileText,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type {
  PlanCorte,
  PlanCorteFuente,
  PlanCortePieza,
  PlanCorteSobranteGenerado,
  PlanCorteEstatus,
} from "@/types/database.types"

const estatusConfig: Record<
  PlanCorteEstatus,
  { label: string; color: string }
> = {
  borrador: {
    label: "BORRADOR",
    color: "bg-marble-200 text-marble-600",
  },
  aprobado: {
    label: "APROBADO",
    color: "bg-semaforo-amarillo/15 text-semaforo-amarillo border border-semaforo-amarillo/30",
  },
  ejecutado: {
    label: "EJECUTADO",
    color: "bg-semaforo-verde/15 text-semaforo-verde border border-semaforo-verde/30",
  },
  cancelado: {
    label: "CANCELADO",
    color: "bg-semaforo-rojo/15 text-semaforo-rojo border border-semaforo-rojo/30",
  },
}

// SVG cutting plan viewer (read-only version)
function CuttingPlanViewer({
  fuente,
  piezas,
  sobrantes,
}: {
  fuente: PlanCorteFuente
  piezas: PlanCortePieza[]
  sobrantes: PlanCorteSobranteGenerado[]
}) {
  const scale = Math.min(300 / fuente.largo_cm, 200 / fuente.ancho_cm, 2)
  const svgW = fuente.largo_cm * scale
  const svgH = fuente.ancho_cm * scale

  const colors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#6366f1",
  ]

  return (
    <div className="overflow-x-auto">
      <svg
        width={svgW + 2}
        height={svgH + 2}
        viewBox={`-1 -1 ${svgW + 2} ${svgH + 2}`}
        className="border border-marble-200 rounded-lg bg-marble-50"
      >
        <rect
          x={0}
          y={0}
          width={svgW}
          height={svgH}
          fill="#f5f5f0"
          stroke="#d4d0c8"
          strokeWidth={1}
        />
        {piezas.map((p, i) => (
          <g key={p.id}>
            <rect
              x={p.pos_x * scale}
              y={p.pos_y * scale}
              width={p.largo_cm * scale}
              height={p.ancho_cm * scale}
              fill={colors[i % colors.length]}
              fillOpacity={0.7}
              stroke={colors[i % colors.length]}
              strokeWidth={1}
              rx={2}
            />
            <text
              x={(p.pos_x + p.largo_cm / 2) * scale}
              y={(p.pos_y + p.ancho_cm / 2) * scale}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-white font-bold"
              style={{ fontSize: Math.min(p.largo_cm * scale * 0.25, 10) }}
            >
              {p.label}
            </text>
          </g>
        ))}
        {sobrantes.map((s, i) => (
          <rect
            key={s.id}
            x={s.pos_x * scale}
            y={s.pos_y * scale}
            width={s.largo_cm * scale}
            height={s.ancho_cm * scale}
            fill="#fbbf24"
            fillOpacity={0.2}
            stroke="#f59e0b"
            strokeWidth={1}
            strokeDasharray="4 2"
            rx={2}
          />
        ))}
      </svg>
    </div>
  )
}

export default function PlanCorteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const planId = params.id as string
  const { toast } = useToast()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [plan, setPlan] = useState<PlanCorte | null>(null)
  const [fuentes, setFuentes] = useState<
    (PlanCorteFuente & {
      piezas: PlanCortePieza[]
      sobrantes_generados: PlanCorteSobranteGenerado[]
    })[]
  >([])

  useEffect(() => {
    loadPlan()
  }, [planId])

  async function loadPlan() {
    setLoading(true)

    // Load plan
    const { data: planData, error: planError } = await supabase
      .from("planes_corte")
      .select("*, obra:obras(*)")
      .eq("id", planId)
      .single()

    if (planError || !planData) {
      setLoading(false)
      return
    }

    setPlan(planData as PlanCorte)

    // Load fuentes with their piezas and sobrantes
    const { data: fuentesData } = await supabase
      .from("planes_corte_fuentes")
      .select("*")
      .eq("plan_id", planId)
      .order("created_at" as never)

    if (fuentesData) {
      const fuentesWithDetails = []

      for (const fuente of fuentesData) {
        const { data: piezasData } = await supabase
          .from("planes_corte_piezas")
          .select("*")
          .eq("fuente_id", fuente.id)

        const { data: sobrantesData } = await supabase
          .from("planes_corte_sobrantes_generados")
          .select("*")
          .eq("fuente_id", fuente.id)

        fuentesWithDetails.push({
          ...fuente,
          piezas: (piezasData || []) as PlanCortePieza[],
          sobrantes_generados: (sobrantesData || []) as PlanCorteSobranteGenerado[],
        })
      }

      setFuentes(fuentesWithDetails as typeof fuentes)
    }

    setLoading(false)
  }

  async function handleApprove() {
    if (!plan) return
    setActionLoading(true)

    const { error } = await supabase
      .from("planes_corte")
      .update({ estatus: "aprobado" })
      .eq("id", planId)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setPlan({ ...plan, estatus: "aprobado" })
      toast({ title: "Plan aprobado", description: "El plan de corte fue aprobado." })
    }

    setActionLoading(false)
  }

  async function handleExecute() {
    if (!plan) return
    if (
      !confirm(
        "Al ejecutar el plan se crearán los sobrantes generados y se marcará como ejecutado. ¿Continuar?"
      )
    )
      return

    setActionLoading(true)

    // Create desperdicios records for generated sobrantes
    for (const fuente of fuentes) {
      for (const sobrante of fuente.sobrantes_generados) {
        if (sobrante.largo_cm > 5 && sobrante.ancho_cm > 5) {
          const { data: despData } = await supabase
            .from("desperdicios")
            .insert({
              tipo_material: fuente.tipo_fuente === "lamina" ? "Lamina" : "Sobrante",
              largo_cm: sobrante.largo_cm,
              ancho_cm: sobrante.ancho_cm,
              espesor_cm: 2, // default, could be improved
              es_irregular: false,
              calidad: sobrante.largo_cm > 30 && sobrante.ancho_cm > 30 ? "buena" : "regular",
              ubicacion_planta: null,
              foto_url: null,
              disponible: true,
            })
            .select("id")
            .single()

          if (despData) {
            // Link sobrante generado to the new desperdicio
            await supabase
              .from("planes_corte_sobrantes_generados")
              .update({ desperdicio_generado_id: despData.id })
              .eq("id", sobrante.id)
          }
        }
      }

      // Mark laminas as agotada
      if (fuente.tipo_fuente === "lamina" && fuente.lamina_id) {
        await supabase
          .from("laminas")
          .update({ estado: "agotada" })
          .eq("id", fuente.lamina_id)
      }
    }

    // Mark plan as executed
    const { error } = await supabase
      .from("planes_corte")
      .update({ estatus: "ejecutado" })
      .eq("id", planId)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setPlan({ ...plan, estatus: "ejecutado" })
      toast({
        title: "Plan ejecutado",
        description: "Se crearon los sobrantes generados y se actualizó el inventario.",
      })
    }

    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7]">
        <header className="bg-marble-950 px-5 pb-5 pt-4">
          <div className="flex items-center gap-3">
            <Link
              href="/taller/optimizador"
              className="rounded-full p-1.5 active:bg-marble-800"
            >
              <ArrowLeft className="h-5 w-5 text-marble-400" />
            </Link>
            <h1 className="text-lg font-bold text-white">Cargando...</h1>
          </div>
        </header>
        <div className="mt-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-marble-300 border-t-golden" />
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#FAF9F7]">
        <header className="bg-marble-950 px-5 pb-5 pt-4">
          <div className="flex items-center gap-3">
            <Link
              href="/taller/optimizador"
              className="rounded-full p-1.5 active:bg-marble-800"
            >
              <ArrowLeft className="h-5 w-5 text-marble-400" />
            </Link>
            <h1 className="text-lg font-bold text-white">Plan no encontrado</h1>
          </div>
        </header>
        <div className="mt-12 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-marble-300" />
          <p className="mt-2 text-sm text-marble-400">
            No se encontró el plan de corte solicitado
          </p>
        </div>
      </div>
    )
  }

  const estatus = estatusConfig[plan.estatus]

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link
            href="/taller/optimizador"
            className="rounded-full p-1.5 active:bg-marble-800"
          >
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">Plan de Corte</h1>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${estatus.color}`}
              >
                {estatus.label}
              </span>
            </div>
            <p className="text-xs text-marble-400">
              {plan.obra?.nombre || "Sin obra asignada"}
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* Summary card */}
        <div className="rounded-xl border border-golden/30 bg-golden/5 p-4">
          <p className="text-xs font-semibold tracking-wider text-golden uppercase">
            Resumen del Plan
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-marble-400 uppercase">Piezas totales</p>
              <p className="text-lg font-bold text-marble-900">
                {plan.total_piezas}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-marble-400 uppercase">Aprovechamiento</p>
              <p className="text-lg font-bold text-marble-900">
                {plan.porcentaje_aprovechamiento.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-[10px] text-marble-400 uppercase">Laminas usadas</p>
              <p className="text-sm font-bold text-marble-900">
                {plan.total_laminas_usadas}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-marble-400 uppercase">Sobrantes usados</p>
              <p className="text-sm font-bold text-marble-900">
                {plan.total_sobrantes_usados}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-marble-400 uppercase">Area piezas</p>
              <p className="text-sm font-bold text-marble-900">
                {(plan.area_total_piezas / 10000).toFixed(2)} m²
              </p>
            </div>
            <div>
              <p className="text-[10px] text-marble-400 uppercase">Desperdicio</p>
              <p className="text-sm font-bold text-marble-900">
                {(plan.area_total_desperdicio / 10000).toFixed(2)} m²
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-marble-400">
            <Clock className="h-3 w-3" />
            Creado: {new Date(plan.created_at).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Fuentes with visual plans */}
        {fuentes.map((fuente, idx) => (
          <div
            key={fuente.id}
            className="rounded-xl border border-marble-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-marble-900">
                  Fuente {idx + 1}:{" "}
                  {fuente.tipo_fuente === "lamina" ? "Lamina" : "Sobrante"}
                </p>
                <p className="text-xs text-marble-400">
                  {fuente.largo_cm} x {fuente.ancho_cm} cm &middot;{" "}
                  {fuente.porcentaje_uso.toFixed(1)}% uso
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  fuente.tipo_fuente === "lamina"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {fuente.tipo_fuente === "lamina" ? "LAMINA" : "SOBRANTE"}
              </span>
            </div>

            {/* Visual cutting plan */}
            <CuttingPlanViewer
              fuente={fuente as PlanCorteFuente}
              piezas={fuente.piezas}
              sobrantes={fuente.sobrantes_generados}
            />

            {/* Pieces list */}
            <div className="mt-3 space-y-1">
              {fuente.piezas.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-xs text-marble-600"
                >
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-semaforo-verde" />
                    {p.label}
                  </span>
                  <span>
                    {p.largo_cm} x {p.ancho_cm} cm
                    {p.rotada && (
                      <span className="ml-1 text-marble-400">(rotada)</span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Generated sobrantes */}
            {fuente.sobrantes_generados.length > 0 && (
              <div className="mt-2 border-t border-marble-100 pt-2">
                <p className="text-[10px] font-semibold tracking-wider text-marble-400 uppercase mb-1">
                  Sobrantes generados
                </p>
                {fuente.sobrantes_generados.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between text-xs text-amber-600"
                  >
                    <span className="flex items-center gap-1">
                      <Scissors className="h-3 w-3" />
                      {s.largo_cm} x {s.ancho_cm} cm
                    </span>
                    {s.desperdicio_generado_id && (
                      <span className="text-[10px] text-semaforo-verde">
                        Registrado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Plan notes */}
        {plan.notas && (
          <div className="rounded-xl border border-marble-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold tracking-wider text-marble-400 uppercase flex items-center gap-1.5 mb-2">
              <FileText className="h-3.5 w-3.5" /> Notas
            </p>
            <p className="text-sm text-marble-600">{plan.notas}</p>
          </div>
        )}

        {/* Action buttons */}
        {plan.estatus === "borrador" && (
          <Button
            className="h-12 w-full rounded-xl bg-golden text-sm font-bold tracking-wide text-marble-950 hover:bg-golden-light active:bg-golden-dark disabled:opacity-50"
            onClick={handleApprove}
            disabled={actionLoading}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {actionLoading ? "Aprobando..." : "Aprobar Plan"}
          </Button>
        )}

        {plan.estatus === "aprobado" && (
          <Button
            className="h-12 w-full rounded-xl bg-semaforo-verde text-sm font-bold tracking-wide text-white hover:bg-semaforo-verde/90 active:bg-semaforo-verde/80 disabled:opacity-50"
            onClick={handleExecute}
            disabled={actionLoading}
          >
            <Play className="mr-2 h-4 w-4" />
            {actionLoading ? "Ejecutando..." : "Ejecutar Plan"}
          </Button>
        )}

        {plan.estatus === "ejecutado" && (
          <div className="rounded-xl border border-semaforo-verde/30 bg-semaforo-verde/5 p-4 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-semaforo-verde" />
            <p className="mt-2 text-sm font-semibold text-semaforo-verde">
              Plan ejecutado exitosamente
            </p>
            <p className="text-xs text-marble-400 mt-1">
              Los sobrantes generados fueron registrados en inventario
            </p>
          </div>
        )}

        {plan.estatus === "cancelado" && (
          <div className="rounded-xl border border-semaforo-rojo/30 bg-semaforo-rojo/5 p-4 text-center">
            <XCircle className="mx-auto h-8 w-8 text-semaforo-rojo" />
            <p className="mt-2 text-sm font-semibold text-semaforo-rojo">
              Plan cancelado
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
