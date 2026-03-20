"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Scissors,
  Layers,
  Package,
  Eye,
  Loader2,
  RotateCcw,
  Save,
  ClipboardList,
} from "lucide-react"

// ── Types ──
type PiezaInput = {
  id: string
  label: string
  largo_cm: number
  ancho_cm: number
  cantidad: number
}

type MaterialSource = {
  id: string
  tipo: "lamina" | "sobrante"
  nombre: string
  largo_cm: number
  ancho_cm: number
  espesor_cm: number
}

type PlacedPiece = {
  label: string
  x: number
  y: number
  w: number
  h: number
  rotated: boolean
}

type CuttingResult = {
  source: MaterialSource
  pieces: PlacedPiece[]
  remnants: { x: number; y: number; w: number; h: number }[]
  usedArea: number
  totalArea: number
  utilization: number
}

// ── Simple bin-packing optimizer ──
function optimizarCorte(
  piezas: PiezaInput[],
  fuentes: MaterialSource[]
): CuttingResult[] {
  const results: CuttingResult[] = []

  // Expand pieces by cantidad
  const allPieces: { label: string; w: number; h: number }[] = []
  for (const p of piezas) {
    for (let i = 0; i < p.cantidad; i++) {
      allPieces.push({ label: `${p.label}${p.cantidad > 1 ? `-${i + 1}` : ""}`, w: p.largo_cm, h: p.ancho_cm })
    }
  }
  // Sort pieces by area descending
  allPieces.sort((a, b) => b.w * b.h - a.w * a.h)

  let remaining = [...allPieces]

  for (const fuente of fuentes) {
    if (remaining.length === 0) break

    const placed: PlacedPiece[] = []
    const sw = fuente.largo_cm
    const sh = fuente.ancho_cm

    // Simple shelf algorithm
    let cx = 0
    let cy = 0
    let shelfH = 0
    const stillRemaining: typeof remaining = []

    for (const piece of remaining) {
      let pw = piece.w
      let ph = piece.h
      let rotated = false

      // Try to fit, then try rotated
      if (cx + pw > sw) {
        // Try rotated on current shelf
        if (cx + ph <= sw && ph <= (shelfH || sh - cy)) {
          const tmp = pw
          pw = ph
          ph = tmp
          rotated = true
        } else {
          // Move to next shelf
          cy += shelfH
          cx = 0
          shelfH = 0
          // Try again
          if (cx + pw > sw) {
            if (cx + ph <= sw) {
              const tmp = pw
              pw = ph
              ph = tmp
              rotated = true
            } else {
              stillRemaining.push(piece)
              continue
            }
          }
        }
      }

      if (cy + ph > sh) {
        // Try rotated
        if (!rotated && cy + pw <= sh && cx + ph <= sw) {
          const tmp = pw
          pw = ph
          ph = tmp
          rotated = true
        } else {
          stillRemaining.push(piece)
          continue
        }
      }

      if (cy + ph > sh) {
        stillRemaining.push(piece)
        continue
      }

      placed.push({ label: piece.label, x: cx, y: cy, w: pw, h: ph, rotated })
      cx += pw
      shelfH = Math.max(shelfH, ph)
    }

    remaining = stillRemaining

    if (placed.length > 0) {
      const usedArea = placed.reduce((s, p) => s + p.w * p.h, 0)
      const totalArea = sw * sh

      // Calculate remnants (simplified: one big remnant to the right, one below)
      const remnants: { x: number; y: number; w: number; h: number }[] = []
      const maxX = Math.max(...placed.map((p) => p.x + p.w), 0)
      const maxY = Math.max(...placed.map((p) => p.y + p.h), 0)
      if (maxX < sw && maxY > 0) {
        remnants.push({ x: maxX, y: 0, w: sw - maxX, h: maxY })
      }
      if (maxY < sh) {
        remnants.push({ x: 0, y: maxY, w: sw, h: sh - maxY })
      }

      results.push({
        source: fuente,
        pieces: placed,
        remnants,
        usedArea,
        totalArea,
        utilization: Math.round((usedArea / totalArea) * 100),
      })
    }
  }

  return results
}

// ── Mock saved plans ──
const mockPlanes = [
  { id: "plan-001", obra: "Torre Esmeralda", fecha: "2026-03-19", piezas: 24, aprovechamiento: 87, estatus: "ejecutado" as const },
  { id: "plan-002", obra: "Residencial Las Palmas", fecha: "2026-03-17", piezas: 18, aprovechamiento: 82, estatus: "aprobado" as const },
  { id: "plan-003", obra: "Hotel Atlántico", fecha: "2026-03-14", piezas: 32, aprovechamiento: 91, estatus: "borrador" as const },
]

