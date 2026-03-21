"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Bell,
  Search,
  Package,
  CheckCircle2,
  ShieldCheck,
  Image,
  Ruler,
  Hash,
  ChevronRight,
  Loader2,
  Truck,
  Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

type PiezaStatus = "en_espera" | "instalada" | "verificada" | "recibida" | "vendida" | "enviada"

const statusConfig: Record<string, { label: string; color: string; action: string }> = {
  en_espera: { label: "EN ESPERA", color: "bg-semaforo-amarillo/15 text-semaforo-amarillo", action: "Marcar Instalada" },
  recibida: { label: "RECIBIDA", color: "bg-blue-400/15 text-blue-400", action: "Marcar Instalada" },
  vendida: { label: "VENDIDA", color: "bg-marble-200 text-marble-600", action: "" },
  enviada: { label: "ENVIADA", color: "bg-blue-500/15 text-blue-500", action: "" },
  instalada: { label: "INSTALADA", color: "bg-blue-500/15 text-blue-500", action: "Verificar Instalacion" },
  verificada: { label: "VERIFICADA", color: "bg-semaforo-verde/15 text-semaforo-verde", action: "Verificada" },
}

export default function ObraDashboardPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [obra, setObra] = useState<any>(null)
  const [conceptos, setConceptos] = useState<any[]>([])
  const [remisiones, setRemisiones] = useState<any[]>([])
  const [noObra, setNoObra] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        setNoObra(true)
        return
      }

      const { data: obraData } = await supabase
        .from("obras")
        .select("*")
        .eq("residente_id", user.id)
        .eq("estatus", "activa")
        .single()

      if (!obraData) {
        setLoading(false)
        setNoObra(true)
        return
      }

      setObra(obraData)

      const [conceptosRes, remisionesRes] = await Promise.all([
        supabase
          .from("conceptos_obra")
          .select("*, piezas(*)")
          .eq("obra_id", obraData.id),
        supabase
          .from("remisiones")
          .select("*, chofer:users!chofer_id(nombre)")
          .eq("obra_id", obraData.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ])

      setConceptos(conceptosRes.data || [])
      setRemisiones(remisionesRes.data || [])
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

  // Compute stats from conceptos with piezas
  const allPiezas = conceptos.flatMap((c: any) => c.piezas || [])
  const vendidas = allPiezas.filter((p: any) => ["vendida", "enviada", "recibida", "instalada", "verificada"].includes(p.estatus)).length
  const enviadas = allPiezas.filter((p: any) => ["enviada", "recibida", "instalada", "verificada"].includes(p.estatus)).length
  const instaladas = allPiezas.filter((p: any) => ["instalada", "verificada"].includes(p.estatus)).length
  const verificadas = allPiezas.filter((p: any) => p.estatus === "verificada").length

  const stats = [
    { label: "VENDIDAS", value: vendidas, color: "text-marble-900" },
    { label: "ENVIADAS", value: enviadas, color: "text-blue-500" },
    { label: "INSTALADAS", value: instaladas, color: "text-golden" },
    { label: "VERIFICADAS", value: verificadas, color: "text-semaforo-verde" },
  ]

  const filtered = allPiezas.filter((p: any) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      (p.nombre || "").toLowerCase().includes(s) ||
      (p.material || "").toLowerCase().includes(s) ||
      (p.sku || "").toLowerCase().includes(s)
    )
  })

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-6 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-marble-900">
              <span className="text-xs font-bold text-golden">MC</span>
            </div>
            <span className="text-sm font-bold tracking-widest text-marble-200">
              MARMOL CALIBE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-2 text-marble-400 active:bg-marble-800">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-semaforo-rojo" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-golden text-xs font-bold text-marble-950">
              MR
            </div>
          </div>
        </div>
        <div className="mt-4">
          <h1 className="text-xl font-bold text-white">Residente de Obra</h1>
          <p className="mt-0.5 text-xs tracking-wide text-marble-400">
            {obra?.nombre || "Obra"} {obra?.cliente ? `- ${obra.cliente}` : ""}
          </p>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Stats */}
        <div className="-mt-4 grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border-2 border-golden/20 bg-white p-3 text-center shadow-sm"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] font-semibold tracking-wider text-marble-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mt-5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-400" />
          <Input
            placeholder="Buscar pieza..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-xl border-marble-200 bg-white pl-9 text-sm text-marble-900 placeholder:text-marble-400 focus:border-golden focus:ring-golden shadow-sm"
          />
        </div>

        {/* Recent Remisiones */}
        {remisiones.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-xs font-semibold tracking-widest text-marble-500 uppercase">
              Remisiones Recientes
            </h2>
            <div className="space-y-2">
              {remisiones.map((rem: any) => (
                <div
                  key={rem.id}
                  className="flex items-center gap-3 rounded-xl border border-marble-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-marble-100">
                    <Truck className="h-4 w-4 text-marble-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-marble-900 truncate">
                      REM #{rem.folio || rem.id.slice(0, 6)}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-marble-400">
                      <span>{rem.chofer?.nombre || "Sin chofer"}</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(rem.created_at).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    rem.estatus === "entregada"
                      ? "bg-semaforo-verde/15 text-semaforo-verde"
                      : rem.estatus === "en_transito"
                      ? "bg-semaforo-amarillo/15 text-semaforo-amarillo"
                      : "bg-marble-200 text-marble-600"
                  }`}>
                    {(rem.estatus || "").toUpperCase().replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Section */}
        <div className="mt-6">
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-marble-500 uppercase">
            Control de Inventario
          </h2>

          <div className="space-y-3">
            {filtered.map((pieza: any) => {
              const status = statusConfig[pieza.estatus] || { label: pieza.estatus?.toUpperCase() || "—", color: "bg-marble-200 text-marble-600", action: "" }
              return (
                <div
                  key={pieza.id}
                  className="overflow-hidden rounded-xl border border-marble-200 bg-white shadow-sm"
                >
                  <div className="flex gap-3 p-4">
                    {/* Photo thumbnail */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-marble-100">
                      <Image className="h-8 w-8 text-marble-300" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-marble-900">{pieza.nombre || pieza.tipo_pieza}</p>
                          <p className="text-xs font-medium text-golden">{pieza.material}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-marble-500">
                        {pieza.dimensiones && (
                          <span className="flex items-center gap-0.5">
                            <Ruler className="h-3 w-3" /> {pieza.dimensiones}
                          </span>
                        )}
                        {pieza.sku && (
                          <span className="flex items-center gap-0.5">
                            <Hash className="h-3 w-3" /> {pieza.sku}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {pieza.estatus === "verificada" && (
                    <div className="border-t border-marble-100 px-4 py-2.5">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-semaforo-verde">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verificacion Completa
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="mt-12 text-center">
              <Package className="mx-auto h-10 w-10 text-marble-300" />
              <p className="mt-2 text-sm text-marble-400">No se encontraron piezas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
