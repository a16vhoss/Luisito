"use client"

import { useState } from "react"
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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

const registrosAsistencia: AttendanceRecord[] = [
  // ── Viernes 20 de marzo 2026 (hoy) ──
  { id: "1", empleado: "Roberto Méndez Solís", role: "jefe_taller", fecha: "2026-03-20", horaEntrada: "06:50", horaSalida: null, tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "2", empleado: "Miguel Ángel Tun Canul", role: "marmolero", fecha: "2026-03-20", horaEntrada: "07:00", horaSalida: null, tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "3", empleado: "José Luis Chi Pech", role: "marmolero", fecha: "2026-03-20", horaEntrada: "07:12", horaSalida: null, tipo: "retardo", registradoEn: "planta", obraAsignada: null },
  { id: "4", empleado: "Ricardo Alejandro May Uc", role: "marmolero", fecha: "2026-03-20", horaEntrada: "07:18", horaSalida: null, tipo: "retardo", registradoEn: "planta", obraAsignada: null },
  { id: "5", empleado: "Luis Enrique Balam Pool", role: "marmolero", fecha: "2026-03-20", horaEntrada: "07:00", horaSalida: null, tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "6", empleado: "Armando Nah Dzib", role: "marmolero", fecha: "2026-03-20", horaEntrada: "06:58", horaSalida: null, tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "7", empleado: "Jorge Iván Caamal Ku", role: "marmolero", fecha: "2026-03-20", horaEntrada: "07:00", horaSalida: null, tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "8", empleado: "Fernando Euán Couoh", role: "marmolero", fecha: "2026-03-20", horaEntrada: null, horaSalida: null, tipo: "falta", registradoEn: "planta", obraAsignada: null },
  { id: "9", empleado: "Juan Carlos Canul May", role: "chofer", fecha: "2026-03-20", horaEntrada: "06:30", horaSalida: null, tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "10", empleado: "Pedro Antonio Pech Dzul", role: "chofer", fecha: "2026-03-20", horaEntrada: "06:40", horaSalida: null, tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "11", empleado: "Ernesto Pool Canché", role: "chofer", fecha: "2026-03-20", horaEntrada: "06:35", horaSalida: null, tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "12", empleado: "Marco Antonio Dzib Ek", role: "chofer", fecha: "2026-03-20", horaEntrada: "06:45", horaSalida: null, tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "13", empleado: "Wilberth Chan Mis", role: "chofer", fecha: "2026-03-20", horaEntrada: "06:42", horaSalida: null, tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "14", empleado: "Gaspar Tuyub Noh", role: "chofer", fecha: "2026-03-20", horaEntrada: "06:38", horaSalida: null, tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "15", empleado: "Ángel Hau Cauich", role: "chofer", fecha: "2026-03-20", horaEntrada: "06:45", horaSalida: null, tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "16", empleado: "Carlos Herrera Góngora", role: "residente", fecha: "2026-03-20", horaEntrada: "07:30", horaSalida: null, tipo: "normal", registradoEn: "obra", obraAsignada: "Residencia Las Nubes" },
  { id: "17", empleado: "Fernando López Cetina", role: "residente", fecha: "2026-03-20", horaEntrada: "07:45", horaSalida: null, tipo: "normal", registradoEn: "obra", obraAsignada: "Hotel Regency Cancún" },
  { id: "18", empleado: "Carlos Alberto Pérez Novelo", role: "residente", fecha: "2026-03-20", horaEntrada: "07:15", horaSalida: null, tipo: "normal", registradoEn: "obra", obraAsignada: "Torre Corporate VII" },
  // ── Jueves 19 de marzo 2026 (ayer) ──
  { id: "19", empleado: "Roberto Méndez Solís", role: "jefe_taller", fecha: "2026-03-19", horaEntrada: "06:48", horaSalida: "16:30", tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "20", empleado: "Miguel Ángel Tun Canul", role: "marmolero", fecha: "2026-03-19", horaEntrada: "07:00", horaSalida: "16:00", tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "21", empleado: "José Luis Chi Pech", role: "marmolero", fecha: "2026-03-19", horaEntrada: "07:00", horaSalida: "16:00", tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "22", empleado: "Ricardo Alejandro May Uc", role: "marmolero", fecha: "2026-03-19", horaEntrada: "07:22", horaSalida: "16:00", tipo: "retardo", registradoEn: "planta", obraAsignada: null },
  { id: "23", empleado: "Luis Enrique Balam Pool", role: "marmolero", fecha: "2026-03-19", horaEntrada: "07:00", horaSalida: "16:00", tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "24", empleado: "Armando Nah Dzib", role: "marmolero", fecha: "2026-03-19", horaEntrada: "07:01", horaSalida: "16:00", tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "25", empleado: "Jorge Iván Caamal Ku", role: "marmolero", fecha: "2026-03-19", horaEntrada: "06:58", horaSalida: "16:00", tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "26", empleado: "Fernando Euán Couoh", role: "marmolero", fecha: "2026-03-19", horaEntrada: "07:00", horaSalida: "16:00", tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "27", empleado: "Juan Carlos Canul May", role: "chofer", fecha: "2026-03-19", horaEntrada: "06:30", horaSalida: "17:00", tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "28", empleado: "Pedro Antonio Pech Dzul", role: "chofer", fecha: "2026-03-19", horaEntrada: "06:35", horaSalida: "17:00", tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "29", empleado: "Ernesto Pool Canché", role: "chofer", fecha: "2026-03-19", horaEntrada: "06:40", horaSalida: "16:30", tipo: "normal", registradoEn: "planta", obraAsignada: null },
  { id: "30", empleado: "Carlos Herrera Góngora", role: "residente", fecha: "2026-03-19", horaEntrada: "07:20", horaSalida: "17:30", tipo: "normal", registradoEn: "obra", obraAsignada: "Residencia Las Nubes" },
  { id: "31", empleado: "Carlos Alberto Pérez Novelo", role: "residente", fecha: "2026-03-19", horaEntrada: "07:10", horaSalida: "17:00", tipo: "normal", registradoEn: "obra", obraAsignada: "Torre Corporate VII" },
  { id: "32", empleado: "Fernando López Cetina", role: "residente", fecha: "2026-03-19", horaEntrada: null, horaSalida: null, tipo: "permiso", registradoEn: "obra", obraAsignada: "Hotel Regency Cancún" },
]

