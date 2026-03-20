"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  Package,
  Truck,
  HardHat,
  FileText,
  Send,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const mockObras = [
  { id: "1", nombre: "Torre Lujo - Etapa 4", cliente: "Grupo Inmobiliario del Caribe" },
  { id: "2", nombre: "Residencial Playa", cliente: "Desarrollos Costa Maya" },
  { id: "3", nombre: "Hotel Grand Paradise", cliente: "Cadena Hotelera Internacional" },
]

const mockConceptos = [
  { id: "c1", tipo: "Cubierta Cocina", material: "Calacatta Gold", medidas: "240 x 60 cm", disponible: 8 },
  { id: "c2", tipo: "Piso Vestíbulo", material: "Nero Marquina", medidas: "60 x 60 cm", disponible: 45 },
  { id: "c3", tipo: "Encimera Baño", material: "Calacatta Gold", medidas: "120 x 55 cm", disponible: 12 },
  { id: "c4", tipo: "Muro Decorativo", material: "Blanco Carrara", medidas: "240 x 120 cm", disponible: 6 },
]

const mockChoferes = [
  { id: "ch1", nombre: "Rodrigo García", unidad: "KENWORTH T680 [M-452]" },
  { id: "ch2", nombre: "Miguel Torres", unidad: "INTERNATIONAL LT [M-318]" },
  { id: "ch3", nombre: "Carlos Mendoza", unidad: "FREIGHTLINER [M-205]" },
]

interface LineaRemision {
  conceptoId: string
  cantidad: number
}

export default function NuevaRemisionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [obraId, setObraId] = useState("")
  const [choferId, setChoferId] = useState("")
  const [lineas, setLineas] = useState<LineaRemision[]>([
    { conceptoId: "", cantidad: 1 },
  ])
  const [notas, setNotas] = useState("")

  const addLinea = () => {
    setLineas([...lineas, { conceptoId: "", cantidad: 1 }])
  }

  const removeLinea = (index: number) => {
    setLineas(lineas.filter((_, i) => i !== index))
  }

  const updateLinea = (index: number, field: keyof LineaRemision, value: string | number) => {
    const updated = [...lineas]
    updated[index] = { ...updated[index], [field]: value }
    setLineas(updated)
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/taller/remisiones" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Nueva Remisión</h1>
            <p className="text-xs text-marble-400">Despacho de material</p>
          </div>
        </div>
      </header>

      <div className="px-5 py-6">
        {/* Step: Select Obra */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <HardHat className="h-3.5 w-3.5" /> Obra Destino
          </Label>
          <div className="relative">
            <select
              value={obraId}
              onChange={(e) => setObraId(e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-marble-200 bg-white px-4 pr-10 text-sm font-medium text-marble-900 focus:border-golden focus:outline-none focus:ring-1 focus:ring-golden"
            >
              <option value="">Seleccionar obra...</option>
              {mockObras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nombre} - {obra.cliente}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-400 pointer-events-none" />
          </div>
        </div>

        {/* Step: Conceptos / Items */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" /> Conceptos
            </Label>
            <button
              onClick={addLinea}
              className="flex items-center gap-1 text-xs font-semibold text-golden active:text-golden-dark"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar
            </button>
          </div>

          <div className="space-y-2">
            {lineas.map((linea, index) => (
              <div
                key={index}
                className="rounded-xl border border-marble-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-semibold tracking-wider text-marble-400">
                    LÍNEA {index + 1}
                  </span>
                  {lineas.length > 1 && (
                    <button
                      onClick={() => removeLinea(index)}
                      className="text-marble-400 active:text-semaforo-rojo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={linea.conceptoId}
                    onChange={(e) => updateLinea(index, "conceptoId", e.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-marble-200 bg-marble-50 px-3 pr-8 text-sm text-marble-900 focus:border-golden focus:outline-none"
                  >
                    <option value="">Seleccionar pieza...</option>
                    {mockConceptos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.tipo} - {c.material} ({c.medidas}) [{c.disponible} disp.]
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-marble-400 pointer-events-none" />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-marble-500">Cantidad:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateLinea(index, "cantidad", Math.max(1, linea.cantidad - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-marble-200 active:bg-marble-100"
                    >
                      <Minus className="h-3 w-3 text-marble-600" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-marble-900">
                      {linea.cantidad}
                    </span>
                    <button
                      onClick={() => updateLinea(index, "cantidad", linea.cantidad + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-marble-200 active:bg-marble-100"
                    >
                      <Plus className="h-3 w-3 text-marble-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step: Select Chofer */}
        <div className="mt-6 space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" /> Chofer Asignado
          </Label>
          <div className="relative">
            <select
              value={choferId}
              onChange={(e) => setChoferId(e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-marble-200 bg-white px-4 pr-10 text-sm font-medium text-marble-900 focus:border-golden focus:outline-none focus:ring-1 focus:ring-golden"
            >
              <option value="">Seleccionar chofer...</option>
              {mockChoferes.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.nombre} - {ch.unidad}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-400 pointer-events-none" />
          </div>
        </div>

        {/* Notas */}
        <div className="mt-6 space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Notas (Opcional)
          </Label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Instrucciones especiales, observaciones..."
            rows={3}
            className="w-full rounded-xl border border-marble-200 bg-white px-4 py-3 text-sm text-marble-900 placeholder:text-marble-400 focus:border-golden focus:outline-none focus:ring-1 focus:ring-golden resize-none"
          />
        </div>

        {/* Summary */}
        <div className="mt-6 rounded-xl border border-golden/30 bg-golden/5 p-4">
          <p className="text-xs font-semibold tracking-wider text-golden uppercase">
            Resumen
          </p>
          <div className="mt-2 space-y-1 text-sm text-marble-600">
            <p>Líneas: <span className="font-medium text-marble-900">{lineas.length}</span></p>
            <p>
              Piezas totales:{" "}
              <span className="font-medium text-marble-900">
                {lineas.reduce((sum, l) => sum + l.cantidad, 0)}
              </span>
            </p>
          </div>
        </div>

        {/* Submit */}
        <Button
          className="mt-6 h-12 w-full rounded-xl bg-golden text-sm font-bold tracking-wide text-marble-950 hover:bg-golden-light active:bg-golden-dark"
          onClick={() => {
            if (!obraId) {
              toast({ title: "Error", description: "Selecciona una obra destino.", variant: "destructive" })
              return
            }
            const hasConcepto = lineas.some((l) => l.conceptoId !== "")
            if (!hasConcepto) {
              toast({ title: "Error", description: "Selecciona al menos un concepto.", variant: "destructive" })
              return
            }
            toast({ title: "Remisión creada", description: "REM #29444 generada exitosamente" })
            setTimeout(() => {
              router.push("/taller/remisiones")
            }, 1500)
          }}
        >
          <Send className="mr-2 h-4 w-4" />
          CREAR REMISIÓN
        </Button>
      </div>
    </div>
  )
}
