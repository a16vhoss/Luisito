"use client"

import {
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Warehouse,
  Clock,
} from "lucide-react"

// ── Datos ──
const summaryCards = [
  {
    title: "Total Materiales",
    value: "1,248",
    change: "+12%",
    trend: "up" as const,
    icon: Package,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Valor en Inventario",
    value: "$2,450,800",
    change: "+5.3%",
    trend: "up" as const,
    icon: Warehouse,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Órdenes Pendientes",
    value: "7",
    change: "-2",
    trend: "down" as const,
    icon: ShoppingCart,
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Alertas de Stock",
    value: "4",
    change: "+1",
    trend: "up" as const,
    icon: AlertTriangle,
    color: "bg-red-50 text-red-600",
  },
]

const recentOrders = [
  { folio: "OC-2026-00034", proveedor: "Mármoles del Sureste", total: "$84,500", estatus: "pendiente", fecha: "18 Mar 2026" },
  { folio: "OC-2026-00033", proveedor: "Insumos Industriales MX", total: "$12,300", estatus: "aprobada", fecha: "17 Mar 2026" },
  { folio: "OC-2026-00032", proveedor: "Herramientas ProCut", total: "$45,000", estatus: "recibida", fecha: "15 Mar 2026" },
  { folio: "OC-2026-00031", proveedor: "Canteras Nacional", total: "$156,200", estatus: "aprobada", fecha: "14 Mar 2026" },
  { folio: "OC-2026-00030", proveedor: "Química del Caribe", total: "$8,750", estatus: "recibida", fecha: "12 Mar 2026" },
]

const stockAlerts = [
  { material: "Lámina Crema Marfil 2cm", stock: 3, minimo: 10, unidad: "piezas" },
  { material: "Disco Diamante 14\"", stock: 2, minimo: 5, unidad: "piezas" },
  { material: "Resina Epóxica Transparente", stock: 4, minimo: 8, unidad: "litros" },
  { material: "Lija de Agua #400", stock: 15, minimo: 30, unidad: "piezas" },
]

const recentMovements = [
  { material: "Mármol Blanco Carrara", tipo: "entrada", cantidad: 5, responsable: "Laura Castro", fecha: "19 Mar 10:30" },
  { material: "Disco Diamante 10\"", tipo: "salida", cantidad: 3, responsable: "Laura Castro", fecha: "19 Mar 09:15" },
  { material: "Pegamento Piedra Natural", tipo: "entrada", cantidad: 20, responsable: "Laura Castro", fecha: "18 Mar 16:00" },
  { material: "Lámina Travertino", tipo: "salida", cantidad: 2, responsable: "Laura Castro", fecha: "18 Mar 14:20" },
]

const statusColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  aprobada: "bg-blue-100 text-blue-700",
  recibida: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-red-100 text-red-700",
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E1A14]">Dashboard Administración</h1>
        <p className="text-sm text-[#7A6D5A]">Resumen de inventario, compras y movimientos</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-[#E0DBD1] bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#7A6D5A]">{card.title}</p>
                <p className="mt-1 text-2xl font-bold text-[#1E1A14]">{card.value}</p>
              </div>
              <div className={`rounded-lg p-2 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs">
              {card.trend === "up" ? (
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={card.trend === "up" ? "text-emerald-600" : "text-red-600"}>
                {card.change}
              </span>
              <span className="text-[#7A6D5A]">vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns: Recent Orders + Stock Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-xl border border-[#E0DBD1] bg-white">
          <div className="flex items-center justify-between border-b border-[#E0DBD1] px-5 py-4">
            <h2 className="font-semibold text-[#1E1A14]">Órdenes de Compra Recientes</h2>
            <a href="/compras" className="text-xs font-medium text-[#D4A843] hover:underline">
              Ver todas
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E0DBD1] text-left text-xs text-[#7A6D5A]">
                  <th className="px-5 py-3 font-medium">Folio</th>
                  <th className="px-5 py-3 font-medium">Proveedor</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Estatus</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.folio} className="border-b border-[#F0EDE8] hover:bg-[#FAF9F7]">
                    <td className="px-5 py-3 font-mono text-xs font-medium text-[#1E1A14]">{order.folio}</td>
                    <td className="px-5 py-3 text-[#1E1A14]">{order.proveedor}</td>
                    <td className="px-5 py-3 font-medium text-[#1E1A14]">{order.total}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.estatus]}`}>
                        {order.estatus.charAt(0).toUpperCase() + order.estatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#7A6D5A]">{order.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white">
          <div className="flex items-center justify-between border-b border-[#E0DBD1] px-5 py-4">
            <h2 className="font-semibold text-[#1E1A14]">Alertas de Stock</h2>
            <a href="/inventario" className="text-xs font-medium text-[#D4A843] hover:underline">
              Ver inventario
            </a>
          </div>
          <div className="divide-y divide-[#F0EDE8]">
            {stockAlerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <div className="mt-0.5 rounded-lg bg-red-50 p-1.5">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[#1E1A14]">{alert.material}</p>
                  <p className="text-xs text-[#7A6D5A]">
                    Stock: <span className="font-semibold text-red-600">{alert.stock}</span> / Mín: {alert.minimo} {alert.unidad}
                  </p>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#F0EDE8]">
                    <div
                      className="h-1.5 rounded-full bg-red-400"
                      style={{ width: `${Math.min((alert.stock / alert.minimo) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="rounded-xl border border-[#E0DBD1] bg-white">
        <div className="flex items-center justify-between border-b border-[#E0DBD1] px-5 py-4">
          <h2 className="font-semibold text-[#1E1A14]">Movimientos Recientes</h2>
          <a href="/almacen" className="text-xs font-medium text-[#D4A843] hover:underline">
            Ver todos
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E0DBD1] text-left text-xs text-[#7A6D5A]">
                <th className="px-5 py-3 font-medium">Material</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Cantidad</th>
                <th className="px-5 py-3 font-medium">Responsable</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentMovements.map((mov, i) => (
                <tr key={i} className="border-b border-[#F0EDE8] hover:bg-[#FAF9F7]">
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
                        <ArrowUpRight className="h-3 w-3" />
                      )}
                      {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#1E1A14]">{mov.cantidad}</td>
                  <td className="px-5 py-3 text-[#7A6D5A]">{mov.responsable}</td>
                  <td className="px-5 py-3 text-[#7A6D5A]">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {mov.fecha}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
