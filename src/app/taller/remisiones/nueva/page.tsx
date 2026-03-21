"use client"

import React, { useState, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Obra {
  id: string
  nombre: string
}

interface ConceptoObra {
  id: string
  tipo_pieza: string
  material_tipo: string
  medidas: string
  cantidad_disponible: number
}

interface Chofer {
  id: string
  nombre: string
}

interface LineaRemision {
  conceptoId: string
  cantidad: number
}

export default function NuevaRemisionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [obras, setObras] = useState<Obra[]>([])
  const [conceptos, setConceptos] = useState<ConceptoObra[]>([])
  const [choferes, setChoferes] = useState<Chofer[]>([])
  const [loadingObras, setLoadingObras] = useState(true)
  const [loadingConceptos, setLoadingConceptos] = useState(false)
  const [loadingChoferes, setLoadingChoferes] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [obraId, setObraId] = useState("")
  const [choferId, setChoferId] = useState("")
  const [lineas, setLineas] = useState<LineaRemision[]>([
    { conceptoId: "", cantidad: 1 },
  ])
  const [notas, setNotas] = useState("")

  // Load obras and choferes on mount
  useEffect(() => {
    async function fetchObras() {
      const { data, error } = await supabase
        .from("obras")
        .select("id, nombre")
        .eq("estatus", "activa")
      if (!error && data) {
        setObras(data)
      }
      setLoadingObras(false)
    }

    async function fetchChoferes() {
      const { data, error } = await supabase
        .from("users")
        .select("id, nombre")
        .eq("role", "chofer")
        .eq("activo", true)
      if (!error && data) {
        setChoferes(data)
      }
      setLoadingChoferes(false)
    }

    fetchObras()
    fetchChoferes()
  }, [])

  // Load conceptos when obra changes
  useEffect(() => {
    if (!obraId) {
      setConceptos([])
      return
    }

    async function fetchConceptos() {
      setLoadingConceptos(true)
      const { data, error } = await supabase
        .from("conceptos_obra")
        .select("*")
        .eq("obra_id", obraId)
      if (!error && data) {
        setConceptos(data)
      }
      setLoadingConceptos(false)
    }

    fetchConceptos()
    // Reset lineas when obra changes
    setLineas([{ conceptoId: "", cantidad: 1 }])
  }, [obraId])

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

  const handleSubmit = async () => {
    if (!obraId) {
      toast({ title: "Error", description: "Selecciona una obra destino.", variant: "destructive" })
      return
    }
    const validLineas = lineas.filter((l) => l.conceptoId !== "")
    if (validLineas.length === 0) {
      toast({ title: "Error", description: "Selecciona al menos un concepto.", variant: "destructive" })
      return
    }

    setSubmitting(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({ title: "Error", description: "No se pudo obtener el usuario actual.", variant: "destructive" })
        setSubmitting(false)
        return
      }

      // Insert remision
      const { data: remision, error: remisionError } = await supabase
        .from("remisiones")
        .insert({
          folio: "", // trigger generates it
          obra_id: obraId,
          chofer_id: choferId || null,
          creado_por: user.id,
          estatus: "creada",
          notas: notas || null,
        })
        .select()
        .single()

      if (remisionError || !remision) {
        throw remisionError || new Error("No se pudo crear la remisión")
      }

      // Insert remision items
      const { error: itemsError } = await supabase
        .from("remision_items")
        .insert(
          validLineas.map((item) => ({
            remision_id: remision.id,
            concepto_id: item.conceptoId,
            cantidad: item.cantidad,
          }))
        )

      if (itemsError) {
        throw itemsError
      }

      toast({
        title: "Remisión creada",
        description: `${remision.folio || "Remisión"} generada exitosamente`,
      })

      setTimeout(() => {
        router.push("/taller/remisiones")
      }, 1500)
    } catch (err: any) {
      console.error("Error creating remision:", err)
      toast({
        title: "Error",
        description: err?.message || "No se pudo crear la remisión. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
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
            {loadingObras ? (
              <div className="flex h-12 items-center justify-center rounded-xl border border-marble-200 bg-white">
                <Loader2 className="h-4 w-4 animate-spin text-marble-400" />
              </div>
            ) : (
              <>
                <select
                  value={obraId}
                  onChange={(e) => setObraId(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-marble-200 bg-white px-4 pr-10 text-sm font-medium text-marble-900 focus:border-golden focus:outline-none focus:ring-1 focus:ring-golden"
                >
                  <option value="">Seleccionar obra...</option>
                  {obras.map((obra) => (
                    <option key={obra.id} value={obra.id}>
                      {obra.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-400 pointer-events-none" />
              </>
            )}
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

          {loadingConceptos ? (
            <div className="flex h-20 items-center justify-center rounded-xl border border-marble-200 bg-white">
              <Loader2 className="h-4 w-4 animate-spin text-marble-400" />
              <span className="ml-2 text-sm text-marble-400">Cargando conceptos...</span>
            </div>
          ) : !obraId ? (
            <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-marble-300 bg-marble-50">
              <p className="text-sm text-marble-400">Selecciona una obra para ver conceptos</p>
            </div>
          ) : conceptos.length === 0 ? (
            <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-marble-300 bg-marble-50">
              <p className="text-sm text-marble-400">No hay conceptos para esta obra</p>
            </div>
          ) : (
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
                      {conceptos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.tipo_pieza} - {c.material_tipo} ({c.medidas}){" "}
                          [{c.cantidad_disponible ?? "?"} disp.]
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
          )}
        </div>

        {/* Step: Select Chofer */}
        <div className="mt-6 space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" /> Chofer Asignado
          </Label>
          <div className="relative">
            {loadingChoferes ? (
              <div className="flex h-12 items-center justify-center rounded-xl border border-marble-200 bg-white">
                <Loader2 className="h-4 w-4 animate-spin text-marble-400" />
              </div>
            ) : (
              <>
                <select
                  value={choferId}
                  onChange={(e) => setChoferId(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-marble-200 bg-white px-4 pr-10 text-sm font-medium text-marble-900 focus:border-golden focus:outline-none focus:ring-1 focus:ring-golden"
                >
                  <option value="">Seleccionar chofer...</option>
                  {choferes.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-400 pointer-events-none" />
              </>
            )}
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
            <p>Líneas: <span className="font-medium text-marble-900">{lineas.filter(l => l.conceptoId).length}</span></p>
            <p>
              Piezas totales:{" "}
              <span className="font-medium text-marble-900">
                {lineas.filter(l => l.conceptoId).reduce((sum, l) => sum + l.cantidad, 0)}
              </span>
            </p>
          </div>
        </div>

        {/* Submit */}
        <Button
          className="mt-6 h-12 w-full rounded-xl bg-golden text-sm font-bold tracking-wide text-marble-950 hover:bg-golden-light active:bg-golden-dark"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              CREANDO...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              CREAR REMISIÓN
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
