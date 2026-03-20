"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  CheckCircle2,
  Package,
  Ruler,
  MapPin,
  Image as ImageIcon,
  LayoutGrid,
  List,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { Desperdicio } from "@/types/database.types"

const calidadConfig = {
  buena: { label: "BUENA", color: "bg-semaforo-verde/15 text-semaforo-verde border border-semaforo-verde/30" },
  regular: { label: "REGULAR", color: "bg-semaforo-amarillo/15 text-semaforo-amarillo border border-semaforo-amarillo/30" },
  solo_piezas_pequeñas: { label: "SOLO PIEZAS PEQUEÑAS", color: "bg-semaforo-rojo/15 text-semaforo-rojo border border-semaforo-rojo/30" },
}

type CalidadFilter = "todas" | "buena" | "regular" | "solo_piezas_pequeñas"
type DisponibilidadFilter = "todas" | "disponible" | "usada"

export default function SobrantesPage() {
  const [sobrantes, setSobrantes] = useState<Desperdicio[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [calidadFilter, setCalidadFilter] = useState<CalidadFilter>("todas")
  const [disponibilidadFilter, setDisponibilidadFilter] = useState<DisponibilidadFilter>("todas")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const supabase = createClient()

  useEffect(() => {
    fetchSobrantes()
  }, [])

  async function fetchSobrantes() {
    setLoading(true)
    const { data, error } = await supabase
      .from("desperdicios")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setSobrantes(data as Desperdicio[])
    }
    setLoading(false)
  }

  async function handleMarkAsUsed(id: string) {
    const { error } = await supabase
      .from("desperdicios")
      .update({ disponible: false })
      .eq("id", id)

    if (!error) {
      setSobrantes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, disponible: false } : s))
      )
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este sobrante permanentemente?")) return
    const { error } = await supabase
      .from("desperdicios")
      .delete()
      .eq("id", id)

    if (!error) {
      setSobrantes((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const filtered = sobrantes.filter((s) => {
    if (calidadFilter !== "todas" && s.calidad !== calidadFilter) return false
    if (disponibilidadFilter === "disponible" && !s.disponible) return false
    if (disponibilidadFilter === "usada" && s.disponible) return false
    if (
      search &&
      !s.tipo_material.toLowerCase().includes(search.toLowerCase()) &&
      !(s.ubicacion_planta || "").toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  const totalDisponibles = sobrantes.filter((s) => s.disponible).length
  const totalUsados = sobrantes.filter((s) => !s.disponible).length
  const areaTotal = sobrantes
    .filter((s) => s.disponible)
    .reduce((sum, s) => sum + (s.largo_cm * s.ancho_cm) / 10000, 0)

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/taller/dashboard" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Sobrantes de Material</h1>
            <p className="text-xs text-marble-400">{sobrantes.length} registros</p>
          </div>
          <Link
            href="/taller/sobrantes/nuevo"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-golden active:bg-golden-dark"
          >
            <Plus className="h-5 w-5 text-marble-950" />
          </Link>
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
        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-2 py-4">
          <div className="rounded-xl border border-marble-200 bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-marble-900">{totalDisponibles}</p>
            <p className="text-[10px] font-semibold tracking-wider text-semaforo-verde uppercase">Disponibles</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-marble-900">{totalUsados}</p>
            <p className="text-[10px] font-semibold tracking-wider text-marble-400 uppercase">Usados</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-marble-900">{areaTotal.toFixed(1)}</p>
            <p className="text-[10px] font-semibold tracking-wider text-golden uppercase">m² disp.</p>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar">
          {([
            { key: "todas", label: "Todas" },
            { key: "buena", label: "Buena" },
            { key: "regular", label: "Regular" },
            { key: "solo_piezas_pequeñas", label: "Pequeñas" },
          ] as { key: CalidadFilter; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => setCalidadFilter(f.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                calidadFilter === f.key
                  ? "bg-marble-950 text-white"
                  : "bg-marble-200 text-marble-600 active:bg-marble-300"
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="h-4 w-px bg-marble-300 shrink-0" />
          {([
            { key: "todas", label: "Todas" },
            { key: "disponible", label: "Disponible" },
            { key: "usada", label: "Usada" },
          ] as { key: DisponibilidadFilter; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => setDisponibilidadFilter(f.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                disponibilidadFilter === f.key
                  ? "bg-marble-950 text-white"
                  : "bg-marble-200 text-marble-600 active:bg-marble-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex justify-end mb-3">
          <div className="flex rounded-lg border border-marble-200 overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 ${viewMode === "grid" ? "bg-marble-950 text-white" : "bg-white text-marble-400"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 ${viewMode === "list" ? "bg-marble-950 text-white" : "bg-white text-marble-400"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-marble-300 border-t-golden" />
            <p className="mt-3 text-sm text-marble-400">Cargando sobrantes...</p>
          </div>
        )}

        {/* Grid view */}
        {!loading && viewMode === "grid" && (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((sobrante) => {
              const calidad = calidadConfig[sobrante.calidad]
              return (
                <div
                  key={sobrante.id}
                  className={`rounded-xl border bg-white shadow-sm overflow-hidden ${
                    sobrante.disponible ? "border-marble-200" : "border-marble-100 opacity-60"
                  }`}
                >
                  {/* Photo thumbnail */}
                  <div className="flex h-24 items-center justify-center bg-marble-100">
                    {sobrante.foto_url ? (
                      <img
                        src={sobrante.foto_url}
                        alt="Sobrante"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-marble-300" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-marble-900 truncate">
                      {sobrante.tipo_material}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-marble-500">
                      <Ruler className="h-3 w-3" />
                      {sobrante.largo_cm} x {sobrante.ancho_cm} x {sobrante.espesor_cm} cm
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${calidad.color}`}>
                        {calidad.label}
                      </span>
                    </div>
                    {sobrante.ubicacion_planta && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-marble-400">
                        <MapPin className="h-2.5 w-2.5" />
                        {sobrante.ubicacion_planta}
                      </div>
                    )}
                    <div className="mt-1.5 flex items-center gap-1">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          sobrante.disponible ? "bg-semaforo-verde" : "bg-marble-400"
                        }`}
                      />
                      <span className="text-[10px] text-marble-400">
                        {sobrante.disponible ? "Disponible" : "Usado"}
                      </span>
                    </div>
                    {/* Actions */}
                    <div className="mt-2 flex items-center gap-1 border-t border-marble-100 pt-2">
                      <Link
                        href={`/taller/sobrantes/nuevo?edit=${sobrante.id}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-marble-400 active:bg-marble-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      {sobrante.disponible && (
                        <button
                          onClick={() => handleMarkAsUsed(sobrante.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-marble-400 active:bg-marble-100"
                          title="Marcar como usado"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(sobrante.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-marble-400 active:bg-marble-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* List view */}
        {!loading && viewMode === "list" && (
          <div className="space-y-2">
            {filtered.map((sobrante) => {
              const calidad = calidadConfig[sobrante.calidad]
              return (
                <div
                  key={sobrante.id}
                  className={`rounded-xl border bg-white p-4 shadow-sm ${
                    sobrante.disponible ? "border-marble-200" : "border-marble-100 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-marble-900">
                          {sobrante.tipo_material}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${calidad.color}`}>
                          {calidad.label}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-marble-500">
                        <Ruler className="h-3 w-3" />
                        {sobrante.largo_cm} x {sobrante.ancho_cm} x {sobrante.espesor_cm} cm
                        {sobrante.es_irregular && (
                          <span className="ml-1 rounded bg-marble-200 px-1 py-0.5 text-[9px] text-marble-500">
                            IRREGULAR
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          sobrante.disponible ? "bg-semaforo-verde" : "bg-marble-400"
                        }`}
                      />
                      <span className="text-[10px] font-medium text-marble-400">
                        {sobrante.disponible ? "Disponible" : "Usado"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-3 border-t border-marble-100 pt-2 text-[11px] text-marble-400">
                    {sobrante.ubicacion_planta && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {sobrante.ubicacion_planta}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" />{" "}
                      {((sobrante.largo_cm * sobrante.ancho_cm) / 10000).toFixed(2)} m²
                    </span>
                    {sobrante.foto_url && (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" /> Foto
                      </span>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="mt-2 flex items-center gap-2 border-t border-marble-100 pt-2">
                    <Link
                      href={`/taller/sobrantes/nuevo?edit=${sobrante.id}`}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-marble-500 active:bg-marble-100"
                    >
                      <Pencil className="h-3 w-3" /> Editar
                    </Link>
                    {sobrante.disponible && (
                      <button
                        onClick={() => handleMarkAsUsed(sobrante.id)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-marble-500 active:bg-marble-100"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Marcar usado
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(sobrante.id)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-semaforo-rojo/70 active:bg-marble-100"
                    >
                      <Trash2 className="h-3 w-3" /> Eliminar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="mt-12 text-center">
            <Package className="mx-auto h-10 w-10 text-marble-300" />
            <p className="mt-2 text-sm text-marble-400">No se encontraron sobrantes</p>
            <Link
              href="/taller/sobrantes/nuevo"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-golden"
            >
              <Plus className="h-4 w-4" /> Registrar primer sobrante
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
