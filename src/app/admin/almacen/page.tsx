"use client"

import { useState } from "react"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Filter,
  Plus,
  Search,
  Clock,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

// ── Mock data ──
type Movement = {
  id: string
  material: string
  tipo: "entrada" | "salida"
  cantidad: number
  unidad: string
  obraDestino: string | null
  responsable: string
  notas: string
  fecha: string
}

const mockMovements: Movement[] = [
  { id: "1", material: "Mármol Blanco Carrara", tipo: "entrada", cantidad: 5, unidad: "láminas", obraDestino: null, responsable: "Laura Castro", notas: "Recepción OC-2026-00032", fecha: "2026-03-19 10:30" },
  { id: "2", material: "Disco Diamante 10\"", tipo: "salida", cantidad: 3, unidad: "piezas", obraDestino: "Torre Esmeralda", responsable: "Laura Castro", notas: "Solicitud de taller", fecha: "2026-03-19 09:15" },
  { id: "3", material: "Pegamento Piedra Natural", tipo: "entrada", cantidad: 20, unidad: "litros", obraDestino: null, responsable: "Laura Castro", notas: "Compra directa", fecha: "2026-03-18 16:00" },
  { id: "4", material: "Lámina Travertino Noce", tipo: "salida", cantidad: 2, unidad: "láminas", obraDestino: "Residencial Las Palmas", responsable: "Laura Castro", notas: "Remisión REM-2026-00089", fecha: "2026-03-18 14:20" },
  { id: "5", material: "Resina Epóxica Transparente", tipo: "entrada", cantidad: 10, unidad: "litros", obraDestino: null, responsable: "Laura Castro", notas: "Recepción OC-2026-00031", fecha: "2026-03-18 11:00" },
  { id: "6", material: "Mármol Crema Marfil", tipo: "salida", cantidad: 4, unidad: "láminas", obraDestino: "Hotel Atlántico", responsable: "Laura Castro", notas: "Remisión REM-2026-00088", fecha: "2026-03-17 15:30" },
  { id: "7", material: "Lija de Agua #220", tipo: "entrada", cantidad: 50, unidad: "piezas", obraDestino: null, responsable: "Laura Castro", notas: "Compra directa", fecha: "2026-03-17 10:00" },
  { id: "8", material: "Silicón para Mármol", tipo: "salida", cantidad: 6, unidad: "tubos", obraDestino: "Torre Esmeralda", responsable: "Laura Castro", notas: "Pedido de obra", fecha: "2026-03-16 13:45" },
  { id: "9", material: "Mármol Negro Monterrey", tipo: "entrada", cantidad: 3, unidad: "láminas", obraDestino: null, responsable: "Laura Castro", notas: "Recepción OC-2026-00030", fecha: "2026-03-16 09:30" },
  { id: "10", material: "Disco Diamante 14\"", tipo: "salida", cantidad: 1, unidad: "piezas", obraDestino: null, responsable: "Laura Castro", notas: "Reemplazo en taller", fecha: "2026-03-15 16:00" },
]

const summaryCards = [
  { label: "Entradas Hoy", value: "5", icon: ArrowDownToLine, color: "text-emerald-600 bg-emerald-50" },
  { label: "Salidas Hoy", value: "3", icon: ArrowUpFromLine, color: "text-orange-600 bg-orange-50" },
  { label: "Movimientos Semana", value: "38", icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
  { label: "Materiales Distintos", value: "24", icon: Package, color: "text-purple-600 bg-purple-50" },
]

export default function AlmacenPage() {
  const [filterTipo, setFilterTipo] = useState<"todos" | "entrada" | "salida">("todos")
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = mockMovements.filter((m) => {
    if (filterTipo !== "todos" && m.tipo !== filterTipo) return false
    if (searchTerm && !m.material.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Almacén</h1>
          <p className="text-sm text-[#7A6D5A]">Entradas y salidas de materiales</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#1E1A14] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2A2520]">
          <Plus className="h-4 w-4" />
          Nuevo Movimiento
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-[#E0DBD1] bg-white p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-[#7A6D5A]">{card.label}</p>
                <p className="text-xl font-bold text-[#1E1A14]">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
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
          {(["todos", "entrada", "salida"] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFilterTipo(tipo)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterTipo === tipo
                  ? "bg-[#1E1A14] text-white"
                  : "text-[#7A6D5A] hover:bg-[#F0EDE8]"
              }`}
            >
              {tipo === "todos" ? "Todos" : tipo === "entrada" ? "Entradas" : "Salidas"}
            </button>
          ))}
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-[#E0DBD1] bg-white px-3 py-2 text-xs font-medium text-[#7A6D5A] hover:bg-[#F0EDE8]">
          <Filter className="h-3.5 w-3.5" />
          Más Filtros
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#E0DBD1] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E0DBD1] text-left text-xs text-[#7A6D5A]">
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Material</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Cantidad</th>
                <th className="px-5 py-3 font-medium">Obra Destino</th>
                <th className="px-5 py-3 font-medium">Responsable</th>
                <th className="px-5 py-3 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((mov) => (
                <tr key={mov.id} className="border-b border-[#F0EDE8] hover:bg-[#FAF9F7] transition-colors">
                  <td className="px-5 py-3 text-[#7A6D5A] whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {mov.fecha}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-[#1E1A14]">{mov.material}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        mov.tipo === "entrada"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {mov.tipo === "entrada" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#1E1A14]">
                    {mov.cantidad} {mov.unidad}
                  </td>
                  <td className="px-5 py-3 text-[#7A6D5A]">{mov.obraDestino ?? "—"}</td>
                  <td className="px-5 py-3 text-[#7A6D5A]">{mov.responsable}</td>
                  <td className="px-5 py-3 text-[#7A6D5A] max-w-[200px] truncate">{mov.notas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#E0DBD1] px-5 py-3">
          <p className="text-xs text-[#7A6D5A]">Mostrando {filtered.length} de {mockMovements.length} movimientos</p>
          <div className="flex items-center gap-1">
            <button className="rounded-md border border-[#E0DBD1] px-3 py-1 text-xs text-[#7A6D5A] hover:bg-[#F0EDE8]">Anterior</button>
            <button className="rounded-md bg-[#1E1A14] px-3 py-1 text-xs text-white">1</button>
            <button className="rounded-md border border-[#E0DBD1] px-3 py-1 text-xs text-[#7A6D5A] hover:bg-[#F0EDE8]">2</button>
            <button className="rounded-md border border-[#E0DBD1] px-3 py-1 text-xs text-[#7A6D5A] hover:bg-[#F0EDE8]">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  )
}