const estatusColors: Record<string, string> = {
  borrador: "bg-gray-100 text-gray-700",
  aprobado: "bg-blue-100 text-blue-700",
  ejecutado: "bg-emerald-100 text-emerald-700",
  cancelado: "bg-red-100 text-red-700",
}

// ── Mock available sources ──
const mockLaminas: MaterialSource[] = [
  { id: "lam-1", tipo: "lamina", nombre: "Mármol Blanco Carrara #12", largo_cm: 280, ancho_cm: 160, espesor_cm: 2 },
  { id: "lam-2", tipo: "lamina", nombre: "Mármol Crema Marfil #08", largo_cm: 260, ancho_cm: 150, espesor_cm: 2 },
  { id: "lam-3", tipo: "lamina", nombre: "Travertino Noce #05", largo_cm: 300, ancho_cm: 170, espesor_cm: 3 },
]

const mockSobrantes: MaterialSource[] = [
  { id: "sob-1", tipo: "sobrante", nombre: "Sobrante Carrara - 45x30", largo_cm: 45, ancho_cm: 30, espesor_cm: 2 },
  { id: "sob-2", tipo: "sobrante", nombre: "Sobrante Crema Marfil - 60x25", largo_cm: 60, ancho_cm: 25, espesor_cm: 2 },
  { id: "sob-3", tipo: "sobrante", nombre: "Sobrante Travertino - 70x50", largo_cm: 70, ancho_cm: 50, espesor_cm: 3 },
]

