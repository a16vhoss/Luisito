"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  ArrowUpDown,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Package,
  Recycle,
  Layers,
} from "lucide-react"
import type { Desperdicio } from "@/types/database.types"

// ── Mock data for initial development ──
const mockSobrantes: (Desperdicio & { material_nombre?: string })[] = [
  { id: "sob-001", tipo_material: "Mármol Blanco Carrara", largo_cm: 45, ancho_cm: 30, espesor_cm: 2, es_irregular: false, calidad: "buena", ubicacion_planta: "Rack A-3", foto_url: null, disponible: true, usado_en_pieza_id: null, lamina_id: null, notas: null, created_at: "2026-03-19T10:30:00Z" },
  { id: "sob-002", tipo_material: "Mármol Crema Marfil", largo_cm: 60, ancho_cm: 25, espesor_cm: 2, es_irregular: true, calidad: "regular", ubicacion_planta: "Rack B-1", foto_url: null, disponible: true, usado_en_pieza_id: null, lamina_id: null, notas: null, created_at: "2026-03-18T14:00:00Z" },
  { id: "sob-003", tipo_material: "Travertino Noce", largo_cm: 35, ancho_cm: 20, espesor_cm: 3, es_irregular: false, calidad: "buena", ubicacion_planta: "Rack A-5", foto_url: null, disponible: false, usado_en_pieza_id: "pieza-123", lamina_id: null, notas: null, created_at: "2026-03-17T09:15:00Z" },
  { id: "sob-004", tipo_material: "Granito Gris Oxford", largo_cm: 80, ancho_cm: 40, espesor_cm: 2, es_irregular: false, calidad: "buena", ubicacion_planta: "Rack C-2", foto_url: null, disponible: true, usado_en_pieza_id: null, lamina_id: null, notas: null, created_at: "2026-03-16T16:45:00Z" },
  { id: "sob-005", tipo_material: "Mármol Negro Monterrey", largo_cm: 25, ancho_cm: 15, espesor_cm: 2, es_irregular: true, calidad: "solo_piezas_pequeñas", ubicacion_planta: "Rack D-1", foto_url: null, disponible: true, usado_en_pieza_id: null, lamina_id: null, notas: null, created_at: "2026-03-15T11:30:00Z" },
  { id: "sob-006", tipo_material: "Mármol Blanco Carrara", largo_cm: 55, ancho_cm: 35, espesor_cm: 2, es_irregular: false, calidad: "buena", ubicacion_planta: "Rack A-4", foto_url: null, disponible: true, usado_en_pieza_id: null, lamina_id: null, notas: null, created_at: "2026-03-14T08:20:00Z" },
  { id: "sob-007", tipo_material: "Mármol Rosa Zarci", largo_cm: 40, ancho_cm: 28, espesor_cm: 2, es_irregular: false, calidad: "regular", ubicacion_planta: "Rack B-3", foto_url: null, disponible: false, usado_en_pieza_id: "pieza-456", lamina_id: null, notas: null, created_at: "2026-03-13T13:00:00Z" },
  { id: "sob-008", tipo_material: "Travertino Noce", largo_cm: 70, ancho_cm: 50, espesor_cm: 3, es_irregular: true, calidad: "buena", ubicacion_planta: "Rack C-1", foto_url: null, disponible: true, usado_en_pieza_id: null, lamina_id: null, notas: null, created_at: "2026-03-12T10:00:00Z" },
  { id: "sob-009", tipo_material: "Granito Gris Oxford", largo_cm: 30, ancho_cm: 18, espesor_cm: 2, es_irregular: false, calidad: "solo_piezas_pequeñas", ubicacion_planta: "Rack D-2", foto_url: null, disponible: true, usado_en_pieza_id: null, lamina_id: null, notas: null, created_at: "2026-03-10T15:30:00Z" },
  { id: "sob-010", tipo_material: "Mármol Crema Marfil", largo_cm: 90, ancho_cm: 45, espesor_cm: 2, es_irregular: false, calidad: "buena", ubicacion_planta: "Rack A-1", foto_url: null, disponible: true, usado_en_pieza_id: null, lamina_id: null, notas: null, created_at: "2026-03-08T09:45:00Z" },
  { id: "sob-011", tipo_material: "Mármol Blanco Carrara", largo_cm: 20, ancho_cm: 12, espesor_cm: 2, es_irregular: true, calidad: "solo_piezas_pequeñas", ubicacion_planta: "Rack D-3", foto_url: null, disponible: false, usado_en_pieza_id: "pieza-789", lamina_id: null, notas: null, created_at: "2026-03-06T14:15:00Z" },
  { id: "sob-012", tipo_material: "Mármol Negro Monterrey", largo_cm: 65, ancho_cm: 38, espesor_cm: 2, es_irregular: false, calidad: "regular", ubicacion_planta: "Rack B-2", foto_url: null, disponible: true, usado_en_pieza_id: null, lamina_id: null, notas: null, created_at: "2026-03-05T11:00:00Z" },
]

