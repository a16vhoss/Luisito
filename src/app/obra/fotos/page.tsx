"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Camera,
  Image,
  Upload,
  Filter,
  Clock,
  User,
  Eye,
  Trash2,
  Package,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type FotoCategory = "todas" | "carga" | "entrega" | "instalacion" | "verificacion"

const categoryConfig: Record<string, { label: string; color: string }> = {
  carga: { label: "CARGA", color: "bg-blue-400/15 text-blue-400" },
  entrega: { label: "ENTREGA", color: "bg-golden/15 text-golden" },
  recepcion: { label: "RECEPCION", color: "bg-blue-400/15 text-blue-400" },
  instalacion: { label: "INSTALACION", color: "bg-golden/15 text-golden" },
  verificacion: { label: "VERIFICACION", color: "bg-semaforo-verde/15 text-semaforo-verde" },
  dano: { label: "DANO", color: "bg-semaforo-rojo/15 text-semaforo-rojo" },
}

export default function FotosObraPage() {
  const [filter, setFilter] = useState<FotoCategory>("todas")
  const [loading, setLoading] = useState(true)
  const [noObra, setNoObra] = useState(false)
  const [obraName, setObraName] = useState("")
  const [fotos, setFotos] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        setNoObra(true)
        return
      }

      const { data: obra } = await supabase
        .from("obras")
        .select("*")
        .eq("residente_id", user.id)
        .eq("estatus", "activa")
        .single()

      if (!obra) {
        setLoading(false)
        setNoObra(true)
        return
      }

      setObraName(obra.nombre || "Obra")

      const { data: fotosData } = await supabase
        .from("fotos")
        .select("*")
        .eq("obra_id", obra.id)
        .order("created_at", { ascending: false })

      setFotos(fotosData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-golden" />
      </div>
    )
  }

  if (noObra) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex flex-col items-center justify-center px-5">
        <Package className="h-12 w-12 text-marble-300" />
        <p className="mt-3 text-sm font-medium text-marble-500">No tiene obra asignada</p>
        <p className="mt-1 text-xs text-marble-400">Contacte al administrador para que le asigne una obra.</p>
      </div>
    )
  }

  // Group photos by tipo
  const grouped = fotos.reduce((acc: Record<string, any[]>, foto: any) => {
    const tipo = foto.tipo || "otros"
    if (!acc[tipo]) acc[tipo] = []
    acc[tipo].push(foto)
    return acc
  }, {})

  const filteredFotos = filter === "todas" ? fotos : fotos.filter((f) => f.tipo === filter)

  // Group filtered photos by tipo for display
  const filteredGrouped = filteredFotos.reduce((acc: Record<string, any[]>, foto: any) => {
    const tipo = foto.tipo || "otros"
    if (!acc[tipo]) acc[tipo] = []
    acc[tipo].push(foto)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/obra/dashboard" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Evidencia Fotografica</h1>
            <p className="text-xs text-marble-400">{obraName}</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-golden active:bg-golden-dark">
            <Camera className="h-5 w-5 text-marble-950" />
          </button>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Stats bar */}
        <div className="flex items-center justify-between py-4">
          <p className="text-sm font-medium text-marble-700">
            <span className="font-bold text-marble-900">{fotos.length}</span> fotos totales
          </p>
          <p className="text-xs text-marble-400">{Object.keys(grouped).length} categorias</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto mb-4 -mx-5 px-5 no-scrollbar">
          {([
            { key: "todas", label: "Todas" },
            { key: "carga", label: "Carga" },
            { key: "entrega", label: "Entrega" },
            { key: "instalacion", label: "Instalacion" },
            { key: "verificacion", label: "Verificacion" },
          ] as { key: FotoCategory; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.key
                  ? "bg-marble-950 text-white"
                  : "bg-marble-200 text-marble-600 active:bg-marble-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Upload area */}
        <button className="mb-4 flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-marble-300 bg-marble-100/50 p-4 active:bg-marble-100 transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-golden/10">
            <Upload className="h-5 w-5 text-golden" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-marble-700">Subir Fotos</p>
            <p className="text-xs text-marble-400">Tomar o seleccionar desde galeria</p>
          </div>
        </button>

        {/* Photo Groups */}
        {filteredFotos.length === 0 ? (
          <div className="mt-12 text-center">
            <Image className="mx-auto h-10 w-10 text-marble-300" />
            <p className="mt-2 text-sm text-marble-400">No hay fotos registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(filteredGrouped).map(([tipo, fotosGrupo]) => {
              const cat = categoryConfig[tipo] || { label: tipo.toUpperCase(), color: "bg-marble-200 text-marble-600" }
              return (
                <div key={tipo}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.color}`}>
                      {cat.label}
                    </span>
                    <span className="text-xs text-marble-400">{(fotosGrupo as any[]).length} fotos</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {(fotosGrupo as any[]).map((foto: any) => (
                      <div
                        key={foto.id}
                        className="relative aspect-square overflow-hidden rounded-lg bg-marble-100"
                      >
                        {foto.url ? (
                          <img
                            src={foto.url}
                            alt={foto.descripcion || "Foto"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Image className="h-6 w-6 text-marble-300" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {(fotosGrupo as any[]).length > 0 && (fotosGrupo as any[])[0].created_at && (
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-marble-400">
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" /> {new Date((fotosGrupo as any[])[(fotosGrupo as any[]).length - 1].created_at).toLocaleDateString("es-MX")} - {new Date((fotosGrupo as any[])[0].created_at).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
