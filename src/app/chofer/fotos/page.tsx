"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Camera,
  Image,
  Upload,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type FotoTipo = "carga" | "entrega" | "daño"

const fotoTipos: { value: FotoTipo; label: string; desc: string }[] = [
  { value: "carga", label: "Carga", desc: "Material cargado en la unidad" },
  { value: "entrega", label: "Entrega", desc: "Evidencia de entrega en obra" },
  { value: "daño", label: "Daño", desc: "Reportar daño en material" },
]

const tipoColors: Record<string, string> = {
  carga: "bg-blue-500/15 text-blue-400",
  entrega: "bg-semaforo-verde/15 text-semaforo-verde",
  daño: "bg-semaforo-rojo/15 text-semaforo-rojo",
}

export default function FotosPage() {
  const [loading, setLoading] = useState(true)
  const [selectedTipo, setSelectedTipo] = useState<FotoTipo>("entrega")
  const [fotos, setFotos] = useState<string[]>([])
  const [fotosRecientes, setFotosRecientes] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const userId = user.id

      const { data: fotosData } = await supabase
        .from("fotos")
        .select("*, obra:obras(nombre)")
        .eq("subido_por", userId)
        .order("created_at", { ascending: false })

      setFotosRecientes(fotosData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const addFoto = () => {
    setFotos([...fotos, `foto_${fotos.length + 1}`])
  }

  const removeFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-marble-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-golden" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-marble-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-marble-950/95 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link href="/chofer/cargas" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Evidencia Fotográfica</h1>
            <p className="text-xs text-marble-500">Mis fotos subidas</p>
          </div>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Tipo Selector */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold tracking-widest text-marble-500 uppercase">
            Tipo de Evidencia
          </p>
          <div className="flex gap-2">
            {fotoTipos.map((tipo) => (
              <button
                key={tipo.value}
                onClick={() => setSelectedTipo(tipo.value)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-center transition-all ${
                  selectedTipo === tipo.value
                    ? "border-golden bg-golden/10 text-golden"
                    : "border-marble-700 bg-marble-900 text-marble-400 active:bg-marble-800"
                }`}
              >
                <p className="text-xs font-semibold">{tipo.label}</p>
                <p className="mt-0.5 text-[10px] text-marble-500">{tipo.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Camera / Upload Area */}
        <div className="mb-5">
          <button
            onClick={addFoto}
            className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-marble-700 bg-marble-900/50 py-10 active:bg-marble-800 transition-colors"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-golden/10 ring-2 ring-golden/30">
              <Camera className="h-8 w-8 text-golden" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Tomar Foto</p>
              <p className="mt-0.5 text-xs text-marble-500">
                Toca para abrir la cámara o subir desde galería
              </p>
            </div>
          </button>
        </div>

        {/* Preview grid */}
        {fotos.length > 0 && (
          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold tracking-widest text-marble-500 uppercase">
              Fotos Capturadas ({fotos.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {fotos.map((foto, index) => (
                <div
                  key={index}
                  className="group relative aspect-square rounded-xl bg-marble-800 flex items-center justify-center border border-marble-700"
                >
                  <Image className="h-6 w-6 text-marble-600" />
                  <button
                    onClick={() => removeFoto(index)}
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-semaforo-rojo text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 rounded bg-marble-900/80 px-1.5 py-0.5 text-[9px] font-medium text-marble-300">
                    #{index + 1}
                  </span>
                </div>
              ))}
              <button
                onClick={addFoto}
                className="aspect-square rounded-xl border-2 border-dashed border-marble-700 flex items-center justify-center active:bg-marble-800"
              >
                <Camera className="h-5 w-5 text-marble-600" />
              </button>
            </div>

            {/* Submit Button */}
            <Button
              className="mt-4 h-12 w-full rounded-xl bg-golden text-sm font-bold tracking-wide text-marble-950 hover:bg-golden-light active:bg-golden-dark"
            >
              <Upload className="mr-2 h-4 w-4" />
              SUBIR {fotos.length} FOTO{fotos.length !== 1 ? "S" : ""}
            </Button>
          </div>
        )}

        {/* Recent Photos */}
        <div className="mt-6">
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-marble-500 uppercase">
            Fotos Recientes
          </h2>
          {fotosRecientes.length === 0 ? (
            <div className="rounded-xl border border-marble-800 bg-marble-900 p-8 text-center">
              <Image className="mx-auto h-8 w-8 text-marble-700" />
              <p className="mt-3 text-sm font-medium text-marble-400">Sin fotos</p>
              <p className="mt-1 text-xs text-marble-600">Aún no has subido evidencia fotográfica</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fotosRecientes.map((item) => {
                const tipoKey = item.tipo || "carga"
                const colorClass = tipoColors[tipoKey] || tipoColors.carga
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-marble-800 bg-marble-900 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-marble-800">
                        <Image className="h-5 w-5 text-marble-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">
                            {item.obra?.nombre || "Sin obra"}
                          </p>
                          {item.tipo && (
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${colorClass}`}>
                              {String(item.tipo).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-marble-500 flex items-center gap-2">
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {new Date(item.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                          {item.obra?.nombre && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" /> {item.obra.nombre}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