const calidadLabels: Record<string, string> = {
  buena: "Buena",
  regular: "Regular",
  solo_piezas_pequeñas: "Solo piezas pequeñas",
}

const calidadColors: Record<string, string> = {
  buena: "bg-emerald-100 text-emerald-700",
  regular: "bg-amber-100 text-amber-700",
  solo_piezas_pequeñas: "bg-orange-100 text-orange-700",
}

type SortField = "id" | "tipo_material" | "dimensiones" | "calidad" | "created_at"
type SortDir = "asc" | "desc"

export default function SobrantesPage() {
  const [sobrantes, setSobrantes] = useState(mockSobrantes)
  const [filterMaterial, setFilterMaterial] = useState("todos")
  const [filterCalidad, setFilterCalidad] = useState("todos")
  const [filterDisponible, setFilterDisponible] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Unique material types for filter
  const materialTypes = useMemo(
    () => Array.from(new Set(sobrantes.map((s) => s.tipo_material))).sort(),
    [sobrantes]
  )

  // Stats
  const totalSobrantes = sobrantes.length
  const disponibles = sobrantes.filter((s) => s.disponible).length
  const usados = sobrantes.filter((s) => !s.disponible).length
  const calidadBuena = sobrantes.filter((s) => s.calidad === "buena").length
  const calidadRegular = sobrantes.filter((s) => s.calidad === "regular").length
  const calidadPequeñas = sobrantes.filter((s) => s.calidad === "solo_piezas_pequeñas").length

  // Filter
  const filtered = useMemo(() => {
    const result = sobrantes.filter((s) => {
      if (filterMaterial !== "todos" && s.tipo_material !== filterMaterial) return false
      if (filterCalidad !== "todos" && s.calidad !== filterCalidad) return false
      if (filterDisponible === "disponible" && !s.disponible) return false
      if (filterDisponible === "usado" && s.disponible) return false
      if (searchTerm && !s.tipo_material.toLowerCase().includes(searchTerm.toLowerCase()) && !s.id.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "id":
          cmp = a.id.localeCompare(b.id)
          break
        case "tipo_material":
          cmp = a.tipo_material.localeCompare(b.tipo_material)
          break
        case "dimensiones":
          cmp = (a.largo_cm * a.ancho_cm) - (b.largo_cm * b.ancho_cm)
          break
        case "calidad":
          cmp = a.calidad.localeCompare(b.calidad)
          break
        case "created_at":
          cmp = a.created_at.localeCompare(b.created_at)
          break
      }
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [sobrantes, filterMaterial, filterCalidad, filterDisponible, searchTerm, sortField, sortDir])

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)))
    }
  }

  function handleBulkMarkUnavailable() {
    setSobrantes((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, disponible: false } : s))
    )
    setSelectedIds(new Set())
  }

  function handleBulkDelete() {
    if (!confirm(`¿Eliminar ${selectedIds.size} sobrante(s)? Esta acción no se puede deshacer.`)) return
    setSobrantes((prev) => prev.filter((s) => !selectedIds.has(s.id)))
    setSelectedIds(new Set())
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  function shortId(id: string) {
    return id.length > 8 ? id.slice(0, 8) + "..." : id
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Gesti&oacute;n de Sobrantes</h1>
          <p className="text-sm text-[#7A6D5A]">Control y seguimiento de desperdicios reutilizables</p>
        </div>
        <Link
          href="/admin/sobrantes/nuevo"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1E1A14] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2A2520]"
        >
          <Plus className="h-4 w-4" />
          Registrar Sobrante
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Total</p>
              <p className="text-xl font-bold text-[#1E1A14]">{totalSobrantes}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Disponibles</p>
              <p className="text-xl font-bold text-emerald-600">{disponibles}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <Recycle className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Usados</p>
              <p className="text-xl font-bold text-purple-600">{usados}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <Layers className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Buena</p>
              <p className="text-xl font-bold text-[#1E1A14]">{calidadBuena}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <Layers className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Regular</p>
              <p className="text-xl font-bold text-[#1E1A14]">{calidadRegular}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2">
              <Layers className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Solo peq.</p>
              <p className="text-xl font-bold text-[#1E1A14]">{calidadPequeñas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6D5A]" />
          <input
            type="text"
            placeholder="Buscar por material o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-[#E0DBD1] bg-white pl-9 pr-4 text-sm text-[#1E1A14] placeholder:text-[#7A6D5A] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
          />
        </div>

        {/* Material filter */}
        <select
          value={filterMaterial}
          onChange={(e) => setFilterMaterial(e.target.value)}
          className="h-9 rounded-lg border border-[#E0DBD1] bg-white px-3 text-xs font-medium text-[#7A6D5A] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
        >
          <option value="todos">Todos los materiales</option>
          {materialTypes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Calidad filter */}
        <div className="flex items-center gap-1 rounded-lg border border-[#E0DBD1] bg-white p-1">
          {(["todos", "buena", "regular", "solo_piezas_pequeñas"] as const).map((cal) => (
            <button
              key={cal}
              onClick={() => setFilterCalidad(cal)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterCalidad === cal
                  ? "bg-[#1E1A14] text-white"
                  : "text-[#7A6D5A] hover:bg-[#F0EDE8]"
              }`}
            >
              {cal === "todos" ? "Todas" : calidadLabels[cal]}
            </button>
          ))}
        </div>

        {/* Disponibilidad filter */}
        <div className="flex items-center gap-1 rounded-lg border border-[#E0DBD1] bg-white p-1">
          {[
            { key: "todos", label: "Todos" },
            { key: "disponible", label: "Disponibles" },
            { key: "usado", label: "Usados" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilterDisponible(opt.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterDisponible === opt.key
                  ? "bg-[#1E1A14] text-white"
                  : "text-[#7A6D5A] hover:bg-[#F0EDE8]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.size} seleccionado(s)
          </span>
          <div className="h-4 w-px bg-blue-200" />
          <button
            onClick={handleBulkMarkUnavailable}
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200"
          >
            <XCircle className="h-3.5 w-3.5" />
            Marcar no disponible
          </button>
          <button
            onClick={handleBulkDelete}
            className="inline-flex items-center gap-1.5 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-[#E0DBD1] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E0DBD1] text-left text-xs text-[#7A6D5A]">
                <th className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-[#E0DBD1] text-[#1E1A14] focus:ring-[#D4A843]"
                  />
                </th>
                <th className="px-5 py-3 font-medium">
                  <button onClick={() => handleSort("id")} className="inline-flex items-center gap-1 cursor-pointer hover:text-[#1E1A14]">
                    ID <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-5 py-3 font-medium">
                  <button onClick={() => handleSort("tipo_material")} className="inline-flex items-center gap-1 cursor-pointer hover:text-[#1E1A14]">
                    Material <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-5 py-3 font-medium">
                  <button onClick={() => handleSort("dimensiones")} className="inline-flex items-center gap-1 cursor-pointer hover:text-[#1E1A14]">
                    Dimensiones <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-5 py-3 font-medium">
                  <button onClick={() => handleSort("calidad")} className="inline-flex items-center gap-1 cursor-pointer hover:text-[#1E1A14]">
                    Calidad <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-5 py-3 font-medium">Ubicaci&oacute;n</th>
                <th className="px-5 py-3 font-medium">Disponible</th>
                <th className="px-5 py-3 font-medium">Usado en</th>
                <th className="px-5 py-3 font-medium">
                  <button onClick={() => handleSort("created_at")} className="inline-flex items-center gap-1 cursor-pointer hover:text-[#1E1A14]">
                    Fecha registro <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-5 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sob) => (
                <tr
                  key={sob.id}
                  className={`border-b border-[#F0EDE8] hover:bg-[#FAF9F7] transition-colors ${
                    selectedIds.has(sob.id) ? "bg-blue-50/50" : ""
                  }`}
                >
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(sob.id)}
                      onChange={() => toggleSelect(sob.id)}
                      className="h-4 w-4 rounded border-[#E0DBD1] text-[#1E1A14] focus:ring-[#D4A843]"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs text-[#7A6D5A]">{shortId(sob.id)}</span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#1E1A14]">{sob.tipo_material}</p>
                    {sob.es_irregular && (
                      <span className="text-[10px] text-amber-600 font-medium">Irregular</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[#7A6D5A] whitespace-nowrap">
                    {sob.largo_cm} &times; {sob.ancho_cm} &times; {sob.espesor_cm} cm
                    <p className="text-[10px] text-[#7A6D5A]">
                      {((sob.largo_cm * sob.ancho_cm) / 10000).toFixed(2)} m&sup2;
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${calidadColors[sob.calidad]}`}>
                      {calidadLabels[sob.calidad]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#7A6D5A]">{sob.ubicacion_planta ?? "—"}</td>
                  <td className="px-5 py-3">
                    {sob.disponible ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        S&iacute;
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                        <XCircle className="h-3 w-3" />
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {sob.usado_en_pieza_id ? (
                      <span className="font-mono text-xs text-purple-600">{shortId(sob.usado_en_pieza_id)}</span>
                    ) : (
                      <span className="text-[#7A6D5A]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[#7A6D5A] whitespace-nowrap">
                    {formatDate(sob.created_at)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button className="rounded-md p-1.5 text-[#7A6D5A] hover:bg-[#F0EDE8]" title="Ver detalle">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-md p-1.5 text-red-400 hover:bg-red-50"
                        title="Eliminar"
                        onClick={() => {
                          if (confirm("¿Eliminar este sobrante?")) {
                            setSobrantes((prev) => prev.filter((s) => s.id !== sob.id))
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-sm text-[#7A6D5A]">
                    No se encontraron sobrantes con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#E0DBD1] px-5 py-3">
          <p className="text-xs text-[#7A6D5A]">
            Mostrando {filtered.length} de {sobrantes.length} sobrantes
          </p>
          <div className="flex items-center gap-1">
            <button className="rounded-md border border-[#E0DBD1] px-3 py-1 text-xs text-[#7A6D5A] hover:bg-[#F0EDE8]">Anterior</button>
            <button className="rounded-md bg-[#1E1A14] px-3 py-1 text-xs text-white">1</button>
            <button className="rounded-md border border-[#E0DBD1] px-3 py-1 text-xs text-[#7A6D5A] hover:bg-[#F0EDE8]">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  )
}
