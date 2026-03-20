"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Ruler,
  MapPin,
  RotateCw,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Scissors,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  buscarDesperdicioCompatible,
  TIPOS_MATERIAL,
  type ResultadoBusqueda,
} from "@/lib/desperdicios-mock"

export default function BuscarDesperdicioPage() {
  const { toast } = useToast()
  const [largoCm, setLargoCm] = useState("")
  const [anchoCm, setAnchoCm] = useState("")
  const [tipoMaterial, setTipoMaterial] = useState("")
  const [resultados, setResultados] = useState<ResultadoBusqueda[] | null>(null)
  const [busquedaRealizada, setBusquedaRealizada] = useState(false)

  const handleBuscar = () => {
    if (!largoCm || !anchoCm) {
      toast({ title: "Error", description: "Ingresa largo y ancho de la pieza.", variant: "destructive" })
      return
    }
    if (Number(largoCm) <= 0 || Number(anchoCm) <= 0) {
      toast({ title: "Error", description: "Las medidas deben ser mayores a 0.", variant: "destructive" })
      return
    }

    const results = buscarDesperdicioCompatible({
      largoCm: Number(largoCm),
      anchoCm: Number(anchoCm),
      tipoMaterial: tipoMaterial || undefined,
    })

    setResultados(results)
    setBusquedaRealizada(true)
  }

  const handleUsar = (resultado: ResultadoBusqueda) => {
    toast({
      title: "Retazo marcado como usado",
      description: `${resultado.desperdicio.tipo_material} — ${resultado.desperdicio.largo_cm} × ${resultado.desperdicio.ancho_cm} cm`,
    })
    // Remove from results
    setResultados((prev) => prev?.filter((r) => r.desperdicio.id !== resultado.desperdicio.id) ?? null)
  }

  const getAprovechamientoColor = (pct: number) => {
    if (pct >= 80) return { bar: "bg-semaforo-verde", text: "text-semaforo-verde" }
    if (pct >= 50) return { bar: "bg-semaforo-amarillo", text: "text-semaforo-amarillo" }
    return { bar: "bg-semaforo-rojo", text: "text-semaforo-rojo" }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/taller/desperdicios" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Buscar Pieza</h1>
            <p className="text-xs text-marble-400">Encontrar retazo compatible</p>
          </div>
        </div>
      </header>

      <div className="px-5 py-6">
        {/* Search Form */}
        <div className="rounded-2xl border border-marble-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-wider text-marble-500 uppercase mb-4">
            Medidas de la pieza que necesitas
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-medium text-marble-400 mb-1 block">Largo (cm)</label>
              <Input
                type="number"
                placeholder="0"
                value={largoCm}
                onChange={(e) => setLargoCm(e.target.value)}
                className="h-12 rounded-xl border-marble-200 text-center text-sm font-medium focus:border-golden focus:ring-golden"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-marble-400 mb-1 block">Ancho (cm)</label>
              <Input
                type="number"
                placeholder="0"
                value={anchoCm}
                onChange={(e) => setAnchoCm(e.target.value)}
                className="h-12 rounded-xl border-marble-200 text-center text-sm font-medium focus:border-golden focus:ring-golden"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-[10px] font-medium text-marble-400 mb-1 block">Material (opcional)</label>
            <div className="relative">
              <select
                value={tipoMaterial}
                onChange={(e) => setTipoMaterial(e.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-marble-200 bg-marble-50 px-4 pr-10 text-sm text-marble-900 focus:border-golden focus:outline-none focus:ring-1 focus:ring-golden"
              >
                <option value="">Cualquier material</option>
                {TIPOS_MATERIAL.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-400 pointer-events-none" />
            </div>
          </div>

          {largoCm && anchoCm && (
            <p className="mt-2 text-xs text-marble-400 text-right">
              Pieza: {((Number(largoCm) * Number(anchoCm)) / 10000).toFixed(2)} m²
            </p>
          )}

          <Button
            className="mt-4 h-12 w-full rounded-xl bg-golden text-sm font-bold tracking-wide text-marble-950 hover:bg-golden-light active:bg-golden-dark"
            onClick={handleBuscar}
          >
            <Search className="mr-2 h-4 w-4" />
            BUSCAR RETAZOS COMPATIBLES
          </Button>
        </div>

        {/* Results */}
        {busquedaRealizada && resultados !== null && (
          <div className="mt-6">
            <p className="text-xs font-semibold tracking-wider text-marble-500 uppercase mb-3">
              {resultados.length > 0
                ? `${resultados.length} retazo${resultados.length !== 1 ? "s" : ""} compatible${resultados.length !== 1 ? "s" : ""}`
                : "Sin resultados"}
            </p>

            {resultados.length === 0 && (
              <div className="mt-8 text-center">
                <Scissors className="mx-auto h-12 w-12 text-marble-300" />
                <p className="mt-3 text-sm font-medium text-marble-500">
                  No hay retazos compatibles
                </p>
                <p className="mt-1 text-xs text-marble-400">
                  No se encontraron desperdicios con medidas suficientes
                  {tipoMaterial ? ` de ${tipoMaterial}` : ""}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {resultados.map((r) => {
                const colors = getAprovechamientoColor(r.porcentaje_aprovechamiento)
                return (
                  <div
                    key={r.desperdicio.id}
                    className="rounded-2xl border border-marble-200 bg-white p-4 shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-marble-900">
                          {r.desperdicio.tipo_material}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-sm text-marble-600">
                          <Ruler className="h-3.5 w-3.5 text-marble-400" />
                          <span className="font-medium">
                            {r.desperdicio.largo_cm} × {r.desperdicio.ancho_cm} cm
                          </span>
                        </div>
                      </div>
                      <span className={`text-lg font-bold ${colors.text}`}>
                        {r.porcentaje_aprovechamiento}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] font-medium text-marble-400 mb-1">
                        <span>Aprovechamiento</span>
                        <span className={colors.text}>{r.porcentaje_aprovechamiento}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-marble-100">
                        <div
                          className={`h-2 rounded-full transition-all ${colors.bar}`}
                          style={{ width: `${Math.min(r.porcentaje_aprovechamiento, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="flex items-center gap-1 rounded-full bg-marble-100 px-2.5 py-1 text-[10px] font-semibold text-marble-600">
                        {r.orientacion === "rotado" ? (
                          <><RotateCw className="h-3 w-3" /> Rotado 90°</>
                        ) : (
                          <>Normal</>
                        )}
                      </span>
                      <span className="rounded-full bg-marble-100 px-2.5 py-1 text-[10px] font-semibold text-marble-600">
                        +{r.sobrante_largo_cm} cm largo, +{r.sobrante_ancho_cm} cm ancho
                      </span>
                    </div>

                    {/* Location & quality */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-marble-400">
                      {r.desperdicio.ubicacion_planta && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {r.desperdicio.ubicacion_planta}
                        </span>
                      )}
                      <span>Calidad: {r.desperdicio.calidad === "solo_piezas_pequeñas" ? "Solo pzs. pequeñas" : r.desperdicio.calidad}</span>
                    </div>

                    {/* Irregular warning */}
                    {r.desperdicio.es_irregular && (
                      <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        Pieza irregular — verificar medidas reales antes de cortar
                      </div>
                    )}

                    {/* Use button */}
                    <button
                      onClick={() => handleUsar(r)}
                      className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border-2 border-semaforo-verde bg-semaforo-verde/10 text-xs font-bold text-semaforo-verde active:bg-semaforo-verde/20 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      USAR ESTE RETAZO
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
