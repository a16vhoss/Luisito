"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Filter,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  ShoppingCart,
  Truck,
  MoreHorizontal,
} from "lucide-react"

// ── Datos ──
type OrdenCompra = {
  id: string
  folio: string
  proveedor: string
  estatus: "pendiente" | "aprobada" | "recibida" | "cancelada"
  total: number
  items: number
  creadoPor: string
  aprobadoPor: string | null
  fecha: string
  notas: string
}

const ordenes: OrdenCompra[] = [
  { id: "1", folio: "OC-2026-00034", proveedor: "Mármoles del Sureste", estatus: "pendiente", total: 84500, items: 3, creadoPor: "Laura Castro", aprobadoPor: null, fecha: "2026-03-18", notas: "Láminas para Torre Esmeralda" },
  { id: "2", folio: "OC-2026-00033", proveedor: "Insumos Industriales MX", estatus: "aprobada", total: 12300, items: 5, creadoPor: "Laura Castro", aprobadoPor: "Andrée Hossfeldt", fecha: "2026-03-17", notas: "Insumos varios para taller" },
  { id: "3", folio: "OC-2026-00032", proveedor: "Herramientas ProCut", estatus: "recibida", total: 45000, items: 2, creadoPor: "Laura Castro", aprobadoPor: "Andrée Hossfeldt", fecha: "2026-03-15", notas: "Discos de corte y pulidoras" },
  { id: "4", folio: "OC-2026-00031", proveedor: "Canteras Nacional", estatus: "aprobada", total: 156200, items: 4, creadoPor: "Laura Castro", aprobadoPor: "Andrée Hossfeldt", fecha: "2026-03-14", notas: "Pedido mensual de láminas" },
  { id: "5", folio: "OC-2026-00030", proveedor: "Química del Caribe", estatus: "recibida", total: 8750, items: 3, creadoPor: "Laura Castro", aprobadoPor: "Andrée Hossfeldt", fecha: "2026-03-12", notas: "Resinas y pegamentos" },
  { id: "6", folio: "OC-2026-00029", proveedor: "Mármoles del Sureste", estatus: "recibida", total: 120000, items: 6, creadoPor: "Laura Castro", aprobadoPor: "Andrée Hossfeldt", fecha: "2026-03-10", notas: "Láminas para Residencial Las Palmas" },
  { id: "7", folio: "OC-2026-00028", proveedor: "Herramientas ProCut", estatus: "cancelada", total: 18500, items: 2, creadoPor: "Laura Castro", aprobadoPor: null, fecha: "2026-03-08", notas: "Duplicada - cancelar" },
  { id: "8", folio: "OC-2026-00027", proveedor: "Transportes García", estatus: "recibida", total: 5600, items: 1, creadoPor: "Laura Castro", aprobadoPor: "Andrée Hossfeldt", fecha: "2026-03-05", notas: "Combustible para flota" },
]

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pendiente: { label: "Pendiente", color: "bg-amber-100 text-amber-700", icon: Clock },
  aprobada: { label: "Aprobada", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  recibida: { label: "Recibida", color: "bg-emerald-100 text-emerald-700", icon: Truck },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-700", icon: XCircle },
}

const summaryCards = [
  { label: "Pendientes", value: "1", icon: Clock, color: "text-amber-600 bg-amber-50" },
  { label: "Aprobadas", value: "2", icon: CheckCircle2, color: "text-blue-600 bg-blue-50" },
  { label: "Total Mes", value: "$450,850", icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
  { label: "Proveedores", value: "5", icon: ShoppingCart, color: "text-purple-600 bg-purple-50" },
]

function formatMoney(n: number) {
  return "$" + n.toLocaleString("es-MX")
}

export default function ComprasPage() {
  const [filterEstatus, setFilterEstatus] = useState<string>("todos")
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = ordenes.filter((o) => {
    if (filterEstatus !== "todos" && o.estatus !== filterEstatus) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      return (
        o.folio.toLowerCase().includes(q) ||
        o.proveedor.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Órdenes de Compra</h1>
          <p className="text-sm text-[#7A6D5A]">Gestión de compras y proveedores</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#1E1A14] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2A2520]">
          <Plus className="h-4 w-4" />
          Nueva Orden
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
            placeholder="Buscar folio o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-[#E0DBD1] bg-white pl-9 pr-4 text-sm text-[#1E1A14] placeholder:text-[#7A6D5A] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#E0DBD1] bg-white p-1">
          {["todos", "pendiente", "aprobada", "recibida", "cancelada"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterEstatus(status)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterEstatus === status
                  ? "bg-[#1E1A14] text-white"
                  : "text-[#7A6D5A] hover:bg-[#F0EDE8]"
              }`}
            >
              {status === "todos" ? "Todos" : status.charAt(0).toUpperCase() + status.slice(1)}
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
                <th className="px-5 py-3 font-medium">Folio</th>
                <th className="px-5 py-3 font-medium">Proveedor</th>
                <th className="px-5 py-3 font-medium">Artículos</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Estatus</th>
                <th className="px-5 py-3 font-medium">Creado por</th>
                <th className="px-5 py-3 font-medium">Aprobado por</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((orden) => {
                const sc = statusConfig[orden.estatus]
                const StatusIcon = sc.icon
                return (
                  <tr key={orden.id} className="border-b border-[#F0EDE8] hover:bg-[#FAF9F7] transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-semibold text-[#1E1A14]">{orden.folio}</span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#1E1A14]">{orden.proveedor}</p>
                      <p className="text-xs text-[#7A6D5A] truncate max-w-[200px]">{orden.notas}</p>
                    </td>
                    <td className="px-5 py-3 text-center text-[#1E1A14]">{orden.items}</td>
                    <td className="px-5 py-3 font-semibold text-[#1E1A14]">{formatMoney(orden.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#7A6D5A]">{orden.creadoPor}</td>
                    <td className="px-5 py-3 text-[#7A6D5A]">{orden.aprobadoPor ?? "—"}</td>
                    <td className="px-5 py-3 text-[#7A6D5A] whitespace-nowrap">{orden.fecha}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button className="rounded-md p-1.5 text-[#7A6D5A] hover:bg-[#F0EDE8]" title="Ver detalle">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-md p-1.5 text-[#7A6D5A] hover:bg-[#F0EDE8]" title="Descargar PDF">
                          <FileText className="h-4 w-4" />
                        </button>
                        <button className="rounded-md p-1.5 text-[#7A6D5A] hover:bg-[#F0EDE8]" title="Más opciones">
                          <MoreHorizontal className="h-4 w-4" />
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
          <p className="text-xs text-[#7A6D5A]">Mostrando {filtered.length} de {ordenes.length} órdenes</p>
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
