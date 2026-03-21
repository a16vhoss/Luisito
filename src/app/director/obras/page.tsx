"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Search,
  ArrowUpRight,
  MapPin,
  Calendar,
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function ObrasPage() {
  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("Todas")
  const [searchTerm, setSearchTerm] = useState("")

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

  const filteredObras = obras.filter((o) => {
    if (filter === "Activas" && o.estatus !== "activa") return false
    if (filter === "Pausadas" && o.estatus !== "pausada") return false
    if (filter === "Completadas" && o.estatus !== "completada") return false
    if (filter === "Canceladas" && o.estatus !== "cancelada") return false
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Obras</h1>
          <p className="mt-1 text-sm text-[#7A6D5A]">
            {obras.length} obras registradas &bull; {totalActivas} activas
          </p>
        </div>
        <Link href="/director/obras/nueva">
          <Button className="gap-2 bg-[#D4A843] text-white hover:bg-[#C49A3A]">
            <Plus className="h-4 w-4" />
            Nueva Obra
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Obras", filterKey: "Todas", value: obras.length, dot: undefined },
          { label: "Activas", filterKey: "Activas", value: totalActivas, dot: "#22C55E" },
          { label: "Pausadas", filterKey: "Pausadas", value: totalPausadas, dot: "#F59E0B" },
          { label: "Completadas", filterKey: "Completadas", value: totalCompletadas, dot: "#3B82F6" },
        ].map((s) => (
          <Card
            key={s.label}
            className={`cursor-pointer border transition-shadow hover:shadow-md ${
              filter === s.filterKey ? "ring-2 ring-[#D4A843]" : ""
            }`}
            onClick={() => setFilter(s.filterKey)}
          >
            <CardContent className="flex items-center gap-3 p-4">
              {s.dot && (
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: s.dot }}
                />
              )}
              <div>
                <p className="text-2xl font-bold text-[#1E1A14]">{s.value}</p>
                <p className="text-xs text-[#7A6D5A]">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Listado de Obras</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7A6D5A]" />
              <input
                type="text"
                placeholder="Buscar obra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 w-56 rounded-lg border border-[#E0DBD1] bg-[#FAF9F7] pl-8 pr-3 text-xs focus:border-[#D4A843] focus:outline-none"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Obra</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Ubicaci&oacute;n</TableHead>
                <TableHead className="text-right">Contrato</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Entrega est.</TableHead>
                <TableHead>Estatus</TableHead>
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredObras.map((obra) => (
                <TableRow key={obra.id} className="group">
                  <TableCell>
                    <Link
                      href={`/director/obras/${obra.id}`}
                      className="font-medium text-[#1E1A14] hover:text-[#D4A843]"
                    >
                      {obra.nombre}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{obra.cliente}</TableCell>
                  <TableCell>
                    {obra.ubicacion ? (
                      <div className="flex items-center gap-1 text-sm text-[#7A6D5A]">
                        <MapPin className="h-3 w-3" />
                        {obra.ubicacion}
                      </div>
                    ) : (
                      <span className="text-[#7A6D5A]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatCurrency(obra.contrato_total)}
                  </TableCell>
                  <TableCell className="text-sm text-[#7A6D5A] whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(obra.fecha_inicio)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#7A6D5A] whitespace-nowrap">
                    {formatDate(obra.fecha_fin_estimada)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[obra.estatus] + " text-[10px]"}>
                      {statusLabels[obra.estatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/director/obras/${obra.id}`}>
                      <ArrowUpRight className="h-4 w-4 text-[#7A6D5A] opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {filteredObras.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-[#7A6D5A]">
                    {obras.length === 0
                      ? "No hay obras registradas. Crea tu primera obra."
                      : "No se encontraron obras con los filtros seleccionados."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
