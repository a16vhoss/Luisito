"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Check,
  Scissors,
  Package,
  Layers,
  Ruler,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type {
  Obra,
  ConceptoObra,
  Desperdicio,
  Lamina,
} from "@/types/database.types"

// Cutting optimizer types (will be provided by @/lib/cutting-optimizer)
interface PiezaRequerida {
  id: string
  conceptoId: string
  label: string
  largoCm: number
  anchoCm: number
}

interface FuenteMaterial {
  id: string
  tipo: "lamina" | "sobrante"
  largoCm: number
  anchoCm: number
  label: string
}

interface PiezaColocada {
  piezaId: string
  label: string
  largoCm: number
  anchoCm: number
  posX: number
  posY: number
  rotada: boolean
}

interface SobranteGenerado {
  largoCm: number
  anchoCm: number
  posX: number
  posY: number
}

interface ResultadoFuente {
  fuente: FuenteMaterial
  piezasColocadas: PiezaColocada[]
  sobrantesGenerados: SobranteGenerado[]
  areaTotal: number
  areaUsada: number
  areaSobrante: number
  porcentajeUso: number
}

interface ResultadoOptimizacion {
  fuentes: ResultadoFuente[]
  piezasNoAsignadas: PiezaRequerida[]
  resumen: {
    totalPiezas: number
    totalColocadas: number
    totalNoAsignadas: number
    aprovechamientoPromedio: number
    areaTotal: number
    areaPiezas: number
    areaDesperdicio: number
  }
}

