"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Ruler,
  Layers,
  MapPin,
  Camera,
  FileText,
  Save,
  Star,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { Desperdicio } from "@/types/database.types"

const calidadOptions = [
  { value: "buena", label: "Buena - Puede usarse para piezas medianas/grandes" },
  { value: "regular", label: "Regular - Aceptable para piezas medianas" },
  { value: "solo_piezas_pequeñas", label: "Solo piezas pequeñas" },
]

export default function NuevoSobrantePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")
  const { toast } = useToast()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(!!editId)

  // Form state
  const [tipoMaterial, setTipoMaterial] = useState("")
  const [largoCm, setLargoCm] = useState<number | "">("")
  const [anchoCm, setAnchoCm] = useState<number | "">("")
  const [espesorCm, setEspesorCm] = useState<number | "">("")
  const [esIrregular, setEsIrregular] = useState(false)
  const [calidad, setCalidad] = useState<Desperdicio["calidad"]>("buena")
  const [ubicacionPlanta, setUbicacionPlanta] = useState("")
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [notas, setNotas] = useState("")

  // Load existing sobrante if editing
  const loadSobrante = useCallback(async function loadSobrante(id: string) {
    setLoadingData(true)
    const { data, error } = await supabase
      .from("desperdicios")
      .select("*")
      .eq("id", id)
      .single()

    if (!error && data) {
      const s = data as Desperdicio
      setTipoMaterial(s.tipo_material)
      setLargoCm(s.largo_cm)
      setAnchoCm(s.ancho_cm)
      setEspesorCm(s.espesor_cm)
      setEsIrregular(s.es_irregular)
      setCalidad(s.calidad)
      setUbicacionPlanta(s.ubicacion_planta || "")
      setNotas("")
    }
    setLoadingData(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  useEffect(() => {
    if (editId) {
      loadSobrante(editId)
    }
  }, [editId, loadSobrante])

  async function handleSave() {
    // Validate
    if (!tipoMaterial.trim()) {
      toast({ title: "Error", description: "Indica el tipo de material.", variant: "destructive" })
      return
    }
    if (!largoCm || !anchoCm || !espesorCm) {
      toast({ title: "Error", description: "Completa las dimensiones.", variant: "destructive" })
      return
    }

    setLoading(true)

    const record = {
      tipo_material: tipoMaterial.trim(),
      largo_cm: Number(largoCm),
      ancho_cm: Number(anchoCm),
      espesor_cm: Number(espesorCm),
      es_irregular: esIrregular,
      calidad,
      ubicacion_planta: ubicacionPlanta.trim() || null,
      foto_url: null as string | null,
      disponible: true,
    }

    // Upload photo if selected
    if (fotoFile) {
      const ext = fotoFile.name.split(".").pop()
      const fileName = `sobrantes/${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("fotos")
        .upload(fileName, fotoFile)

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from("fotos").getPublicUrl(fileName)
        record.foto_url = urlData.publicUrl
      }
    }

    let error
    if (editId) {
      const result = await supabase
        .from("desperdicios")
        .update(record)
        .eq("id", editId)
      error = result.error
    } else {
      const result = await supabase
        .from("desperdicios")
        .insert(record)
      error = result.error
    }

    setLoading(false)

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
      return
    }

    toast({
      title: editId ? "Sobrante actualizado" : "Sobrante registrado",
      description: `${tipoMaterial} - ${largoCm}x${anchoCm}x${espesorCm} cm`,
    })
    setTimeout(() => {
      router.push("/taller/sobrantes")
    }, 1000)
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#FAF9F7]">
        <header className="bg-marble-950 px-5 pb-5 pt-4">
          <div className="flex items-center gap-3">
            <Link href="/taller/sobrantes" className="rounded-full p-1.5 active:bg-marble-800">
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

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/taller/sobrantes" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">
              {editId ? "Editar Sobrante" : "Registrar Sobrante"}
            </h1>
            <p className="text-xs text-marble-400">
              {editId ? "Modificar datos del sobrante" : "Nuevo sobrante de material"}
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* Material type */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Tipo de Material
          </Label>
          <Input
            value={tipoMaterial}
            onChange={(e) => setTipoMaterial(e.target.value)}
            placeholder="Ej: Calacatta Gold, Nero Marquina..."
            className="h-12 rounded-xl border-marble-200 bg-white text-sm text-marble-900 focus:border-golden focus:ring-golden"
          />
        </div>

        {/* Dimensions */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5" /> Dimensiones (cm)
          </Label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-medium text-marble-400 mb-1 block">Largo</label>
              <Input
                type="number"
                value={largoCm}
                onChange={(e) => setLargoCm(e.target.value ? Number(e.target.value) : "")}
                placeholder="0"
                min={0}
                className="h-12 rounded-xl border-marble-200 bg-white text-center text-sm font-medium text-marble-900 focus:border-golden focus:ring-golden"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-marble-400 mb-1 block">Ancho</label>
              <Input
                type="number"
                value={anchoCm}
                onChange={(e) => setAnchoCm(e.target.value ? Number(e.target.value) : "")}
                placeholder="0"
                min={0}
                className="h-12 rounded-xl border-marble-200 bg-white text-center text-sm font-medium text-marble-900 focus:border-golden focus:ring-golden"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-marble-400 mb-1 block">Espesor</label>
              <Input
                type="number"
                value={espesorCm}
                onChange={(e) => setEspesorCm(e.target.value ? Number(e.target.value) : "")}
                placeholder="0"
                min={0}
                step={0.1}
                className="h-12 rounded-xl border-marble-200 bg-white text-center text-sm font-medium text-marble-900 focus:border-golden focus:ring-golden"
              />
            </div>
          </div>
        </div>

        {/* Irregular checkbox */}
        <div className="flex items-center gap-3 rounded-xl border border-marble-200 bg-white p-4">
          <input
            type="checkbox"
            id="irregular"
            checked={esIrregular}
            onChange={(e) => setEsIrregular(e.target.checked)}
            className="h-5 w-5 rounded border-marble-300 text-golden focus:ring-golden"
          />
          <label htmlFor="irregular" className="flex-1">
            <p className="text-sm font-medium text-marble-900">Forma irregular</p>
            <p className="text-xs text-marble-400">
              El sobrante no tiene forma rectangular perfecta
            </p>
          </label>
        </div>

        {/* Quality */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" /> Calidad
          </Label>
          <div className="space-y-2">
            {calidadOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCalidad(opt.value as Desperdicio["calidad"])}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  calidad === opt.value
                    ? "border-golden bg-golden/5"
                    : "border-marble-200 bg-white active:bg-marble-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      calidad === opt.value
                        ? "border-golden bg-golden"
                        : "border-marble-300"
                    }`}
                  >
                    {calidad === opt.value && (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-marble-900">{opt.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Ubicación en Planta
          </Label>
          <Input
            value={ubicacionPlanta}
            onChange={(e) => setUbicacionPlanta(e.target.value)}
            placeholder="Ej: Rack A-3, Bodega Norte..."
            className="h-12 rounded-xl border-marble-200 bg-white text-sm text-marble-900 focus:border-golden focus:ring-golden"
          />
        </div>

        {/* Photo */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5" /> Foto (Opcional)
          </Label>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-marble-300 bg-white p-6 transition-colors active:bg-marble-50">
            <Camera className="h-8 w-8 text-marble-400" />
            <p className="text-sm font-medium text-marble-600">
              {fotoFile ? fotoFile.name : "Toca para seleccionar foto"}
            </p>
            <p className="text-xs text-marble-400">JPG, PNG hasta 10 MB</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setFotoFile(file)
              }}
            />
          </label>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider text-marble-500 uppercase flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Notas (Opcional)
          </Label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Observaciones adicionales..."
            rows={3}
            className="w-full rounded-xl border border-marble-200 bg-white px-4 py-3 text-sm text-marble-900 placeholder:text-marble-400 focus:border-golden focus:outline-none focus:ring-1 focus:ring-golden resize-none"
          />
        </div>

        {/* Preview summary */}
        {tipoMaterial && largoCm && anchoCm && (
          <div className="rounded-xl border border-golden/30 bg-golden/5 p-4">
            <p className="text-xs font-semibold tracking-wider text-golden uppercase">
              Resumen
            </p>
            <div className="mt-2 space-y-1 text-sm text-marble-600">
              <p>
                Material: <span className="font-medium text-marble-900">{tipoMaterial}</span>
              </p>
              <p>
                Dimensiones:{" "}
                <span className="font-medium text-marble-900">
                  {largoCm} x {anchoCm} x {espesorCm || "?"} cm
                </span>
                {esIrregular && (
                  <span className="ml-1 text-xs text-marble-400">(irregular)</span>
                )}
              </p>
              <p>
                Area:{" "}
                <span className="font-medium text-marble-900">
                  {((Number(largoCm) * Number(anchoCm)) / 10000).toFixed(2)} m²
                </span>
              </p>
              <p>
                Calidad:{" "}
                <span className="font-medium text-marble-900">
                  {calidadOptions.find((o) => o.value === calidad)?.label.split(" - ")[0]}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-xl border-marble-200 text-sm font-semibold text-marble-600"
            onClick={() => router.push("/taller/sobrantes")}
          >
            Cancelar
          </Button>
          <Button
            className="h-12 flex-1 rounded-xl bg-golden text-sm font-bold tracking-wide text-marble-950 hover:bg-golden-light active:bg-golden-dark"
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Guardando..." : editId ? "ACTUALIZAR" : "GUARDAR"}
          </Button>
        </div>
      </div>
    </div>
  )
}
