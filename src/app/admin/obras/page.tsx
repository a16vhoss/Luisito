"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  HardHat,
  MapPin,
  Calendar,
  ArrowUpRight,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Obra, ObraEstatus } from "@/types/database.types"

const statusLabels: Record<ObraEstatus, string> = {
  activa: "Activa",
  pausada: "Pausada",
  completada: "Completada",
  cancelada: "Cancelada",
}

const statusColors: Record<ObraEstatus, string> = {
  activa: "bg-emerald-100 text-emerald-700",
  pausada: "bg-amber-100 text-amber-700",
  completada: "bg-blue-100 text-blue-700",
  cancelada: "bg-red-100 text-red-700",
}

export default function AdminObrasPage() {
  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstatus, setFilterEstatus] = useState<string>("todos")

  useEffect(() => {
    async function fetchObras() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("obras")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setObras(data as Obra[])
      }
      setLoading(false)
    }
    fetchObras()
  }, [])

  const filtered = obras.filter((o) => {
    if (filterEstatus !== "todos" && o.estatus !== filterEstatus) return false
    if (
      searchTerm &&
      !o.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !o.cliente.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false
    return true
  })

  const totalActivas = obras.filter((o) => o.estatus === "activa").length
  const totalPausadas = obras.filter((o) => o.estatus === "pausada").length
  const totalCompletadas = obras.filter((o) => o.estatus === "completada").length

  function formatDate(iso: string | null) {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4A843]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Obras</h1>
          <p className="text-sm text-[#7A6D5A]">
            {obras.length} obras registradas &bull; {totalActivas} activas
          </p>
        </div>
        <Link
          href="/admin/obras/nueva"
          className="inline-flex items-center gap-2 rounded-lg bg-[#D4A843] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#C49A3A]"
        >
          <Plus className="h-4 w-4" />
          Nueva Obra
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total", value: obras.length, icon: HardHat, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
          { label: "Activas", value: totalActivas, icon: HardHat, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
          { label: "Pausadas", value: totalPausadas, icon: HardHat, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
          { label: "Completadas", value: totalCompletadas, icon: HardHat, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[#E0DBD1] bg-white p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg ${s.iconBg} p-2`}>
                <s.icon className={`h-4 w-4 ${s.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-[#7A6D5A]">{s.label}</p>
                <p className="text-xl font-bold text-[#1E1A14]">{s.value}</p>
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
            placeholder="Buscar por nombre o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-[#E0DBD1] bg-white pl-9 pr-4 text-sm text-[#1E1A14] placeholder:text-[#7A6D5A] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#E0DBD1] bg-white p-1">
          {[
            { key: "todos", label: "Todas" },
            { key: "activa", label: "Activas" },
            { key: "pausada", label: "Pausadas" },
            { key: "completada", label: "Completadas" },
            { key: "cancelada", label: "Canceladas" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilterEstatus(opt.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterEstatus === opt.key
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
                <th className="px-5 py-3 font-medium">Obra</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Ubicaci&oacute;n</th>
                <th className="px-5 py-3 font-medium">Contrato</th>
                <th className="px-5 py-3 font-medium">Inicio</th>
                <th className="px-5 py-3 font-medium">Entrega est.</th>
                <th className="px-5 py-3 font-medium">Estatus</th>
                <th className="px-5 py-3 w-[40px]" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((obra) => (
                <tr
                  key={obra.id}
                  className="group border-b border-[#F0EDE8] hover:bg-[#FAF9F7] transition-colors"
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#1E1A14]">{obra.nombre}</p>
                  </td>
                  <td className="px-5 py-3 text-[#7A6D5A]">{obra.cliente}</td>
                  <td className="px-5 py-3">
                    {obra.ubicacion ? (
                      <div className="flex items-center gap-1 text-sm text-[#7A6D5A]">
                        <MapPin className="h-3 w-3" />
                        {obra.ubicacion}
                      </div>
                    ) : (
                      <span className="text-[#7A6D5A]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium text-[#1E1A14]">
                    {formatCurrency(obra.contrato_total)}
                  </td>
                  <td className="px-5 py-3 text-[#7A6D5A] whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(obra.fecha_inicio)}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#7A6D5A] whitespace-nowrap">
                    {formatDate(obra.fecha_fin_estimada)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        statusColors[obra.estatus]
                      }`}
                    >
                      {statusLabels[obra.estatus]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/obras/${obra.id}`}>
                      <ArrowUpRight className="h-4 w-4 text-[#7A6D5A] opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-[#7A6D5A]">
                    {obras.length === 0
                      ? "No hay obras registradas. Crea tu primera obra."
                      : "No se encontraron obras con los filtros seleccionados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#E0DBD1] px-5 py-3">
          <p className="text-xs text-[#7A6D5A]">
            Mostrando {filtered.length} de {obras.length} obras
          </p>
        </div>
      </div>
    </div>
  )
}