// Simple first-fit decreasing bin packing optimizer
function optimizarCorte(
  piezas: PiezaRequerida[],
  fuentes: FuenteMaterial[]
): ResultadoOptimizacion {
  const GAP = 0.5 // kerf/blade gap in cm
  const sorted = [...piezas].sort(
    (a, b) => b.largoCm * b.anchoCm - a.largoCm * a.anchoCm
  )

  const resultFuentes: ResultadoFuente[] = fuentes.map((f) => ({
    fuente: f,
    piezasColocadas: [],
    sobrantesGenerados: [],
    areaTotal: f.largoCm * f.anchoCm,
    areaUsada: 0,
    areaSobrante: 0,
    porcentajeUso: 0,
  }))

  const unassigned: PiezaRequerida[] = []

  // Simple shelf-based packing per source
  for (const pieza of sorted) {
    let placed = false
    for (const rf of resultFuentes) {
      // Try to place using simple shelf algorithm
      const existingPiezas = rf.piezasColocadas
      // Find next available position
      let posX = 0
      let posY = 0
      let shelfHeight = 0
      let canPlace = false
      let rotada = false

      // Build occupied grid check
      const fits = (px: number, py: number, w: number, h: number) => {
        if (px + w > rf.fuente.largoCm + 0.01 || py + h > rf.fuente.anchoCm + 0.01) return false
        for (const ep of existingPiezas) {
          const ew = ep.largoCm
          const eh = ep.anchoCm
          if (
            px < ep.posX + ew + GAP &&
            px + w + GAP > ep.posX &&
            py < ep.posY + eh + GAP &&
            py + h + GAP > ep.posY
          )
            return false
        }
        return true
      }

      // Try normal orientation
      for (let y = 0; y <= rf.fuente.anchoCm - pieza.anchoCm; y += 1) {
        for (let x = 0; x <= rf.fuente.largoCm - pieza.largoCm; x += 1) {
          if (fits(x, y, pieza.largoCm, pieza.anchoCm)) {
            posX = x
            posY = y
            canPlace = true
            rotada = false
            break
          }
        }
        if (canPlace) break
      }

      // Try rotated
      if (!canPlace && pieza.largoCm !== pieza.anchoCm) {
        for (let y = 0; y <= rf.fuente.anchoCm - pieza.largoCm; y += 1) {
          for (let x = 0; x <= rf.fuente.largoCm - pieza.anchoCm; x += 1) {
            if (fits(x, y, pieza.anchoCm, pieza.largoCm)) {
              posX = x
              posY = y
              canPlace = true
              rotada = true
              break
            }
          }
          if (canPlace) break
        }
      }

      if (canPlace) {
        rf.piezasColocadas.push({
          piezaId: pieza.id,
          label: pieza.label,
          largoCm: rotada ? pieza.anchoCm : pieza.largoCm,
          anchoCm: rotada ? pieza.largoCm : pieza.anchoCm,
          posX,
          posY,
          rotada,
        })
        rf.areaUsada += pieza.largoCm * pieza.anchoCm
        placed = true
        break
      }
    }

    if (!placed) {
      unassigned.push(pieza)
    }
  }

  // Calculate sobrantes and stats
  for (const rf of resultFuentes) {
    rf.areaSobrante = rf.areaTotal - rf.areaUsada
    rf.porcentajeUso = rf.areaTotal > 0 ? (rf.areaUsada / rf.areaTotal) * 100 : 0

    // Generate sobrantes for remaining area (simplified)
    if (rf.piezasColocadas.length > 0 && rf.areaSobrante > 500) {
      // Find largest empty rectangle (simplified: right side and bottom)
      const maxPieceX = Math.max(...rf.piezasColocadas.map((p) => p.posX + p.largoCm), 0)
      const maxPieceY = Math.max(...rf.piezasColocadas.map((p) => p.posY + p.anchoCm), 0)

      if (rf.fuente.largoCm - maxPieceX > 10) {
        rf.sobrantesGenerados.push({
          largoCm: Math.round(rf.fuente.largoCm - maxPieceX - GAP),
          anchoCm: rf.fuente.anchoCm,
          posX: Math.round(maxPieceX + GAP),
          posY: 0,
        })
      }
      if (rf.fuente.anchoCm - maxPieceY > 10 && maxPieceX > 0) {
        rf.sobrantesGenerados.push({
          largoCm: Math.round(maxPieceX),
          anchoCm: Math.round(rf.fuente.anchoCm - maxPieceY - GAP),
          posX: 0,
          posY: Math.round(maxPieceY + GAP),
        })
      }
    }
  }

  const usedFuentes = resultFuentes.filter((rf) => rf.piezasColocadas.length > 0)
  const totalAreaPiezas = usedFuentes.reduce((s, rf) => s + rf.areaUsada, 0)
  const totalAreaMaterial = usedFuentes.reduce((s, rf) => s + rf.areaTotal, 0)

  return {
    fuentes: resultFuentes,
    piezasNoAsignadas: unassigned,
    resumen: {
      totalPiezas: piezas.length,
      totalColocadas: piezas.length - unassigned.length,
      totalNoAsignadas: unassigned.length,
      aprovechamientoPromedio:
        totalAreaMaterial > 0 ? (totalAreaPiezas / totalAreaMaterial) * 100 : 0,
      areaTotal: totalAreaMaterial,
      areaPiezas: totalAreaPiezas,
      areaDesperdicio: totalAreaMaterial - totalAreaPiezas,
    },
  }
}

