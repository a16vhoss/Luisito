"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  Image,
  Ruler,
  Hash,
  Clock,
  User,
  Filter,
  Package,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

type InstallStatus = "pendiente" | "en_proceso" | "instalada" | "verificada" | "recibida" | "en_espera"

const statusConfig: Record<string, { label: string; color: string }> = {
  pendiente: { label: "PENDIENTE", color: "bg-marble-200 text-marble-600" },
  en_espera: { label: "EN ESPERA", color: "bg-marble-200 text-marble-600" },
  recibida: { label: "RECIBIDA", color: "bg-blue-400/15 text-blue-400" },
  en_proceso: { label: "EN PROCESO", color: "bg-blue-400/15 text-blue-400" },
  instalada: { label: "INSTALADA", color: "bg-semaforo-amarillo/15 text-semaforo-amarillo" },
  verificada: { label: "VERIFICADA", color: "bg-semaforo-verde/15 text-semaforo-verde" },
}

export default function InstalacionesPage() {
  const { toast } = useToast()
  const [filter, setFilter] = useState<"todas" | string>("todas")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [noObra, setNoObra] = useState(false)
  const [obraName, setObraName] = useState("")
  const [conceptos, setConceptos] = useState<any[]>([])
  const [allPiezas, setAllPiezas] = useState<any[]>([])

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

      const { data: conceptosData } = await supabase
        .from("conceptos_obra")
        .select("*, piezas(*)")
        .eq("obra_id", obra.id)

      setConceptos(conceptosData || [])
      const piezas = (conceptosData || []).flatMap((c: any) =>
        (c.piezas || []).map((p: any) => ({ ...p, concepto_nombre: c.tipo_pieza || c.nombre, zona: c.zona }))
      )
      setAllPiezas(piezas)
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleUpdateStatus = async (piezaId: string, newStatus: "instalada" | "verificada") => {
    const supabase = createClient()
    const { error } = await supabase
      .from("piezas")
      .update({ estatus: newStatus })
      .eq("id", piezaId)

    if (error) {
      toast({
        title: "Error",
        description: `No se pudo actualizar el estatus`,
      })
      return
    }

    setAllPiezas((prev) =>
      prev.map((p) => (p.id === piezaId ? { ...p, estatus: newStatus } : p))
    )

    const pieza = allPiezas.find((p) => p.id === piezaId)
    toast({
      title: newStatus === "instalada" ? "Pieza instalada" : "Instalacion verificada",
      description: `${pieza?.nombre || pieza?.tipo_pieza || "Pieza"} ${newStatus === "instalada" ? "marcada como instalada" : "verificada exitosamente"}`,
    })
  }

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

  const filtered = allPiezas.filter((p) => {
    const matchFilter = filter === "todas" || p.estatus === filter
    const matchSearch = !search || (p.nombre || p.tipo_pieza || "").toLowerCase().includes(search.toLowerCase()) || (p.zona || "").toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const pendientes = allPiezas.filter((p) => p.estatus === "pendiente" || p.estatus === "en_espera").length
  const recibidas = allPiezas.filter((p) => p.estatus === "recibida").length
  const instaladas = allPiezas.filter((p) => p.estatus === "instalada").length
  const verificadas = allPiezas.filter((p) => p.estatus === "verificada").length

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/obra/dashboard" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Instalaciones</h1>
            <p className="text-xs text-marble-400">{obraName}</p>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-500" />
          <Input
            placeholder="Buscar pieza o zona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl border-marble-700 bg-marble-900 pl-9 text-sm text-white placeholder:text-marble-500 focus:border-golden focus:ring-golden"
          />
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 py-4">
          <div className="rounded-xl border border-marble-200 bg-white px-2 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-marble-600">{pendientes}</p>
            <p className="text-[8px] font-medium tracking-wide text-marble-500">PENDIENTE</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white px-2 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-blue-400">{recibidas}</p>
            <p className="text-[8px] font-medium tracking-wide text-marble-500">RECIBIDA</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white px-2 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-semaforo-amarillo">{instaladas}</p>
            <p className="text-[8px] font-medium tracking-wide text-marble-500">INSTALADA</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white px-2 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-semaforo-verde">{verificadas}</p>
            <p className="text-[8px] font-medium tracking-wide text-marble-500">VERIFICADA</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto mb-4 -mx-5 px-5 no-scrollbar">
          {([
            { key: "todas", label: "Todas" },
            { key: "pendiente", label: "Pendientes" },
            { key: "recibida", label: "Recibidas" },
            { key: "instalada", label: "Instaladas" },
            { key: "verificada", label: "Verificadas" },
          ] as { key: string; label: string }[]).map((f) => (
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

        {/* List */}
        {filtered.length === 0 ? (
          <div className="mt-12 text-center">
            <Package className="mx-auto h-10 w-10 text-marble-300" />
            <p className="mt-2 text-sm text-marble-400">No se encontraron piezas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((pieza) => {
              const status = statusConfig[pieza.estatus] || { label: (pieza.estatus || "").toUpperCase(), color: "bg-marble-200 text-marble-600" }
              return (
                <div
                  key={pieza.id}
                  className="overflow-hidden rounded-xl border border-marble-200 bg-white shadow-sm"
                >
                  <div className="flex gap-3 p-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-marble-100">
                      <Image className="h-6 w-6 text-marble-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-marble-900 truncate">{pieza.nombre || pieza.tipo_pieza || pieza.concepto_nombre}</p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-golden">{pieza.material}</p>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-marble-400">
                        {pieza.dimensiones && (
                          <span className="flex items-center gap-0.5">
                            <Ruler className="h-3 w-3" /> {pieza.dimensiones}
                          </span>
                        )}
                        {pieza.zona && (
                          <span>{pieza.zona}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action: mark as instalada */}
                  {(pieza.estatus === "recibida" || pieza.estatus === "en_espera" || pieza.estatus === "pendiente") && (
                    <div className="border-t border-marble-100 px-4 py-2.5">
                      <button
                        onClick={() => handleUpdateStatus(pieza.id, "instalada")}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-golden/10 py-2 text-xs font-semibold text-golden active:bg-golden/20 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Marcar Instalada
                      </button>
                    </div>
                  )}

                  {/* Action: verify */}
                  {pieza.estatus === "instalada" && (
                    <div className="border-t border-marble-100 px-4 py-2.5">
                      <button
                        onClick={() => handleUpdateStatus(pieza.id, "verificada")}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-golden/10 py-2 text-xs font-semibold text-golden active:bg-golden/20 transition-colors"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verificar Instalacion
                      </button>
                    </div>
                  )}

                  {pieza.estatus === "verificada" && (
                    <div className="border-t border-marble-100 px-4 py-2.5">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-semaforo-verde">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verificacion Completa
                      </div>
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
