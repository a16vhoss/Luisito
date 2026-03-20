"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Ruler,
  Camera,
  MapPin,
  FileText,
  Save,
  ChevronDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TIPOS_MATERIAL } from "@/lib/desperdicios-mock"

type Calidad = "buena" | "regular" | "solo_piezas_pequeñas"

export default function NuevoDesperdicioPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [tipoMaterial, setTipoMaterial] = useState("")
  const [largoCm, setLargoCm] = useState("")
  const [anchoCm, setAnchoCm] = useState("")
  const [espesorCm, setEspesorCm] = useState("2")
  const [esIrregular, setEsIrregular] = useState(false)
  const [calidad, setCalidad] = useState<Calidad>("buena")
  const [ubicacionPlanta, setUbicacionPlanta] = useState("")
  const [notas, setNotas] = useState("")

  const handleSubmit = () => {
    if (!tipoMaterial) {
      toast({ title: "Error", description: "Selecciona el tipo de material.", variant: "destructive" })
      return
    }
    if (!largoCm || !anchoCm) {
      toast({ title: "Error", description: "Ingresa las medidas del retazo.", variant: "destructive" })
      return
    }
    if (Number(largoCm) <= 0 || Number(anchoCm) <= 0) {
      toast({ title: "Error", description: "Las medidas deben ser mayores a 0.", variant: "destructive" })
      return
    }

    const area = (Number(largoCm) * Number(anchoCm)) / 10000
    toast({
      title: "Desperdicio registrado",
      description: `${tipoMaterial} — ${largoCm} × ${anchoCm} cm (${area.toFixed(2)} m²)`,
    })
    setTimeout(() => {
      router.push("/taller/desperdicios")
    }, 1500)
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
            <h1 className="text-lg font-bold text-white">Registrar Retazo</h1>
            <p className="text-xs text-marble-400">Nuevo desperdicio al inventario</p>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* Material */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5" /> Tipo de Material
          </Label>
          <div className="relative">
            <select
              value={tipoMaterial}
              onChange={(e) => setTipoMaterial(e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-marble-200 bg-white px-4 pr-10 text-sm font-medium text-marble-900 focus:border-golden focus:outline-none focus:ring-1 focus:ring-golden"
            >
              <option value="">Seleccionar material...</option>
              {TIPOS_MATERIAL.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-400 pointer-events-none" />
          </div>
        </div>

        {/* Dimensiones */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5" /> Dimensiones (cm)
          </Label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-medium text-marble-400 mb-1 block">Largo</label>
              <Input
                type="number"
                placeholder="0"
                value={largoCm}
                onChange={(e) => setLargoCm(e.target.value)}
                className="h-12 rounded-xl border-marble-200 text-center text-sm font-medium focus:border-golden focus:ring-golden"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-marble-400 mb-1 block">Ancho</label>
              <Input
                type="number"
                placeholder="0"
                value={anchoCm}
                onChange={(e) => setAnchoCm(e.target.value)}
                className="h-12 rounded-xl border-marble-200 text-center text-sm font-medium focus:border-golden focus:ring-golden"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-marble-400 mb-1 block">Espesor</label>
              <Input
                type="number"
                placeholder="2"
                value={espesorCm}
                onChange={(e) => setEspesorCm(e.target.value)}
                className="h-12 rounded-xl border-marble-200 text-center text-sm font-medium focus:border-golden focus:ring-golden"
              />
            </div>
          </div>
          {largoCm && anchoCm && (
            <p className="text-xs text-marble-400 text-right">
              Área: {((Number(largoCm) * Number(anchoCm)) / 10000).toFixed(2)} m²
            </p>
          )}
        </div>

        {/* Irregular */}
        <div className="flex items-center justify-between rounded-xl border border-marble-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-marble-900">Pieza irregular</p>
            <p className="text-xs text-marble-400">Bordes no rectangulares</p>
          </div>
          <button
            onClick={() => setEsIrregular(!esIrregular)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              esIrregular ? "bg-golden" : "bg-marble-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                esIrregular ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Calidad */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase">
            Calidad
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { key: "buena", label: "Buena", color: "border-semaforo-verde bg-semaforo-verde/10 text-semaforo-verde" },
              { key: "regular", label: "Regular", color: "border-semaforo-amarillo bg-semaforo-amarillo/10 text-semaforo-amarillo" },
              { key: "solo_piezas_pequeñas", label: "Solo peq.", color: "border-semaforo-rojo bg-semaforo-rojo/10 text-semaforo-rojo" },
            ] as { key: Calidad; label: string; color: string }[]).map((q) => (
              <button
                key={q.key}
                onClick={() => setCalidad(q.key)}
                className={`rounded-xl border-2 px-3 py-3 text-xs font-semibold transition-colors ${
                  calidad === q.key
                    ? q.color
                    : "border-marble-200 bg-white text-marble-500"
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ubicación */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Ubicación en Planta
          </Label>
          <Input
            placeholder="Ej: Lote 1 - Rack A"
            value={ubicacionPlanta}
            onChange={(e) => setUbicacionPlanta(e.target.value)}
            className="h-12 rounded-xl border-marble-200 text-sm focus:border-golden focus:ring-golden"
          />
        </div>

        {/* Foto */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5" /> Foto (Opcional)
          </Label>
          <button className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed border-marble-300 bg-marble-50 active:bg-marble-100 transition-colors">
            <div className="text-center">
              <Camera className="mx-auto h-8 w-8 text-marble-400" />
              <p className="mt-1 text-xs font-medium text-marble-400">Tomar foto del retazo</p>
            </div>
          </button>
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Notas (Opcional)
          </Label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Observaciones sobre el retazo..."
            rows={3}
            className="w-full rounded-xl border border-marble-200 bg-white px-4 py-3 text-sm text-marble-900 placeholder:text-marble-400 focus:border-golden focus:outline-none focus:ring-1 focus:ring-golden resize-none"
          />
        </div>

        {/* Summary */}
        {tipoMaterial && largoCm && anchoCm && (
          <div className="rounded-xl border border-golden/30 bg-golden/5 p-4">
            <p className="text-xs font-semibold tracking-wider text-golden uppercase">Resumen</p>
            <div className="mt-2 space-y-1 text-sm text-marble-600">
              <p>Material: <span className="font-medium text-marble-900">{tipoMaterial}</span></p>
              <p>Medidas: <span className="font-medium text-marble-900">{largoCm} × {anchoCm} × {espesorCm} cm</span></p>
              <p>Área: <span className="font-medium text-marble-900">{((Number(largoCm) * Number(anchoCm)) / 10000).toFixed(2)} m²</span></p>
              <p>Calidad: <span className="font-medium text-marble-900">{calidad === "solo_piezas_pequeñas" ? "Solo piezas pequeñas" : calidad.charAt(0).toUpperCase() + calidad.slice(1)}</span></p>
              {esIrregular && <p className="text-amber-600 font-medium">Pieza irregular</p>}
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          className="h-12 w-full rounded-xl bg-golden text-sm font-bold tracking-wide text-marble-950 hover:bg-golden-light active:bg-golden-dark"
          onClick={handleSubmit}
        >
          <Save className="mr-2 h-4 w-4" />
          REGISTRAR DESPERDICIO
        </Button>
      </div>
    </div>
  )
}