// ── Cutting Plan Viewer (inline component) ──
function CuttingPlanViewer({ result, maxWidth = 500 }: { result: CuttingResult; maxWidth?: number }) {
  const scale = Math.min(maxWidth / result.source.largo_cm, 300 / result.source.ancho_cm)
  const svgW = result.source.largo_cm * scale
  const svgH = result.source.ancho_cm * scale

  const colors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
  ]

  return (
    <div className="overflow-x-auto">
      <svg width={svgW + 2} height={svgH + 2} className="border border-[#E0DBD1] rounded-lg bg-white">
        {/* Background (sheet) */}
        <rect x={1} y={1} width={svgW} height={svgH} fill="#F5F5F0" stroke="#E0DBD1" strokeWidth={1} />

        {/* Remnants */}
        {result.remnants.map((r, i) => (
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

        {/* Placed pieces */}
        {result.pieces.map((p, i) => (
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
            {p.w * scale > 30 && p.h * scale > 14 && (
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

function CuttingPlanSummary({ results }: { results: CuttingResult[] }) {
  const totalPiezas = results.reduce((s, r) => s + r.pieces.length, 0)
  const totalUsed = results.reduce((s, r) => s + r.usedArea, 0)
  const totalArea = results.reduce((s, r) => s + r.totalArea, 0)
  const avgUtil = totalArea > 0 ? Math.round((totalUsed / totalArea) * 100) : 0
  const totalRemnants = results.reduce((s, r) => s + r.remnants.length, 0)

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
        <p className="text-xs text-[#7A6D5A]">Piezas cortadas</p>
        <p className="text-xl font-bold text-[#1E1A14]">{totalPiezas}</p>
      </div>
      <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
        <p className="text-xs text-[#7A6D5A]">L&aacute;minas/Sobrantes usados</p>
        <p className="text-xl font-bold text-[#1E1A14]">{results.length}</p>
      </div>
      <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
        <p className="text-xs text-[#7A6D5A]">Aprovechamiento promedio</p>
        <p className={`text-xl font-bold ${avgUtil >= 80 ? "text-emerald-600" : avgUtil >= 60 ? "text-amber-600" : "text-red-600"}`}>
          {avgUtil}%
        </p>
      </div>
      <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
        <p className="text-xs text-[#7A6D5A]">Sobrantes generados</p>
        <p className="text-xl font-bold text-[#1E1A14]">{totalRemnants}</p>
      </div>
    </div>
  )
}

export default function OptimizadorPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [piezas, setPiezas] = useState<PiezaInput[]>([
    { id: "1", label: "Pieza A", largo_cm: 60, ancho_cm: 40, cantidad: 4 },
    { id: "2", label: "Pieza B", largo_cm: 30, ancho_cm: 25, cantidad: 6 },
  ])
  const [selectedSources, setSelectedSources] = useState<MaterialSource[]>([])
  const [results, setResults] = useState<CuttingResult[] | null>(null)
  const [saving, setSaving] = useState(false)

  // ── Step 1: Pieces ──
  function addPieza() {
    setPiezas((prev) => [
      ...prev,
      { id: String(Date.now()), label: `Pieza ${String.fromCharCode(65 + prev.length)}`, largo_cm: 0, ancho_cm: 0, cantidad: 1 },
    ])
  }

  function removePieza(id: string) {
    setPiezas((prev) => prev.filter((p) => p.id !== id))
  }

  function updatePieza(id: string, field: keyof PiezaInput, value: string | number) {
    setPiezas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: typeof value === "string" && field !== "label" ? parseFloat(value) || 0 : value } : p))
    )
  }

  // ── Step 2: Sources ──
  function toggleSource(source: MaterialSource) {
    setSelectedSources((prev) => {
      const exists = prev.find((s) => s.id === source.id)
      if (exists) return prev.filter((s) => s.id !== source.id)
      return [...prev, source]
    })
  }

  // ── Step 3: Optimize ──
  function runOptimizer() {
    const result = optimizarCorte(piezas, selectedSources)
    setResults(result)
    setStep(3)
  }

  async function handleSavePlan() {
    if (!results) return
    setSaving(true)
    // In production, save to Supabase plan_corte table
    await new Promise((r) => setTimeout(r, 1000))
    setSaving(false)
    alert("Plan de corte guardado exitosamente.")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Optimizador de Corte</h1>
          <p className="text-sm text-[#7A6D5A]">Planifica cortes para maximizar el aprovechamiento del material</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "Piezas" },
          { n: 2, label: "Material" },
          { n: 3, label: "Plan de corte" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            {i > 0 && <div className={`h-px w-8 ${step >= s.n ? "bg-[#D4A843]" : "bg-[#E0DBD1]"}`} />}
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                step === s.n
                  ? "bg-[#1E1A14] text-white"
                  : step > s.n
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-[#F0EDE8] text-[#7A6D5A]"
              }`}
            >
              {step > s.n ? <Check className="h-3 w-3" /> : <span>{s.n}</span>}
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Pieces */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1E1A14] flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[#D4A843]" />
                Piezas a cortar
              </h2>
              <button
                onClick={addPieza}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E0DBD1] px-3 py-1.5 text-xs font-medium text-[#7A6D5A] hover:bg-[#F0EDE8]"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar pieza
              </button>
            </div>

            <div className="space-y-3">
              {piezas.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-[#E0DBD1] p-3">
                  <input
                    type="text"
                    value={p.label}
                    onChange={(e) => updatePieza(p.id, "label", e.target.value)}
                    className="h-9 w-32 rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
                    placeholder="Nombre"
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={p.largo_cm || ""}
                      onChange={(e) => updatePieza(p.id, "largo_cm", e.target.value)}
                      className="h-9 w-20 rounded-lg border border-[#E0DBD1] bg-white px-2 text-sm text-[#1E1A14] text-center focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
                      placeholder="Largo"
                    />
                    <span className="text-xs text-[#7A6D5A]">&times;</span>
                    <input
                      type="number"
                      value={p.ancho_cm || ""}
                      onChange={(e) => updatePieza(p.id, "ancho_cm", e.target.value)}
                      className="h-9 w-20 rounded-lg border border-[#E0DBD1] bg-white px-2 text-sm text-[#1E1A14] text-center focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
                      placeholder="Ancho"
                    />
                    <span className="text-xs text-[#7A6D5A]">cm</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#7A6D5A]">Cant:</span>
                    <input
                      type="number"
                      min={1}
                      value={p.cantidad || ""}
                      onChange={(e) => updatePieza(p.id, "cantidad", e.target.value)}
                      className="h-9 w-16 rounded-lg border border-[#E0DBD1] bg-white px-2 text-sm text-[#1E1A14] text-center focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
                    />
                  </div>
                  <div className="ml-auto text-xs text-[#7A6D5A]">
                    {p.largo_cm > 0 && p.ancho_cm > 0
                      ? `${((p.largo_cm * p.ancho_cm * p.cantidad) / 10000).toFixed(2)} m²`
                      : "—"}
                  </div>
                  <button
                    onClick={() => removePieza(p.id)}
                    className="rounded-md p-1.5 text-red-400 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={piezas.length === 0 || piezas.some((p) => p.largo_cm <= 0 || p.ancho_cm <= 0)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1E1A14] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2A2520] disabled:opacity-50"
            >
              Siguiente: Seleccionar material
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Material selection */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Láminas */}
          <div className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[#1E1A14] flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#D4A843]" />
              L&aacute;minas disponibles
            </h2>
            <div className="space-y-2">
              {mockLaminas.map((lam) => {
                const selected = selectedSources.some((s) => s.id === lam.id)
                return (
                  <label
                    key={lam.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      selected ? "border-[#D4A843] bg-amber-50/50" : "border-[#E0DBD1] hover:bg-[#FAF9F7]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSource(lam)}
                      className="h-4 w-4 rounded border-[#E0DBD1] text-[#D4A843] focus:ring-[#D4A843]"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1E1A14]">{lam.nombre}</p>
                      <p className="text-xs text-[#7A6D5A]">
                        {lam.largo_cm} &times; {lam.ancho_cm} &times; {lam.espesor_cm} cm — {((lam.largo_cm * lam.ancho_cm) / 10000).toFixed(2)} m&sup2;
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                      L&aacute;mina
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Sobrantes */}
          <div className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[#1E1A14] flex items-center gap-2">
              <Package className="h-4 w-4 text-[#D4A843]" />
              Sobrantes disponibles
            </h2>
            <div className="space-y-2">
              {mockSobrantes.map((sob) => {
                const selected = selectedSources.some((s) => s.id === sob.id)
                return (
                  <label
                    key={sob.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      selected ? "border-[#D4A843] bg-amber-50/50" : "border-[#E0DBD1] hover:bg-[#FAF9F7]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSource(sob)}
                      className="h-4 w-4 rounded border-[#E0DBD1] text-[#D4A843] focus:ring-[#D4A843]"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1E1A14]">{sob.nombre}</p>
                      <p className="text-xs text-[#7A6D5A]">
                        {sob.largo_cm} &times; {sob.ancho_cm} &times; {sob.espesor_cm} cm — {((sob.largo_cm * sob.ancho_cm) / 10000).toFixed(3)} m&sup2;
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      Sobrante
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E0DBD1] px-4 py-2.5 text-sm font-medium text-[#7A6D5A] hover:bg-[#F0EDE8]"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
            <button
              onClick={runOptimizer}
              disabled={selectedSources.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1E1A14] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2A2520] disabled:opacity-50"
            >
              <Scissors className="h-4 w-4" />
              Optimizar Corte
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && results && (
        <div className="space-y-6">
          <CuttingPlanSummary results={results} />

          {results.map((result, idx) => (
            <div key={idx} className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#1E1A14]">{result.source.nombre}</h3>
                  <p className="text-xs text-[#7A6D5A]">
                    {result.source.largo_cm} &times; {result.source.ancho_cm} cm — {result.pieces.length} pieza(s) — Aprovechamiento: {result.utilization}%
                  </p>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    result.utilization >= 80
                      ? "bg-emerald-100 text-emerald-700"
                      : result.utilization >= 60
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {result.utilization}%
                </div>
              </div>

              <CuttingPlanViewer result={result} />

              {/* Pieces list */}
              <div className="flex flex-wrap gap-2">
                {result.pieces.map((p, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md bg-[#F0EDE8] px-2 py-1 text-xs text-[#1E1A14]"
                  >
                    {p.label}: {p.w}&times;{p.h}cm
                    {p.rotated && <RotateCcw className="h-3 w-3 text-[#7A6D5A]" />}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <button
              onClick={() => { setResults(null); setStep(2) }}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E0DBD1] px-4 py-2.5 text-sm font-medium text-[#7A6D5A] hover:bg-[#F0EDE8]"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a material
            </button>
            <button
              onClick={handleSavePlan}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1E1A14] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2A2520] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Plan de Corte
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Recent Plans */}
      <div className="rounded-xl border border-[#E0DBD1] bg-white">
        <div className="border-b border-[#E0DBD1] px-5 py-3">
          <h3 className="text-sm font-semibold text-[#1E1A14]">&Uacute;ltimos planes de corte</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E0DBD1] text-left text-xs text-[#7A6D5A]">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Obra</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Piezas</th>
                <th className="px-5 py-3 font-medium">Aprovechamiento</th>
                <th className="px-5 py-3 font-medium">Estatus</th>
                <th className="px-5 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mockPlanes.map((plan) => (
                <tr key={plan.id} className="border-b border-[#F0EDE8] hover:bg-[#FAF9F7] transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-[#7A6D5A]">{plan.id}</td>
                  <td className="px-5 py-3 font-medium text-[#1E1A14]">{plan.obra}</td>
                  <td className="px-5 py-3 text-[#7A6D5A]">{plan.fecha}</td>
                  <td className="px-5 py-3 text-[#1E1A14]">{plan.piezas}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-[#F0EDE8]">
                        <div
                          className={`h-1.5 rounded-full ${
                            plan.aprovechamiento >= 80 ? "bg-emerald-400" : plan.aprovechamiento >= 60 ? "bg-amber-400" : "bg-red-400"
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
    </div>
  )
}
