"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Download,
  AlertTriangle,
  Package,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Eye,
  Edit,
} from "lucide-react"

// ── Mock data ──
type Material = {
  id: string
  nombre: string
  tipo: "lamina" | "insumo" | "herramienta" | "combustible"
  unidadMedida: string
  stockActual: number
  stockMinimo: number
  precioReferencia: number | null
  activo: boolean
  ultimoMov: string
}

const mockMateriales: Material[] = [
  { id: "1", nombre: "Mármol Blanco Carrara", tipo: "lamina", unidadMedida: "láminas", stockActual: 12, stockMinimo: 5, precioReferencia: 15000, activo: true, ultimoMov: "2026-03-19" },
  { id: "2", nombre: "Mármol Crema Marfil", tipo: "lamina", unidadMedida: "láminas", stockActual: 3, stockMinimo: 10, precioReferencia: 12000, activo: true, ultimoMov: "2026-03-17" },
  { id: "3", nombre: "Mármol Negro Monterrey", tipo: "lamina", unidadMedida: "láminas", stockActual: 8, stockMinimo: 5, precioReferencia: 18000, activo: true, ultimoMov: "2026-03-16" },
  { id: "4", nombre: "Travertino Noce", tipo: "lamina", unidadMedida: "láminas", stockActual: 6, stockMinimo: 5, precioReferencia: 14000, activo: true, ultimoMov: "2026-03-18" },
  { id: "5", nombre: "Granito Gris Oxford", tipo: "lamina", unidadMedida: "láminas", stockActual: 15, stockMinimo: 8, precioReferencia: 11000, activo: true, ultimoMov: "2026-03-14" },
  { id: "6", nombre: "Disco Diamante 10\"", tipo: "herramienta", unidadMedida: "piezas", stockActual: 8, stockMinimo: 5, precioReferencia: 2800, activo: true, ultimoMov: "2026-03-19" },
  { id: "7", nombre: "Disco Diamante 14\"", tipo: "herramienta", unidadMedida: "piezas", stockActual: 2, stockMinimo: 5, precioReferencia: 4500, activo: true, ultimoMov: "2026-03-15" },
  { id: "8", nombre: "Resina Epóxica Transparente", tipo: "insumo", unidadMedida: "litros", stockActual: 4, stockMinimo: 8, precioReferencia: 450, activo: true, ultimoMov: "2026-03-18" },
  { id: "9", nombre: "Pegamento Piedra Natural", tipo: "insumo", unidadMedida: "litros", stockActual: 25, stockMinimo: 10, precioReferencia: 380, activo: true, ultimoMov: "2026-03-18" },
  { id: "10", nombre: "Lija de Agua #220", tipo: "insumo", unidadMedida: "piezas", stockActual: 50, stockMinimo: 30, precioReferencia: 15, activo: true, ultimoMov: "2026-03-17" },
  { id: "11", nombre: "Lija de Agua #400", tipo: "insumo", unidadMedida: "piezas", stockActual: 15, stockMinimo: 30, precioReferencia: 18, activo: true, ultimoMov: "2026-03-14" },
  { id: "12", nombre: "Silicón para Mármol", tipo: "insumo", unidadMedida: "tubos", stockActual: 20, stockMinimo: 10, precioReferencia: 95, activo: true, ultimoMov: "2026-03-16" },
  { id: "13", nombre: "Diésel", tipo: "combustible", unidadMedida: "litros", stockActual: 500, stockMinimo: 200, precioReferencia: 24, activo: true, ultimoMov: "2026-03-19" },
  { id: "14", nombre: "Pulidora Angular 7\"", tipo: "herramienta", unidadMedida: "piezas", stockActual: 4, stockMinimo: 2, precioReferencia: 8500, activo: true, ultimoMov: "2026-03-10" },
  { id: "15", nombre: "Mármol Rosa Zarci", tipo: "lamina", unidadMedida: "láminas", stockActual: 0, stockMinimo: 3, precioReferencia: 22000, activo: false, ultimoMov: "2026-02-28" },
]

const tipoLabels: Record<string, string> = {
  lamina: "Lámina",
  insumo: "Insumo",
  herramienta: "Herramienta",
  combustible: "Combustible",
}

const tipoColors: Record<string, string> = {
  lamina: "bg-purple-100 text-purple-700",
  insumo: "bg-blue-100 text-blue-700",
  herramienta: "bg-amber-100 text-amber-700",
  combustible: "bg-emerald-100 text-emerald-700",
}

function getStockStatus(actual: number, minimo: number) {
  if (actual === 0) return { label: "Agotado", color: "text-red-600", bg: "bg-red-50", icon: XCircle }
  if (actual < minimo) return { label: "Bajo", color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle }
  return { label: "OK", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 }
}

function formatMoney(n: number | null) {
  if (n === null) return "—"
  return "$" + n.toLocaleString("es-MX")
}

