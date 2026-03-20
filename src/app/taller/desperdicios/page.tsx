"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Search,
  ChevronRight,
  Ruler,
  MapPin,
  Scissors,
  AlertTriangle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { mockDesperdicios } from "@/lib/desperdicios-mock"

const calidadConfig = {
  buena: { label: "BUENA", color: "bg-semaforo-verde/15 text-semaforo-verde" },
  regular: { label: "REGULAR", color: "bg-semaforo-amarillo/15 text-semaforo-amarillo" },
  solo_piezas_pequeñas: { label: "SOLO PZS. PEQUEÑAS", color: "bg-semaforo-rojo/15 text-semaforo-rojo" },
}

type FilterType = "todos" | "disponibles" | "usados"

export default function DesperdiciosPage() {
  const [filter, setFilter] = useState<FilterType>("todos")
  const [search, setSearch] = useState("")

  const filtered = mockDesperdicios.filter((d) => {
    if (filter === "disponibles" && !d.disponible) return false
    if (filter === "usados" && d.disponible) return false
    if (
      search &&
      !d.tipo_material.toLowerCase().includes(search.toLowerCase()) &&
      !d.ubicacion_planta?.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  const disponibles = mockDesperdicios.filter((d) => d.disponible).length
  const usados = mockDesperdicios.filter((d) => !d.disponible).length
  const totalM2 = mockDesperdicios
    .filter((d) => d.disponible)
    .reduce((sum, d) => sum + (d.largo_cm * d.ancho_cm) / 10000, 0)

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/taller/dashboard" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Desperdicios</h1>
            <p className="text-xs text-marble-400">Inventario de retazos</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-500" />
          <Input
            placeholder="Buscar por material o ubicación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl border-marble-700 bg-marble-900 pl-9 text-sm text-white placeholder:text-marble-500 focus:border-golden focus:ring-golden"
          />
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Action Cards */}
        <div className="-mt-3 grid grid-cols-2 gap-3">
          <Link
            href="/taller/desperdicios/nuevo"
            className="flex flex-col items-center gap-2 rounded-2xl bg-marble-950 p-5 shadow-lg active:bg-marble-900 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-golden/15">
              <Plus className="h-6 w-6 text-golden" />
            </div>
            <p className="text-xs font-semibold text-white">REGISTRAR</p>
          </Link>
          <Link
            href="/taller/desperdicios/buscar"
            className="flex flex-col items-center gap-2 rounded-2xl bg-marble-950 p-5 shadow-lg active:bg-marble-900 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-golden/15">
              <Search className="h-6 w-6 text-golden" />
            </div>
            <p className="text-xs font-semibold text-white">BUSCAR PIEZA</p>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-marble-200 bg-white p-3 text-center">
            <p className="text-lg font-bold text-semaforo-verde">{disponibles}</p>
            <p className="text-[10px] font-medium text-marble-400">Disponibles</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white p-3 text-center">
            <p className="text-lg font-bold text-marble-400">{usados}</p>
            <p className="text-[10px] font-medium text-marble-400">Usados</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white p-3 text-center">
            <p className="text-lg font-bold text-marble-900">{totalM2.toFixed(1)}</p>
            <p className="text-[10px] font-medium text-marble-400">m² disp.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto py-4 -mx-5 px-5 no-scrollbar">
          {([
            { key: "todos", label: "Todos" },
            { key: "disponibles", label: "Disponibles" },
            { key: "usados", label: "Usados" },
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
          {filtered.map((d) => {
            const cal = calidadConfig[d.calidad]
            return (
              <Link
                key={d.id}
                href={`/taller/desperdicios/${d.id}`}
                className="block rounded-xl border border-marble-200 bg-white p-4 shadow-sm active:bg-marble-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-marble-900">{d.tipo_material}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cal.color}`}>
                        {cal.label}
                      </span>
                      {d.es_irregular && (
                        <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          <AlertTriangle className="h-2.5 w-2.5" /> IRREGULAR
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-sm text-marble-700">
                      <Ruler className="h-3.5 w-3.5 text-marble-400" />
                      <span className="font-medium">
                        {d.largo_cm} × {d.ancho_cm} × {d.espesor_cm} cm
                      </span>
                      <span className="text-marble-400 ml-1">
                        ({((d.largo_cm * d.ancho_cm) / 10000).toFixed(2)} m²)
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-marble-300 mt-0.5 shrink-0" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-marble-100 pt-2 text-[11px] text-marble-400">
                  {d.ubicacion_planta && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {d.ubicacion_planta}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Scissors className="h-3 w-3" />{" "}
                    {d.disponible ? (
                      <span className="text-semaforo-verde font-medium">Disponible</span>
                    ) : (
                      <span className="text-marble-400">Usado</span>
                    )}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 text-center">
            <Scissors className="mx-auto h-10 w-10 text-marble-300" />
            <p className="mt-2 text-sm text-marble-400">No se encontraron desperdicios</p>
          </div>
        )}
      </div>
    </div>
  )
}
