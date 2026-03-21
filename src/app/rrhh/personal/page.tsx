"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Filter,
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Eye,
  Edit,
  MoreHorizontal,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

// ── Datos ──
type Employee = {
  id: string
  nombre: string
  email: string
  telefono: string
  role: string
  activo: boolean
  fotoUrl: string | null
  fechaIngreso: string
  obraAsignada: string | null
}

const roleLabels: Record<string, string> = {
  director: "Director",
  admin: "Administración",
  rrhh: "RRHH",
  jefe_taller: "Jefe de Taller",
  residente: "Residente",
  chofer: "Chofer",
  marmolero: "Marmolero",
}

const roleColors: Record<string, string> = {
  director: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  rrhh: "bg-pink-100 text-pink-700",
  jefe_taller: "bg-amber-100 text-amber-700",
  residente: "bg-emerald-100 text-emerald-700",
  chofer: "bg-cyan-100 text-cyan-700",
  marmolero: "bg-stone-100 text-stone-700",
}


function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default function PersonalPage() {
  const { toast } = useToast()
  const [empleados, setEmpleados] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("todos")
  const [filterActivo, setFilterActivo] = useState<string>("todos")

  useEffect(() => {
    async function fetchEmpleados() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("nombre")
      if (!error && data) {
        setEmpleados(data.map(u => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          telefono: u.telefono ?? "",
          role: u.role,
          activo: u.activo,
          fotoUrl: u.foto_url,
          fechaIngreso: u.created_at.split("T")[0],
          obraAsignada: null, // Will be null for now
        })))
      }
      setLoading(false)
    }
    fetchEmpleados()
  }, [])

  const filtered = empleados.filter((e) => {
    if (filterRole !== "todos" && e.role !== filterRole) return false
    if (filterActivo === "activo" && !e.activo) return false
    if (filterActivo === "inactivo" && e.activo) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      return e.nombre.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
    }
    return true
  })

  const totalActivos = empleados.filter((e) => e.activo).length
  const totalInactivos = empleados.filter((e) => !e.activo).length

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
          <h1 className="text-2xl font-bold text-[#1E1A14]">Personal</h1>
          <p className="text-sm text-[#7A6D5A]">Directorio de empleados de Mármol Calibe</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#1E1A14] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2A2520]" onClick={() => toast({ title: "Próximamente", description: "Esta funcionalidad estará disponible pronto." })}>
          <Plus className="h-4 w-4" />
          Nuevo Empleado
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Total Personal</p>
              <p className="text-xl font-bold text-[#1E1A14]">{empleados.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <UserCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Activos</p>
              <p className="text-xl font-bold text-emerald-600">{totalActivos}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2">
              <UserX className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-[#7A6D5A]">Inactivos</p>
              <p className="text-xl font-bold text-red-600">{totalInactivos}</p>
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
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-[#E0DBD1] bg-white pl-9 pr-4 text-sm text-[#1E1A14] placeholder:text-[#7A6D5A] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="h-9 rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
        >
          <option value="todos">Todos los roles</option>
          {Object.entries(roleLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <div className="flex items-center gap-1 rounded-lg border border-[#E0DBD1] bg-white p-1">
          {[
            { key: "todos", label: "Todos" },
            { key: "activo", label: "Activos" },
            { key: "inactivo", label: "Inactivos" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilterActivo(opt.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterActivo === opt.key
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
                <th className="px-5 py-3 font-medium">Rol</th>
                <th className="px-5 py-3 font-medium">Contacto</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Obra Asignada</th>
                <th className="px-5 py-3 font-medium">Fecha Ingreso</th>
                <th className="px-5 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className={`border-b border-[#F0EDE8] hover:bg-[#FAF9F7] transition-colors ${!emp.activo ? "opacity-60" : ""}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0EDE8] text-xs font-bold text-[#7A6D5A]">
                        {getInitials(emp.nombre)}
                      </div>
                      <div>
                        <p className="font-medium text-[#1E1A14]">{emp.nombre}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[emp.role] ?? "bg-gray-100 text-gray-700"}`}>
                      {roleLabels[emp.role] ?? emp.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="space-y-0.5">
                      <p className="inline-flex items-center gap-1 text-xs text-[#7A6D5A]">
                        <Mail className="h-3 w-3" />
                        {emp.email}
                      </p>
                      <p className="inline-flex items-center gap-1 text-xs text-[#7A6D5A]">
                        <Phone className="h-3 w-3" />
                        {emp.telefono}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        emp.activo
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {emp.activo ? (
                        <>
                          <UserCheck className="h-3 w-3" />
                          Activo
                        </>
                      ) : (
                        <>
                          <UserX className="h-3 w-3" />
                          Inactivo
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#7A6D5A]">{emp.obraAsignada ?? "—"}</td>
                  <td className="px-5 py-3 text-[#7A6D5A] whitespace-nowrap">{emp.fechaIngreso}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button className="rounded-md p-1.5 text-[#7A6D5A] hover:bg-[#F0EDE8]" title="Ver perfil">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-md p-1.5 text-[#7A6D5A] hover:bg-[#F0EDE8]" title="Editar">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="rounded-md p-1.5 text-[#7A6D5A] hover:bg-[#F0EDE8]" title="Más opciones">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#E0DBD1] px-5 py-3">
          <p className="text-xs text-[#7A6D5A]">
            Mostrando {filtered.length} de {empleados.length} empleados
          </p>
        </div>
      </div>
    </div>
  )
}