export default function InventarioPage() {
  const [filterTipo, setFilterTipo] = useState<string>("todos")
  const [filterStock, setFilterStock] = useState<string>("todos")
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = mockMateriales.filter((m) => {
    if (filterTipo !== "todos" && m.tipo !== filterTipo) return false
    if (filterStock === "bajo" && m.stockActual >= m.stockMinimo) return false
    if (filterStock === "agotado" && m.stockActual > 0) return false
    if (filterStock === "ok" && m.stockActual < m.stockMinimo) return false
    if (searchTerm && !m.nombre.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const totalItems = mockMateriales.length
  const alertCount = mockMateriales.filter((m) => m.stockActual < m.stockMinimo).length
  const agotadoCount = mockMateriales.filter((m) => m.stockActual === 0).length
  const totalValue = mockMateriales.reduce((sum, m) => sum + m.stockActual * (m.precioReferencia ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Inventario</h1>
          <p className="text-sm text-[#7A6D5A]">Control detallado de materiales y alertas de stock</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-[#E0DBD1] bg-white px-4 py-2.5 text-sm font-medium text-[#1E1A14] transition-colors hover:bg-[#F0EDE8]">
          <Download className="h-4 w-4" />
          Exportar
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Total Materiales</p>
              <p className="text-xl font-bold text-[#1E1A14]">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <Package className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Valor Total</p>
              <p className="text-xl font-bold text-[#1E1A14]">{formatMoney(totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Stock Bajo</p>
              <p className="text-xl font-bold text-amber-600">{alertCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Agotados</p>
              <p className="text-xl font-bold text-red-600">{agotadoCount}</p>
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
            placeholder="Buscar material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-[#E0DBD1] bg-white pl-9 pr-4 text-sm text-[#1E1A14] placeholder:text-[#7A6D5A] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#E0DBD1] bg-white p-1">
          {["todos", "lamina", "insumo", "herramienta", "combustible"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFilterTipo(tipo)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterTipo === tipo
                  ? "bg-[#1E1A14] text-white"
                  : "text-[#7A6D5A] hover:bg-[#F0EDE8]"
              }`}
            >
              {tipo === "todos" ? "Todos" : tipoLabels[tipo]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#E0DBD1] bg-white p-1">
          {[
            { key: "todos", label: "Todos" },
            { key: "bajo", label: "Stock Bajo" },
            { key: "agotado", label: "Agotado" },
            { key: "ok", label: "OK" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilterStock(opt.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterStock === opt.key
                  ? "bg-[#1E1A14] text-white"
                  : "text-[#7A6D5A] hover:bg-[#F0EDE8]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#E0DBD1] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E0DBD1] text-left text-xs text-[#7A6D5A]">
                <th className="px-5 py-3 font-medium">
                  <span className="inline-flex items-center gap-1 cursor-pointer">
                    Material <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Unidad</th>
                <th className="px-5 py-3 font-medium">
                  <span className="inline-flex items-center gap-1 cursor-pointer">
                    Stock Actual <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="px-5 py-3 font-medium">Stock Mín.</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Precio Ref.</th>
                <th className="px-5 py-3 font-medium">Valor Stock</th>
                <th className="px-5 py-3 font-medium">Último Mov.</th>
                <th className="px-5 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((mat) => {
                const status = getStockStatus(mat.stockActual, mat.stockMinimo)
                const StatusIcon = status.icon
                const valorStock = mat.stockActual * (mat.precioReferencia ?? 0)
                const stockPct = mat.stockMinimo > 0 ? Math.min((mat.stockActual / mat.stockMinimo) * 100, 100) : 100
                return (
                  <tr
                    key={mat.id}
                    className={`border-b border-[#F0EDE8] hover:bg-[#FAF9F7] transition-colors ${
                      !mat.activo ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#1E1A14]">{mat.nombre}</p>
                      {!mat.activo && <span className="text-xs text-red-500">Inactivo</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tipoColors[mat.tipo]}`}>
                        {tipoLabels[mat.tipo]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#7A6D5A]">{mat.unidadMedida}</td>
                    <td className="px-5 py-3">
                      <div className="space-y-1">
                        <span className="font-semibold text-[#1E1A14]">{mat.stockActual}</span>
                        <div className="h-1.5 w-16 rounded-full bg-[#F0EDE8]">
                          <div
                            className={`h-1.5 rounded-full ${
                              mat.stockActual === 0
                                ? "bg-red-400"
                                : mat.stockActual < mat.stockMinimo
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                            }`}
                            style={{ width: `${stockPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#7A6D5A]">{mat.stockMinimo}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.bg} ${status.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#7A6D5A]">{formatMoney(mat.precioReferencia)}</td>
                    <td className="px-5 py-3 font-medium text-[#1E1A14]">{formatMoney(valorStock)}</td>
                    <td className="px-5 py-3 text-[#7A6D5A] whitespace-nowrap">{mat.ultimoMov}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button className="rounded-md p-1.5 text-[#7A6D5A] hover:bg-[#F0EDE8]" title="Ver detalle">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-md p-1.5 text-[#7A6D5A] hover:bg-[#F0EDE8]" title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#E0DBD1] px-5 py-3">
          <p className="text-xs text-[#7A6D5A]">
            Mostrando {filtered.length} de {mockMateriales.length} materiales
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