// Resumen semanal
const resumenSemanal = [
  { dia: "Lun 16", normal: 16, retardo: 1, falta: 0, permiso: 1 },
  { dia: "Mar 17", normal: 15, retardo: 2, falta: 1, permiso: 0 },
  { dia: "Mié 18", normal: 16, retardo: 1, falta: 0, permiso: 1 },
  { dia: "Jue 19", normal: 14, retardo: 1, falta: 0, permiso: 1 },
  { dia: "Vie 20", normal: 14, retardo: 2, falta: 1, permiso: 0 },
]

export default function AsistenciaPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("todos")
  const [selectedDate, setSelectedDate] = useState("2026-03-20")

  const filtered = registrosAsistencia.filter((a) => {
    if (a.fecha !== selectedDate) return false
    if (filterTipo !== "todos" && a.tipo !== filterTipo) return false
    if (searchTerm && !a.empleado.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const todayStats = {
    total: registrosAsistencia.filter((a) => a.fecha === selectedDate).length,
    normal: registrosAsistencia.filter((a) => a.fecha === selectedDate && a.tipo === "normal").length,
    retardo: registrosAsistencia.filter((a) => a.fecha === selectedDate && a.tipo === "retardo").length,
    falta: registrosAsistencia.filter((a) => a.fecha === selectedDate && a.tipo === "falta").length,
    permiso: registrosAsistencia.filter((a) => a.fecha === selectedDate && a.tipo === "permiso").length,
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
            <button className="rounded-md p-1 text-[#7A6D5A] hover:bg-[#F0EDE8]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#1E1A14]">Viernes</p>
              <p className="text-2xl font-bold text-[#D4A843]">20</p>
              <p className="text-xs text-[#7A6D5A]">Marzo 2026</p>
            </div>
            <button className="rounded-md p-1 text-[#7A6D5A] hover:bg-[#F0EDE8]">
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
                      <div className="bg-emerald-400" style={{ height: `${(day.normal / 18) * maxH}px` }} />
                      <div className="bg-amber-400" style={{ height: `${(day.retardo / 18) * maxH}px` }} />
                      <div className="bg-red-400" style={{ height: `${(day.falta / 18) * maxH}px` }} />
                      <div className="bg-blue-400" style={{ height: `${(day.permiso / 18) * maxH}px` }} />
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
              {filtered.map((record) => {
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
              })}
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
