"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Filter,
  Download,
  AlertTriangle,
  Clock,
  UserX,
  CalendarX,
  TrendingUp,
  Eye,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

// ── Tipos ──
type FaltaRecord = {
  id: string
  empleado: string
  role: string
  tipo: "falta" | "retardo"
  fecha: string
  horaEntrada: string | null
  horaEsperada: string
  minutosRetardo: number | null
  justificado: boolean
  motivo: string | null
}

function calculateMinutesLate(entrada: string, esperada: string): number {
  const [eh, em] = entrada.split(":").map(Number)
  const [xh, xm] = esperada.split(":").map(Number)
  return (eh * 60 + em) - (xh * 60 + xm)
}

export default function FaltasPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("todos")
  const [filterPeriodo, setFilterPeriodo] = useState("mes")
  const [incidencias, setIncidencias] = useState<FaltaRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFaltas() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("asistencia")
        .select("*, usuario:users!usuario_id(nombre, role)")
        .in("tipo", ["falta", "retardo"])
        .order("fecha", { ascending: false })

      if (!error && data) {
        setIncidencias(data.map((a: any) => ({
          id: a.id,
          empleado: a.usuario?.nombre ?? "—",
          role: a.usuario?.role ?? "",
          tipo: a.tipo as "falta" | "retardo",
          fecha: a.fecha,
          horaEntrada: a.hora_entrada,
          horaEsperada: a.usuario?.role === "chofer" ? "06:30" : "07:00",
          minutosRetardo: a.hora_entrada ? calculateMinutesLate(a.hora_entrada, a.usuario?.role === "chofer" ? "06:30" : "07:00") : null,
          justificado: false, // No justification field in DB yet
          motivo: null,
        })))
      }
      setLoading(false)
    }
    fetchFaltas()
  }, [])

  // Compute ranking client-side from incidencias
  const rankingIncidencias = useMemo(() => {
    const map: Record<string, { nombre: string; faltas: number; retardos: number }> = {}
    for (const inc of incidencias) {
      if (!map[inc.empleado]) {
        map[inc.empleado] = { nombre: inc.empleado, faltas: 0, retardos: 0 }
      }
      if (inc.tipo === "falta") map[inc.empleado].faltas++
      else map[inc.empleado].retardos++
    }
    return Object.values(map)
      .map((e) => ({ ...e, total: e.faltas + e.retardos }))
      .sort((a, b) => b.total - a.total)
  }, [incidencias])

  const filtered = incidencias.filter((f) => {
    if (filterTipo !== "todos" && f.tipo !== filterTipo) return false
    if (searchTerm && !f.empleado.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const totalFaltas = incidencias.filter((f) => f.tipo === "falta").length
  const totalRetardos = incidencias.filter((f) => f.tipo === "retardo").length
  const sinJustificar = incidencias.filter((f) => !f.justificado).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4A843]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Faltas y Retardos</h1>
          <p className="text-sm text-[#7A6D5A]">Control de ausencias e incidencias de puntualidad</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterPeriodo}
            onChange={(e) => setFilterPeriodo(e.target.value)}
            className="h-9 rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none"
          >
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mes</option>
            <option value="quincena">Última Quincena</option>
          </select>
          <button className="inline-flex items-center gap-2 rounded-lg border border-[#E0DBD1] bg-white px-4 py-2 text-sm font-medium text-[#1E1A14] transition-colors hover:bg-[#F0EDE8]" onClick={() => toast({ title: "Exportando reporte...", description: "El archivo se descargará en breve." })}>
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2">
              <CalendarX className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Faltas</p>
              <p className="text-xl font-bold text-red-600">{totalFaltas}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Retardos</p>
              <p className="text-xl font-bold text-amber-600">{totalRetardos}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Sin Justificar</p>
              <p className="text-xl font-bold text-orange-600">{sinJustificar}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Total Incidencias</p>
              <p className="text-xl font-bold text-[#1E1A14]">{incidencias.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two columns: Table + Ranking */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6D5A]" />
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-lg border border-[#E0DBD1] bg-white pl-9 pr-4 text-sm text-[#1E1A14] placeholder:text-[#7A6D5A] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-[#E0DBD1] bg-white p-1">
              {[
                { key: "todos", label: "Todos" },
                { key: "falta", label: "Faltas" },
                { key: "retardo", label: "Retardos" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setFilterTipo(opt.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    filterTipo === opt.key
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
                    <th className="px-5 py-3 font-medium">Empleado</th>
                    <th className="px-5 py-3 font-medium">Tipo</th>
                    <th className="px-5 py-3 font-medium">Fecha</th>
                    <th className="px-5 py-3 font-medium">Detalle</th>
                    <th className="px-5 py-3 font-medium">Justificado</th>
                    <th className="px-5 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-[#7A6D5A]">
                        No se encontraron incidencias.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((record) => (
                      <tr key={record.id} className="border-b border-[#F0EDE8] hover:bg-[#FAF9F7] transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-medium text-[#1E1A14]">{record.empleado}</p>
                          <p className="text-xs text-[#7A6D5A] capitalize">{record.role.replace("_", " ")}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              record.tipo === "falta"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {record.tipo === "falta" ? (
                              <UserX className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {record.tipo === "falta" ? "Falta" : "Retardo"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[#7A6D5A] whitespace-nowrap">{record.fecha}</td>
                        <td className="px-5 py-3 text-[#7A6D5A]">
                          {record.tipo === "retardo" ? (
                            <span>
                              Llegó {record.horaEntrada} ({record.minutosRetardo} min tarde)
                            </span>
                          ) : (
                            <span>No se presentó</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {record.justificado ? (
                            <div>
                              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                Sí
                              </span>
                              {record.motivo && (
                                <p className="mt-0.5 text-xs text-[#7A6D5A]">{record.motivo}</p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <button className="rounded-md p-1.5 text-[#7A6D5A] hover:bg-[#F0EDE8]" title="Ver detalle">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-[#E0DBD1] px-5 py-3">
              <p className="text-xs text-[#7A6D5A]">
                {filtered.length} incidencias encontradas
              </p>
            </div>
          </div>
        </div>

        {/* Employee Ranking */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white">
          <div className="border-b border-[#E0DBD1] px-5 py-4">
            <h2 className="font-semibold text-[#1E1A14]">Ranking de Incidencias</h2>
            <p className="text-xs text-[#7A6D5A]">Empleados con más faltas/retardos</p>
          </div>
          <div className="divide-y divide-[#F0EDE8]">
            {rankingIncidencias.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#7A6D5A]">
                Sin datos de incidencias.
              </div>
            ) : (
              rankingIncidencias.map((emp, i) => (
                <div key={emp.nombre} className="flex items-center gap-3 px-5 py-4">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      i === 0
                        ? "bg-red-100 text-red-700"
                        : i === 1
                        ? "bg-amber-100 text-amber-700"
                        : "bg-[#F0EDE8] text-[#7A6D5A]"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[#1E1A14]">{emp.nombre}</p>
                    <div className="flex items-center gap-2 text-xs text-[#7A6D5A]">
                      <span className="text-red-600">{emp.faltas} faltas</span>
                      <span className="text-[#E0DBD1]">|</span>
                      <span className="text-amber-600">{emp.retardos} retardos</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#1E1A14]">{emp.total}</p>
                    <p className="text-[10px] text-[#7A6D5A]">total</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