// Visual cutting plan component
function CuttingPlanViewer({ resultado }: { resultado: ResultadoFuente }) {
  const { fuente, piezasColocadas, sobrantesGenerados } = resultado
  const scale = Math.min(300 / fuente.largoCm, 200 / fuente.anchoCm, 2)
  const svgW = fuente.largoCm * scale
  const svgH = fuente.anchoCm * scale

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
        {/* Source outline */}
        <rect
          x={0}
          y={0}
          width={svgW}
          height={svgH}
          fill="#f5f5f0"
          stroke="#d4d0c8"
          strokeWidth={1}
        />
        {/* Placed pieces */}
        {piezasColocadas.map((p, i) => (
          <g key={i}>
            <rect
              x={p.posX * scale}
              y={p.posY * scale}
              width={p.largoCm * scale}
              height={p.anchoCm * scale}
              fill={colors[i % colors.length]}
              fillOpacity={0.7}
              stroke={colors[i % colors.length]}
              strokeWidth={1}
              rx={2}
            />
            <text
              x={(p.posX + p.largoCm / 2) * scale}
              y={(p.posY + p.anchoCm / 2) * scale}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[8px] fill-white font-bold"
              style={{ fontSize: Math.min(p.largoCm * scale * 0.25, 10) }}
            >
              {p.label}
            </text>
          </g>
        ))}
        {/* Generated sobrantes */}
        {sobrantesGenerados.map((s, i) => (
          <rect
            key={`s-${i}`}
            x={s.posX * scale}
            y={s.posY * scale}
            width={s.largoCm * scale}
            height={s.anchoCm * scale}
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

// Summary card component
function CuttingPlanSummary({ resumen }: { resumen: ResultadoOptimizacion["resumen"] }) {
  return (
    <div className="rounded-xl border border-golden/30 bg-golden/5 p-4">
      <p className="text-xs font-semibold tracking-wider text-golden uppercase">
        Resumen de Optimización
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-marble-400 uppercase">Piezas colocadas</p>
          <p className="text-lg font-bold text-marble-900">
            {resumen.totalColocadas}
            <span className="text-sm font-normal text-marble-400"> / {resumen.totalPiezas}</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-marble-400 uppercase">Aprovechamiento</p>
          <p className="text-lg font-bold text-marble-900">
            {resumen.aprovechamientoPromedio.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-[10px] text-marble-400 uppercase">Area piezas</p>
          <p className="text-sm font-bold text-marble-900">
            {(resumen.areaPiezas / 10000).toFixed(2)} m²
          </p>
        </div>
        <div>
          <p className="text-[10px] text-marble-400 uppercase">Desperdicio</p>
          <p className="text-sm font-bold text-marble-900">
            {(resumen.areaDesperdicio / 10000).toFixed(2)} m²
          </p>
        </div>
      </div>
      {resumen.totalNoAsignadas > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-semaforo-rojo/10 p-2">
          <AlertTriangle className="h-4 w-4 text-semaforo-rojo shrink-0" />
          <p className="text-xs text-semaforo-rojo">
            {resumen.totalNoAsignadas} pieza(s) no pudieron ser asignadas
          </p>
        </div>
      )}
    </div>
  )
}

type Step = 1 | 2 | 3

interface ConceptoSeleccion {
  concepto: ConceptoObra
  cantidad: number
  selected: boolean
}

interface FuenteSeleccion {
  id: string
  tipo: "lamina" | "sobrante"
  label: string
  largoCm: number
  anchoCm: number
  espesorCm: number
  selected: boolean
  original: Lamina | Desperdicio
}

export default function OptimizadorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)

  // Step 1 state
  const [obras, setObras] = useState<Obra[]>([])
  const [obraId, setObraId] = useState("")
  const [conceptos, setConceptos] = useState<ConceptoSeleccion[]>([])
  const [loadingConceptos, setLoadingConceptos] = useState(false)

  // Step 2 state
  const [fuentes, setFuentes] = useState<FuenteSeleccion[]>([])
  const [loadingFuentes, setLoadingFuentes] = useState(false)

  // Step 3 state
  const [resultado, setResultado] = useState<ResultadoOptimizacion | null>(null)

  // Load obras on mount
  useEffect(() => {
    loadObras()
  }, [])

  async function loadObras() {
    const { data } = await supabase
      .from("obras")
      .select("*")
      .eq("estatus", "activa")
      .order("nombre")
    if (data) setObras(data as Obra[])
  }

  async function loadConceptos(obraId: string) {
    setLoadingConceptos(true)
    const { data } = await supabase
      .from("conceptos_obra")
      .select("*")
      .eq("obra_id", obraId)
      .order("tipo_pieza")
    if (data) {
      setConceptos(
        (data as ConceptoObra[])
          .filter((c) => c.cantidad_vendida > c.cantidad_enviada)
          .map((c) => ({
            concepto: c,
            cantidad: Math.min(c.cantidad_vendida - c.cantidad_enviada, 5),
            selected: true,
          }))
      )
    }
    setLoadingConceptos(false)
  }

  async function loadFuentes() {
    setLoadingFuentes(true)

    // Get unique material types from selected conceptos
    const materiales = [
      ...new Set(
        conceptos.filter((c) => c.selected).map((c) => c.concepto.material_tipo)
      ),
    ]

    // Load matching sobrantes
    const { data: sobrantesData } = await supabase
      .from("desperdicios")
      .select("*")
      .eq("disponible", true)
      .in("tipo_material", materiales)
      .order("largo_cm", { ascending: false })

    // Load matching laminas
    const { data: laminasData } = await supabase
      .from("laminas")
      .select("*, material:materiales(*)")
      .eq("estado", "disponible")
      .in("tipo_piedra", materiales)
      .order("largo_cm", { ascending: false })

    const fuentesList: FuenteSeleccion[] = []

    if (laminasData) {
      for (const l of laminasData as Lamina[]) {
        fuentesList.push({
          id: l.id,
          tipo: "lamina",
          label: `Lamina ${l.tipo_piedra} ${l.largo_cm}x${l.ancho_cm}`,
          largoCm: l.largo_cm,
          anchoCm: l.ancho_cm,
          espesorCm: l.espesor_cm,
          selected: true,
          original: l,
        })
      }
    }

    if (sobrantesData) {
      for (const s of sobrantesData as Desperdicio[]) {
        fuentesList.push({
          id: s.id,
          tipo: "sobrante",
          label: `Sobrante ${s.tipo_material} ${s.largo_cm}x${s.ancho_cm}`,
          largoCm: s.largo_cm,
          anchoCm: s.ancho_cm,
          espesorCm: s.espesor_cm,
          selected: true,
          original: s,
        })
      }
    }

    setFuentes(fuentesList)
    setLoadingFuentes(false)
  }

  function runOptimization() {
    const selectedConceptos = conceptos.filter((c) => c.selected)
    const selectedFuentes = fuentes.filter((f) => f.selected)

    // Build pieza list
    const piezasList: PiezaRequerida[] = []
    let piezaCounter = 1
    for (const cs of selectedConceptos) {
      for (let i = 0; i < cs.cantidad; i++) {
        piezasList.push({
          id: `p-${piezaCounter}`,
          conceptoId: cs.concepto.id,
          label: `${cs.concepto.tipo_pieza} #${i + 1}`,
          largoCm: cs.concepto.medida_largo,
          anchoCm: cs.concepto.medida_ancho,
        })
        piezaCounter++
      }
    }

    // Build fuentes list
    const fuentesMat: FuenteMaterial[] = selectedFuentes.map((f) => ({
      id: f.id,
      tipo: f.tipo,
      largoCm: f.largoCm,
      anchoCm: f.anchoCm,
      label: f.label,
    }))

    const result = optimizarCorte(piezasList, fuentesMat)
    setResultado(result)
    setStep(3)
  }

  async function handleApprove() {
    if (!resultado) return
    setLoading(true)

    const usedFuentes = resultado.fuentes.filter(
      (rf) => rf.piezasColocadas.length > 0
    )

    // Create plan_corte
    const { data: planData, error: planError } = await supabase
      .from("planes_corte")
      .insert({
        obra_id: obraId || null,
        estatus: "aprobado",
        total_piezas: resultado.resumen.totalColocadas,
        total_laminas_usadas: usedFuentes.filter(
          (rf) => rf.fuente.tipo === "lamina"
        ).length,
        total_sobrantes_usados: usedFuentes.filter(
          (rf) => rf.fuente.tipo === "sobrante"
        ).length,
        total_sobrantes_generados: usedFuentes.reduce(
          (s, rf) => s + rf.sobrantesGenerados.length,
          0
        ),
        porcentaje_aprovechamiento: resultado.resumen.aprovechamientoPromedio,
        area_total_material: resultado.resumen.areaTotal,
        area_total_piezas: resultado.resumen.areaPiezas,
        area_total_desperdicio: resultado.resumen.areaDesperdicio,
      })
      .select("id")
      .single()

    if (planError || !planData) {
      toast({
        title: "Error",
        description: planError?.message || "No se pudo crear el plan",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const planId = planData.id

    // Create fuentes, piezas, sobrantes
    for (const rf of usedFuentes) {
      const { data: fuenteData } = await supabase
        .from("planes_corte_fuentes")
        .insert({
          plan_id: planId,
          tipo_fuente: rf.fuente.tipo,
          lamina_id: rf.fuente.tipo === "lamina" ? rf.fuente.id : null,
          desperdicio_id: rf.fuente.tipo === "sobrante" ? rf.fuente.id : null,
          largo_cm: rf.fuente.largoCm,
          ancho_cm: rf.fuente.anchoCm,
          area_total: rf.areaTotal,
          area_usada: rf.areaUsada,
          area_sobrante: rf.areaSobrante,
          porcentaje_uso: rf.porcentajeUso,
        })
        .select("id")
        .single()

      if (!fuenteData) continue
      const fuenteId = fuenteData.id

      // Insert pieces
      if (rf.piezasColocadas.length > 0) {
        await supabase.from("planes_corte_piezas").insert(
          rf.piezasColocadas.map((p) => {
            const conceptoMatch = conceptos.find((c) =>
              p.label.startsWith(c.concepto.tipo_pieza)
            )
            return {
              fuente_id: fuenteId,
              concepto_id: conceptoMatch?.concepto.id || null,
              label: p.label,
              largo_cm: p.largoCm,
              ancho_cm: p.anchoCm,
              pos_x: p.posX,
              pos_y: p.posY,
              rotada: p.rotada,
            }
          })
        )
      }

      // Insert generated sobrantes
      if (rf.sobrantesGenerados.length > 0) {
        await supabase.from("planes_corte_sobrantes_generados").insert(
          rf.sobrantesGenerados.map((s) => ({
            fuente_id: fuenteId,
            largo_cm: s.largoCm,
            ancho_cm: s.anchoCm,
            pos_x: s.posX,
            pos_y: s.posY,
          }))
        )
      }

      // Update source availability
      if (rf.fuente.tipo === "lamina") {
        await supabase
          .from("laminas")
          .update({ estado: "en_corte" })
          .eq("id", rf.fuente.id)
      } else {
        await supabase
          .from("desperdicios")
          .update({ disponible: false })
          .eq("id", rf.fuente.id)
      }
    }

    setLoading(false)
    toast({
      title: "Plan aprobado",
      description: `Plan de corte guardado con ${resultado.resumen.totalColocadas} piezas`,
    })
    setTimeout(() => {
      router.push(`/taller/optimizador/${planId}`)
    }, 1000)
  }

  const selectedConceptosCount = conceptos.filter((c) => c.selected).length
  const selectedFuentesCount = fuentes.filter((f) => f.selected).length

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link
            href="/taller/dashboard"
            className="rounded-full p-1.5 active:bg-marble-800"
          >
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Optimizador de Corte</h1>
            <p className="text-xs text-marble-400">Minimizar desperdicio de material</p>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 bg-white border-b border-marble-200 px-5 py-3">
        {[
          { n: 1, label: "Piezas" },
          { n: 2, label: "Material" },
          { n: 3, label: "Resultado" },
        ].map((s, i) => (
          <React.Fragment key={s.n}>
            {i > 0 && (
              <div
                className={`h-px w-8 ${
                  step >= s.n ? "bg-golden" : "bg-marble-300"
                }`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  step > s.n
                    ? "bg-semaforo-verde text-white"
                    : step === s.n
                    ? "bg-golden text-marble-950"
                    : "bg-marble-200 text-marble-500"
                }`}
              >
                {step > s.n ? <Check className="h-4 w-4" /> : s.n}
              </div>
              <span
                className={`text-xs font-semibold ${
                  step >= s.n ? "text-marble-900" : "text-marble-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="px-5 py-6">
        {/* ===== STEP 1: Select pieces ===== */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Select obra */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Obra / Proyecto
              </Label>
              <div className="relative">
                <select
                  value={obraId}
                  onChange={(e) => {
                    setObraId(e.target.value)
                    if (e.target.value) loadConceptos(e.target.value)
                    else setConceptos([])
                  }}
                  className="h-12 w-full appearance-none rounded-xl border border-marble-200 bg-white px-4 pr-10 text-sm font-medium text-marble-900 focus:border-golden focus:outline-none focus:ring-1 focus:ring-golden"
                >
                  <option value="">Seleccionar obra...</option>
                  {obras.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre} - {o.cliente}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-400 pointer-events-none" />
              </div>
            </div>

            {/* Loading conceptos */}
            {loadingConceptos && (
              <div className="text-center py-8">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-marble-300 border-t-golden" />
                <p className="mt-2 text-sm text-marble-400">Cargando conceptos...</p>
              </div>
            )}

            {/* Conceptos list */}
            {!loadingConceptos && conceptos.length > 0 && (
              <div className="space-y-3">
                <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" /> Piezas pendientes ({selectedConceptosCount} seleccionadas)
                </Label>
                <div className="space-y-2">
                  {conceptos.map((cs, idx) => {
                    const pendientes =
                      cs.concepto.cantidad_vendida - cs.concepto.cantidad_enviada
                    return (
                      <div
                        key={cs.concepto.id}
                        className={`rounded-xl border p-4 transition-colors ${
                          cs.selected
                            ? "border-golden/50 bg-golden/5"
                            : "border-marble-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={cs.selected}
                            onChange={(e) => {
                              const updated = [...conceptos]
                              updated[idx] = { ...updated[idx], selected: e.target.checked }
                              setConceptos(updated)
                            }}
                            className="mt-0.5 h-5 w-5 rounded border-marble-300 text-golden focus:ring-golden"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-marble-900">
                              {cs.concepto.tipo_pieza}
                            </p>
                            <p className="text-xs text-marble-500">
                              {cs.concepto.material_tipo} &middot;{" "}
                              {cs.concepto.medida_largo} x {cs.concepto.medida_ancho}
                              {cs.concepto.medida_espesor
                                ? ` x ${cs.concepto.medida_espesor}`
                                : ""}{" "}
                              cm
                            </p>
                            <p className="text-xs text-marble-400">
                              {pendientes} pendiente(s)
                            </p>
                          </div>
                        </div>
                        {cs.selected && (
                          <div className="mt-3 flex items-center gap-3 pl-8">
                            <span className="text-xs text-marble-500">Cantidad:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const updated = [...conceptos]
                                  updated[idx] = {
                                    ...updated[idx],
                                    cantidad: Math.max(1, updated[idx].cantidad - 1),
                                  }
                                  setConceptos(updated)
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-marble-200 active:bg-marble-100"
                              >
                                <span className="text-marble-600 font-bold">-</span>
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-marble-900">
                                {cs.cantidad}
                              </span>
                              <button
                                onClick={() => {
                                  const updated = [...conceptos]
                                  updated[idx] = {
                                    ...updated[idx],
                                    cantidad: Math.min(
                                      pendientes,
                                      updated[idx].cantidad + 1
                                    ),
                                  }
                                  setConceptos(updated)
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-marble-200 active:bg-marble-100"
                              >
                                <span className="text-marble-600 font-bold">+</span>
                              </button>
                            </div>
                            <span className="text-[10px] text-marble-400">
                              máx {pendientes}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {!loadingConceptos && obraId && conceptos.length === 0 && (
              <div className="text-center py-8">
                <Package className="mx-auto h-10 w-10 text-marble-300" />
                <p className="mt-2 text-sm text-marble-400">
                  No hay piezas pendientes para esta obra
                </p>
              </div>
            )}

            {/* Next */}
            <Button
              className="h-12 w-full rounded-xl bg-golden text-sm font-bold tracking-wide text-marble-950 hover:bg-golden-light active:bg-golden-dark disabled:opacity-50"
              disabled={selectedConceptosCount === 0}
              onClick={() => {
                loadFuentes()
                setStep(2)
              }}
            >
              Siguiente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ===== STEP 2: Select material ===== */}
        {step === 2 && (
          <div className="space-y-6">
            {loadingFuentes && (
              <div className="text-center py-8">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-marble-300 border-t-golden" />
                <p className="mt-2 text-sm text-marble-400">
                  Buscando material disponible...
                </p>
              </div>
            )}

            {!loadingFuentes && (
              <>
                <div className="space-y-3">
                  <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> Material disponible (
                    {selectedFuentesCount} seleccionadas)
                  </Label>

                  {fuentes.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-10 w-10 text-marble-300" />
                      <p className="mt-2 text-sm text-marble-400">
                        No se encontró material compatible disponible
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {fuentes.map((f, idx) => (
                      <div
                        key={f.id}
                        className={`rounded-xl border p-4 transition-colors ${
                          f.selected
                            ? "border-golden/50 bg-golden/5"
                            : "border-marble-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={f.selected}
                            onChange={(e) => {
                              const updated = [...fuentes]
                              updated[idx] = { ...updated[idx], selected: e.target.checked }
                              setFuentes(updated)
                            }}
                            className="mt-0.5 h-5 w-5 rounded border-marble-300 text-golden focus:ring-golden"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-marble-900">
                                {f.label}
                              </p>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  f.tipo === "lamina"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {f.tipo === "lamina" ? "LAMINA" : "SOBRANTE"}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-marble-500">
                              <span className="flex items-center gap-1">
                                <Ruler className="h-3 w-3" />
                                {f.largoCm} x {f.anchoCm} x {f.espesorCm} cm
                              </span>
                              <span>
                                {((f.largoCm * f.anchoCm) / 10000).toFixed(2)} m²
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="h-12 flex-1 rounded-xl border-marble-200 text-sm font-semibold text-marble-600"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                  </Button>
                  <Button
                    className="h-12 flex-1 rounded-xl bg-golden text-sm font-bold tracking-wide text-marble-950 hover:bg-golden-light active:bg-golden-dark disabled:opacity-50"
                    disabled={selectedFuentesCount === 0}
                    onClick={runOptimization}
                  >
                    <Scissors className="mr-2 h-4 w-4" /> Optimizar
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== STEP 3: Results ===== */}
        {step === 3 && resultado && (
          <div className="space-y-6">
            {/* Summary */}
            <CuttingPlanSummary resumen={resultado.resumen} />

            {/* Visual plans per source */}
            {resultado.fuentes
              .filter((rf) => rf.piezasColocadas.length > 0)
              .map((rf, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-marble-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-marble-900">
                        {rf.fuente.label}
                      </p>
                      <p className="text-xs text-marble-400">
                        {rf.piezasColocadas.length} pieza(s) &middot;{" "}
                        {rf.porcentajeUso.toFixed(1)}% uso
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        rf.fuente.tipo === "lamina"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {rf.fuente.tipo === "lamina" ? "LAMINA" : "SOBRANTE"}
                    </span>
                  </div>

                  {/* Visual plan */}
                  <CuttingPlanViewer resultado={rf} />

                  {/* Pieces list */}
                  <div className="mt-3 space-y-1">
                    {rf.piezasColocadas.map((p, pi) => (
                      <div
                        key={pi}
                        className="flex items-center justify-between text-xs text-marble-600"
                      >
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-semaforo-verde" />
                          {p.label}
                        </span>
                        <span>
                          {p.largoCm} x {p.anchoCm} cm
                          {p.rotada && (
                            <span className="ml-1 text-marble-400">(rotada)</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Generated sobrantes */}
                  {rf.sobrantesGenerados.length > 0 && (
                    <div className="mt-2 border-t border-marble-100 pt-2">
                      <p className="text-[10px] font-semibold tracking-wider text-marble-400 uppercase mb-1">
                        Sobrantes generados
                      </p>
                      {rf.sobrantesGenerados.map((s, si) => (
                        <div
                          key={si}
                          className="flex items-center gap-1 text-xs text-amber-600"
                        >
                          <Scissors className="h-3 w-3" />
                          {s.largoCm} x {s.anchoCm} cm
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            {/* Unassigned pieces */}
            {resultado.piezasNoAsignadas.length > 0 && (
              <div className="rounded-xl border border-semaforo-rojo/30 bg-semaforo-rojo/5 p-4">
                <p className="text-xs font-semibold tracking-wider text-semaforo-rojo uppercase mb-2">
                  Piezas no asignadas
                </p>
                <div className="space-y-1">
                  {resultado.piezasNoAsignadas.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs text-marble-600"
                    >
                      <span className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-semaforo-rojo" />
                        {p.label}
                      </span>
                      <span>
                        {p.largoCm} x {p.anchoCm} cm
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 flex-1 rounded-xl border-marble-200 text-sm font-semibold text-marble-600"
                onClick={() => {
                  setResultado(null)
                  setStep(2)
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Reoptimizar
              </Button>
              <Button
                className="h-12 flex-1 rounded-xl bg-golden text-sm font-bold tracking-wide text-marble-950 hover:bg-golden-light active:bg-golden-dark disabled:opacity-50"
                onClick={handleApprove}
                disabled={loading || resultado.resumen.totalColocadas === 0}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {loading ? "Guardando..." : "Aprobar Plan"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
