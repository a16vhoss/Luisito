"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Package,
  Clock,
  Truck,
  MapPin,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

const estatusConfig = {
  creada: { label: "CREADA", color: "bg-marble-200 text-marble-600" },
  en_transito: { label: "EN TRÁNSITO", color: "bg-semaforo-amarillo/15 text-semaforo-amarillo" },
  entregada: { label: "ENTREGADA", color: "bg-semaforo-verde/15 text-semaforo-verde" },
}

type FilterType = "todas" | "creada" | "en_transito" | "entregada"

interface RemisionRow {
  id: string
  folio: string
  estatus: "creada" | "en_transito" | "entregada"
  notas: string | null
  created_at: string
  obra: { nombre: string } | null
  chofer: { nombre: string } | null
  items: { cantidad: number }[]
}

export default function RemisionesPage() {
  const [filter, setFilter] = useState<FilterType>("todas")
  const [search, setSearch] = useState("")
  const [remisiones, setRemisiones] = useState<RemisionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRemisiones() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("remisiones")
        .select("*, obra:obras(nombre), chofer:users!chofer_id(nombre), items:remision_items(cantidad)")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setRemisiones(data as RemisionRow[])
      }
      setLoading(false)
    }

    fetchRemisiones()
  }, [])

  const filtered = remisiones.filter((r) => {
    if (filter !== "todas" && r.estatus !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      const matchesFolio = r.folio?.toLowerCase().includes(q)
      const matchesObra = r.obra?.nombre?.toLowerCase().includes(q)
      if (!matchesFolio && !matchesObra) return false
    }
    return true
  })

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/taller/dashboard" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Remisiones</h1>
            <p className="text-xs text-marble-400">
              {loading ? "Cargando..." : `${remisiones.length} registros`}
            </p>
          </div>
          <Link
            href="/taller/remisiones/nueva"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-golden active:bg-golden-dark"
          >
            <Plus className="h-5 w-5 text-marble-950" />
          </Link>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-500" />
          <Input
            placeholder="Buscar por folio u obra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl border-marble-700 bg-marble-900 pl-9 text-sm text-white placeholder:text-marble-500 focus:border-golden focus:ring-golden"
          />
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto py-4 -mx-5 px-5 no-scrollbar">
          {([
            { key: "todas", label: "Todas" },
            { key: "creada", label: "Creadas" },
            { key: "en_transito", label: "En Tránsito" },
            { key: "entregada", label: "Entregadas" },
          ] as { key: FilterType; label: string }[]).map((f) => (
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

        {/* Loading */}
        {loading ? (
          <div className="mt-12 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-marble-400" />
            <p className="mt-3 text-sm text-marble-400">Cargando remisiones...</p>
          </div>
        ) : (
          <>
            {/* List */}
            <div className="space-y-2">
              {filtered.map((rem) => {
                const status = estatusConfig[rem.estatus] ?? estatusConfig.creada
                const totalPiezas = rem.items?.reduce((sum, i) => sum + i.cantidad, 0) ?? 0
                return (
                  <div
                    key={rem.id}
                    className="rounded-xl border border-marble-200 bg-white p-4 shadow-sm active:bg-marble-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-marble-900">{rem.folio || "Sin folio"}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-marble-700">
                          {rem.obra?.nombre ?? "Sin obra"}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-marble-300 mt-0.5 shrink-0" />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-marble-100 pt-2 text-[11px] text-marble-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {rem.obra?.nombre ?? "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" /> {totalPiezas} pzas
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" /> {rem.chofer?.nombre ?? "Sin asignar"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDate(rem.created_at)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div className="mt-12 text-center">
                <Package className="mx-auto h-10 w-10 text-marble-300" />
                <p className="mt-2 text-sm text-marble-400">No se encontraron remisiones</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
