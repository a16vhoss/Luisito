"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Filter,
  Download,
  CalendarDays,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

// ── Datos ──
type AttendanceRecord = {
  id: string
  empleado: string
  role: string
  fecha: string
  horaEntrada: string | null
  horaSalida: string | null
  tipo: "normal" | "retardo" | "falta" | "permiso"
  registradoEn: "planta" | "obra"
  obraAsignada: string | null
}

const tipoConfig: Record<string, { label: string; color: string; icon: typeof UserCheck }> = {
  normal: { label: "Normal", color: "bg-emerald-100 text-emerald-700", icon: UserCheck },
  retardo: { label: "Retardo", color: "bg-amber-100 text-amber-700", icon: Clock },
  falta: { label: "Falta", color: "bg-red-100 text-red-700", icon: UserX },
  permiso: { label: "Permiso", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
}

const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
const diasCortos = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

export default function AsistenciaPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("todos")
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [registros, setRegistros] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [resumenSemanal, setResumenSemanal] = useState<{dia: string, normal: number, retardo: number, falta: number, permiso: number}[]>([])

  useEffect(() => {
    async function fetchAsistencia() {
      setLoading(true)
      const supabase = createClient()
      // Fetch attendance records with user info
      const { data, error } = await supabase
        .from("asistencia")
        .select("*, usuario:users!usuario_id(nombre, role)")
        .order("fecha", { ascending: false })

      if (!error && data) {
        const mapped = data.map((a: any) => ({
          id: a.id,
          empleado: a.usuario?.nombre ?? "—",
          role: a.usuario?.role ?? "",
          fecha: a.fecha,
          horaEntrada: a.hora_entrada,
          horaSalida: a.hora_salida,
          tipo: a.tipo,
          registradoEn: a.registrado_en,
          obraAsignada: null,
        }))
        setRegistros(mapped)

        // Compute resumen semanal: last 5 work days from today
        const workDays: string[] = []
        const d = new Date()
        while (workDays.length < 5) {
          const dow = d.getDay()
          if (dow !== 0 && dow !== 6) {
            workDays.push(d.toISOString().split("T")[0])
          }
          d.setDate(d.getDate() - 1)
        }
        workDays.reverse()

        const resumen = workDays.map((dateStr) => {
          const dateObj = new Date(dateStr + "T12:00:00")
          const dayLabel = diasCortos[dateObj.getDay()] + " " + dateObj.getDate()
          const dayRecords = mapped.filter((r: AttendanceRecord) => r.fecha === dateStr)
          return {
            dia: dayLabel,
            normal: dayRecords.filter((r: AttendanceRecord) => r.tipo === "normal").length,
            retardo: dayRecords.filter((r: AttendanceRecord) => r.tipo === "retardo").length,
            falta: dayRecords.filter((r: AttendanceRecord) => r.tipo === "falta").length,
            permiso: dayRecords.filter((r: AttendanceRecord) => r.tipo === "permiso").length,
          }
        })
        setResumenSemanal(resumen)
      }
      setLoading(false)
    }
    fetchAsistencia()
  }, [])

  const filtered = registros.filter((a) => {
    if (a.fecha !== selectedDate) return false
    if (filterTipo !== "todos" && a.tipo !== filterTipo) return false
    if (searchTerm && !a.empleado.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const todayStats = {
    total: registros.filter((a) => a.fecha === selectedDate).length,
    normal: registros.filter((a) => a.fecha === selectedDate && a.tipo === "normal").length,
    retardo: registros.filter((a) => a.fecha === selectedDate && a.tipo === "retardo").length,
    falta: registros.filter((a) => a.fecha === selectedDate && a.tipo === "falta").length,
    permiso: registros.filter((a) => a.fecha === selectedDate && a.tipo === "permiso").length,
  }

  // Dynamic date display
  const selectedDateObj = new Date(selectedDate + "T12:00:00")
  const selectedDayName = diasSemana[selectedDateObj.getDay()]
  const selectedDayNum = selectedDateObj.getDate()
  const selectedMonthName = meses[selectedDateObj.getMonth()]
  const selectedYear = selectedDateObj.getFullYear()

  function navigateDate(offset: number) {
    const d = new Date(selectedDate + "T12:00:00")
    d.setDate(d.getDate() + offset)
    setSelectedDate(d.toISOString().split("T")[0])
  }

  // Max for bar chart normalization
  const maxTotal = useMemo(() => {
    if (resumenSemanal.length === 0) return 18
    const m = Math.max(...resumenSemanal.map((d) => d.normal + d.retardo + d.falta + d.permiso))
    return m > 0 ? m : 18
  }, [resumenSemanal])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4A843]" />
        <span className="ml-3 text-sm text-[#7A6D5A]">Cargando asistencia...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Asistencia</h1>
          <p className="text-sm text-[#7A6D5A]">Reporte de asistencia por persona, semana y mes</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-[#E0DBD1] bg-white px-4 py-2.5 text-sm font-medium text-[#1E1A14] transition-colors hover:bg-[#F0EDE8]" onClick={() => toast({ title: "Exportando reporte...", description: "El archivo se descargará en breve." })}>
          <Download className="h-4 w-4" />
          Exportar Reporte
        </button>
      </div>

      {/* Date Navigator + Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Date Nav */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigateDate(-1)} className="rounded-md p-1 text-[#7A6D5A] hover:bg-[#F0EDE8]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#1E1A14]">{selectedDayName}</p>
              <p className="text-2xl font-bold text-[#D4A843]">{selectedDayNum}</p>
              <p className="text-xs text-[#7A6D5A]">{selectedMonthName} {selectedYear}</p>
            </div>
            <button onClick={() => navigateDate(1)} className="rounded-md p-1 text-[#7A6D5A] hover:bg-[#F0EDE8]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-[#E0DBD1] px-3 py-1.5 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-50 p-2"><Users className="h-4 w-4 text-blue-600" /></div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Total Registros</p>
              <p className="text-xl font-bold text-[#1E1A14]">{todayStats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-50 p-2"><UserCheck className="h-4 w-4 text-emerald-600" /></div>
            <div>
              <p className="text-xs text-[#7A6D5A]">A Tiempo</p>
              <p className="text-xl font-bold text-emerald-600">{todayStats.normal}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-50 p-2"><Clock className="h-4 w-4 text-amber-600" /></div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Retardos</p>
              <p className="text-xl font-bold text-amber-600">{todayStats.retardo}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-red-50 p-2"><UserX className="h-4 w-4 text-red-600" /></div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Faltas</p>
              <p className="text-xl font-bold text-red-600">{todayStats.falta}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Bar Chart (simple visual) */}
      <div className="rounded-xl border border-[#E0DBD1] bg-white p-5">
        <h2 className="mb-4 font-semibold text-[#1E1A14]">Resumen Semanal</h2>
        <div className="flex items-end gap-4">
          {resumenSemanal.map((day) => {
            const total = day.normal + day.retardo + day.falta + day.permiso
            const maxH = 80
            return (
              <div key={day.dia} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-col items-center" style={{ height: maxH }}>
                  {total > 0 ? (
                    <div className="flex w-8 flex-col-reverse rounded-t-md overflow-hidden" style={{ height: maxH }}>
                      <div className="bg-emerald-400" style={{ height: `${(day.normal / maxTotal) * maxH}px` }} />
                      <div className="bg-amber-400" style={{ height: `${(day.retardo / maxTotal) * maxH}px` }} />
                      <div className="bg-red-400" style={{ height: `${(day.falta / maxTotal) * maxH}px` }} />
                      <div className="bg-blue-400" style={{ height: `${(day.permiso / maxTotal) * maxH}px` }} />
                    </div>
                  ) : (
                    <div className="flex h-full items-end">
                      <div className="h-1 w-8 rounded bg-[#E0DBD1]" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-[#7A6D5A]">{day.dia}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-[#7A6D5A]">
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Normal</span>
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Retardo</span>
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> Falta</span>
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-blue-400" /> Permiso</span>
        </div>
      </div>

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
          {["todos", "normal", "retardo", "falta", "permiso"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFilterTipo(tipo)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterTipo === tipo
                  ? "bg-[#1E1A14] text-white"
                  : "text-[#7A6D5A] hover:bg-[#F0EDE8]"
              }`}
            >
              {tipo === "todos" ? "Todos" : tipoConfig[tipo]?.label ?? tipo}
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
                <th className="px-5 py-3 font-medium">Rol</th>
                <th className="px-5 py-3 font-medium">Hora Entrada</th>
                <th className="px-5 py-3 font-medium">Hora Salida</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Registrado En</th>
                <th className="px-5 py-3 font-medium">Obra</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#7A6D5A]">
                    Sin registros para esta fecha
                  </td>
                </tr>
              ) : (
                filtered.map((record) => {
                  const tc = tipoConfig[record.tipo]
                  const TipoIcon = tc.icon
                  return (
                    <tr key={record.id} className="border-b border-[#F0EDE8] hover:bg-[#FAF9F7] transition-colors">
                      <td className="px-5 py-3 font-medium text-[#1E1A14]">{record.empleado}</td>
                      <td className="px-5 py-3 text-[#7A6D5A] capitalize">{record.role.replace("_", " ")}</td>
                      <td className="px-5 py-3">
                        {record.horaEntrada ? (
                          <span className="inline-flex items-center gap-1 text-[#1E1A14]">
                            <Clock className="h-3 w-3 text-[#7A6D5A]" />
                            {record.horaEntrada}
                          </span>
                        ) : (
                          <span className="text-[#7A6D5A]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {record.horaSalida ? (
                          <span className="inline-flex items-center gap-1 text-[#1E1A14]">
                            <Clock className="h-3 w-3 text-[#7A6D5A]" />
                            {record.horaSalida}
                          </span>
                        ) : (
                          <span className="text-xs text-[#7A6D5A]">En turno</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tc.color}`}>
                          <TipoIcon className="h-3 w-3" />
                          {tc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          record.registradoEn === "planta"
                            ? "bg-stone-100 text-stone-700"
                            : "bg-indigo-100 text-indigo-700"
                        }`}>
                          {record.registradoEn === "planta" ? "Planta" : "Obra"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#7A6D5A]">{record.obraAsignada ?? "—"}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#E0DBD1] px-5 py-3">
          <p className="text-xs text-[#7A6D5A]">
            {filtered.length} registros para {selectedDate}
          </p>
        </div>
      </div>
    </div>
  )
}
