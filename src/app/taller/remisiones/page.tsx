"use client"

import React, { useState } from "react"
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
} from "lucide-react"
import { Input } from "@/components/ui/input"

const mockRemisiones = [
  {
    id: "1",
    folio: "REM #29441",
    obra: "Torre Lujo - Etapa 4",
    material: "Calacatta Gold",
    lote: "LOT-2024-089",
    piezas: 12,
    m2: 34.5,
    estatus: "en_transito" as const,
    fecha: "19 Mar 2026",
    chofer: "Rodrigo García",
  },
  {
    id: "2",
    folio: "REM #29440",
    obra: "Torre Lujo - Etapa 4",
    material: "Nero Marquina",
    lote: "LOT-2024-088",
    piezas: 8,
    m2: 22.1,
    estatus: "entregada" as const,
    fecha: "19 Mar 2026",
    chofer: "Rodrigo García",
  },
  {
    id: "3",
    folio: "REM #29439",
    obra: "Residencial Playa",
    material: "Blanco Carrara",
    lote: "LOT-2024-087",
    piezas: 15,
    m2: 41.8,
    estatus: "creada" as const,
    fecha: "18 Mar 2026",
    chofer: "Sin asignar",
  },
  {
    id: "4",
    folio: "REM #29438",
    obra: "Hotel Grand Paradise",
    material: "Emperador Dark",
    lote: "LOT-2024-086",
    piezas: 6,
    m2: 18.2,
    estatus: "entregada" as const,
    fecha: "18 Mar 2026",
    chofer: "Miguel Torres",
  },
  {
    id: "5",
    folio: "REM #29437",
    obra: "Residencial Playa",
    material: "Travertino Navona",
    lote: "LOT-2024-085",
    piezas: 20,
    m2: 58.0,
    estatus: "entregada" as const,
    fecha: "17 Mar 2026",
    chofer: "Rodrigo García",
  },
]

const estatusConfig = {
  creada: { label: "CREADA", color: "bg-marble-200 text-marble-600" },
  en_transito: { label: "EN TRÁNSITO", color: "bg-semaforo-amarillo/15 text-semaforo-amarillo" },
  entregada: { label: "ENTREGADA", color: "bg-semaforo-verde/15 text-semaforo-verde" },
}

type FilterType = "todas" | "creada" | "en_transito" | "entregada"

export default function RemisionesPage() {
  const [filter, setFilter] = useState<FilterType>("todas")
  const [search, setSearch] = useState("")

  const filtered = mockRemisiones.filter((r) => {
    if (filter !== "todas" && r.estatus !== filter) return false
    if (search && !r.folio.toLowerCase().includes(search.toLowerCase()) && !r.material.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

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
            <p className="text-xs text-marble-400">{mockRemisiones.length} registros</p>
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
            placeholder="Buscar por folio o material..."
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

        {/* List */}
        <div className="space-y-2">
          {filtered.map((rem) => {
            const status = estatusConfig[rem.estatus]
            return (
              <div
                key={rem.id}
                className="rounded-xl border border-marble-200 bg-white p-4 shadow-sm active:bg-marble-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-marble-900">{rem.folio}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-marble-700">{rem.material}</p>
                    <p className="text-xs text-marble-400">{rem.lote}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-marble-300 mt-0.5 shrink-0" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-marble-100 pt-2 text-[11px] text-marble-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {rem.obra}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" /> {rem.piezas} pzas &middot; {rem.m2} m²
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" /> {rem.chofer}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {rem.fecha}
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
      </div>
    </div>
  )
}
