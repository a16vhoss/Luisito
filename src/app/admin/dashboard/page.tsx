"use client"

import { useState, useEffect } from "react"
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Warehouse,
  Clock,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// ── Estilos de estatus ──
const statusColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  aprobada: "bg-blue-100 text-blue-700",
  recibida: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-red-100 text-red-700",
}

type SummaryCard = {
  title: string
  value: string
  icon: typeof Package
  color: string
}

type StockAlert = {
  material: string
  stock: number
  minimo: number
  unidad: string
}

type RecentOrder = {
  folio: string
  proveedor: string
  total: string
  estatus: string
  fecha: string
}

type RecentMovement = {
  material: string
  tipo: string
  cantidad: number
  responsable: string
  fecha: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }) +
    " " +
    d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([])

  useEffect(() => {
    async function fetchDashboard() {
      const supabase = createClient()

      const [materialesRes, ordenesRes, movimientosRes] = await Promise.all([
        supabase.from("materiales").select("*").eq("activo", true),
        supabase
          .from("ordenes_compra")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("movimientos_almacen")
          .select("*, material:materiales(nombre), responsable:users(nombre)")
          .order("created_at", { ascending: false })
          .limit(4),
      ])

      const materiales = materialesRes.data ?? []
      const ordenes = ordenesRes.data ?? []
      const movimientos = movimientosRes.data ?? []

      // Summary cards
      const totalMateriales = materiales.length
      const valorInventario = materiales.reduce(
        (sum: number, m: any) => sum + (m.stock_actual ?? 0) * (m.precio_referencia ?? 0),
        0
      )
      const ordenesPendientes = ordenes.filter((o: any) => o.estatus === "pendiente").length
      const alertasStock = materiales.filter(
        (m: any) => (m.stock_actual ?? 0) < (m.stock_minimo ?? 0)
      )

      setSummaryCards([
        {
          title: "Total Materiales",
          value: totalMateriales.toLocaleString("es-MX"),
          icon: Package,
          color: "bg-blue-50 text-blue-600",
        },
        {
          title: "Valor en Inventario",
          value: formatCurrency(valorInventario),
          icon: Warehouse,
          color: "bg-emerald-50 text-emerald-600",
        },
        {
          title: "Órdenes Pendientes",
          value: ordenesPendientes.toString(),
          icon: ShoppingCart,
          color: "bg-amber-50 text-amber-600",
        },
        {
          title: "Alertas de Stock",
          value: alertasStock.length.toString(),
          icon: AlertTriangle,
          color: "bg-red-50 text-red-600",
        },
      ])

      // Stock alerts
      setStockAlerts(
        alertasStock.map((m: any) => ({
          material: m.nombre ?? "Sin nombre",
          stock: m.stock_actual ?? 0,
          minimo: m.stock_minimo ?? 0,
          unidad: m.unidad_medida ?? "piezas",
        }))
      )

      // Recent orders
      setRecentOrders(
        ordenes.map((o: any) => ({
          folio: o.folio ?? "—",
          proveedor: o.proveedor ?? "—",
          total: formatCurrency(o.total ?? 0),
          estatus: o.estatus ?? "pendiente",
          fecha: o.created_at ? formatDate(o.created_at) : "—",
        }))
      )

      // Recent movements
      setRecentMovements(
        movimientos.map((m: any) => ({
          material: m.material?.nombre ?? "Sin nombre",
          tipo: m.tipo ?? "entrada",
          cantidad: m.cantidad ?? 0,
          responsable: m.responsable?.nombre ?? "—",
          fecha: m.created_at ? formatDateShort(m.created_at) : "—",
        }))
      )

      setLoading(false)
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4A843]" />
      </div>
    )
  }

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
              <span className="text-[#7A6D5A]">—</span>
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
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-[#7A6D5A]">
                      No hay órdenes recientes
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.folio} className="border-b border-[#F0EDE8] hover:bg-[#FAF9F7]">
                      <td className="px-5 py-3 font-mono text-xs font-medium text-[#1E1A14]">{order.folio}</td>
                      <td className="px-5 py-3 text-[#1E1A14]">{order.proveedor}</td>
                      <td className="px-5 py-3 font-medium text-[#1E1A14]">{order.total}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.estatus] ?? ""}`}>
                          {order.estatus.charAt(0).toUpperCase() + order.estatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#7A6D5A]">{order.fecha}</td>
                    </tr>
                  ))
                )}
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
            {stockAlerts.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#7A6D5A]">
                No hay alertas de stock
              </div>
            ) : (
              stockAlerts.map((alert, i) => (
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
              ))
            )}
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
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-[#7A6D5A]">
                    No hay movimientos recientes
                  </td>
                </tr>
              ) : (
                recentMovements.map((mov, i) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
