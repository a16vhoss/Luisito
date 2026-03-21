"use client"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  Filter,
  Download,
  Search,
  Building2,
  Truck,
  Factory,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

const statusColors: Record<string, string> = {
  Presente: "bg-emerald-100 text-emerald-700",
  Ausente: "bg-red-100 text-red-700",
  Permiso: "bg-amber-100 text-amber-700",
}

const ubicacionIcons: Record<string, typeof Factory> = {
  planta: Factory,
  obra: Building2,
  ruta: Truck,
}

function getDepartamento(role: string): string {
  const map: Record<string, string> = {
    director: "Dirección",
    admin: "Administración",
    rrhh: "RRHH",
    jefe_taller: "Taller",
    residente: "Operaciones",
    chofer: "Logística",
    marmolero: "Taller",
  }
  return map[role] ?? role
}

function calcHoras(entrada: string): string {
  const [h, m] = entrada.split(":").map(Number)
  const now = new Date()
  const mins = (now.getHours() * 60 + now.getMinutes()) - (h * 60 + m)
  if (mins < 0) return "—"
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function PersonalPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState("todos")
  const [loading, setLoading] = useState(true)
  const [empleados, setEmpleados] = useState<any[]>([])
  const [resumen, setResumen] = useState({
    total: 0,
    presentes: 0,
    ausentes: 0,
    permisos: 0,
    porcentaje: 0,
  })

  useEffect(() => {
    async function fetchPersonal() {
      const supabase = createClient()
      const today = new Date().toISOString().split("T")[0]

      const [usersRes, asistenciaRes] = await Promise.all([
        supabase.from("users").select("*").eq("activo", true).order("nombre"),
        supabase.from("asistencia").select("*, obra:obras!obra_asignada_id(nombre)").eq("fecha", today),
      ])

      if (!usersRes.error && usersRes.data) {
        const asistenciaMap = new Map()
        if (asistenciaRes.data) {
          asistenciaRes.data.forEach((a: any) => {
            asistenciaMap.set(a.usuario_id, a)
          })
        }

        const emps = usersRes.data.map((u: any, i: number) => {
          const asist = asistenciaMap.get(u.id)
          const status = !asist ? "Ausente" : asist.tipo === "permiso" ? "Permiso" : "Presente"
          const tipoUb = asist?.registrado_en === "obra" ? "obra" : u.role === "chofer" && status === "Presente" ? "ruta" : "planta"

          return {
            id: `EMP-${String(i + 1).padStart(3, "0")}`,
            nombre: u.nombre,
            puesto: u.role.replace("_", " "),
            departamento: getDepartamento(u.role),
            ubicacion: asist?.obra?.nombre ?? (tipoUb === "planta" ? "Planta Principal" : "—"),
            tipoUbicacion: tipoUb,
            horaEntrada: asist?.hora_entrada ?? null,
            horaSalida: asist?.hora_salida ?? null,
            status,
            horasTrabajadas: asist?.hora_entrada ? calcHoras(asist.hora_entrada) : "—",
          }
        })
        setEmpleados(emps)

        const presentes = emps.filter((e: any) => e.status === "Presente").length
        const ausentes = emps.filter((e: any) => e.status === "Ausente").length
        const permisos = emps.filter((e: any) => e.status === "Permiso").length
        setResumen({
          total: emps.length,
          presentes,
          ausentes,
          permisos,
          porcentaje: emps.length > 0 ? Math.round((presentes / emps.length) * 100 * 10) / 10 : 0,
        })
      }
      setLoading(false)
    }
    fetchPersonal()
  }, [])

  const filtered =
    tab === "todos"
      ? empleados
      : tab === "presentes"
      ? empleados.filter((e) => e.status === "Presente")
      : tab === "ausentes"
      ? empleados.filter((e) => e.status === "Ausente" || e.status === "Permiso")
      : empleados

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Personal &amp; Asistencia</h1>
          <p className="mt-1 text-sm text-[#7A6D5A]">
            Control de asistencia y ubicación del personal en tiempo real
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => toast({ title: "Exportando reporte...", description: "El archivo se descargará en breve." })}>
          <Download className="h-4 w-4" />
          Exportar Asistencia
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAF9F7]">
              <Users className="h-5 w-5 text-[#D4A843]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{resumen.total}</p>
              <p className="text-xs text-[#7A6D5A]">Total Empleados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <UserCheck className="h-5 w-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{resumen.presentes}</p>
              <p className="text-xs text-[#7A6D5A]">Presentes ({resumen.porcentaje}%)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <UserX className="h-5 w-5 text-[#EF4444]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{resumen.ausentes}</p>
              <p className="text-xs text-[#7A6D5A]">Ausentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Clock className="h-5 w-5 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{resumen.permisos}</p>
              <p className="text-xs text-[#7A6D5A]">Permisos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "En Planta", count: empleados.filter((e) => e.tipoUbicacion === "planta" && e.status === "Presente").length, icon: Factory, color: "text-blue-500" },
          { label: "En Obra", count: empleados.filter((e) => e.tipoUbicacion === "obra" && e.status === "Presente").length, icon: Building2, color: "text-emerald-500" },
          { label: "En Ruta", count: empleados.filter((e) => e.tipoUbicacion === "ruta" && e.status === "Presente").length, icon: Truck, color: "text-[#D4A843]" },
        ].map((loc) => (
          <Card key={loc.label}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <loc.icon className={`h-5 w-5 ${loc.color}`} />
                <span className="text-sm font-medium text-[#1E1A14]">{loc.label}</span>
              </div>
              <span className="text-xl font-bold text-[#1E1A14]">{loc.count}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Registro de Asistencia - Hoy</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7A6D5A]" />
                <input
                  type="text"
                  placeholder="Buscar empleado..."
                  className="h-8 w-56 rounded-lg border border-[#E0DBD1] bg-[#FAF9F7] pl-8 pr-3 text-xs focus:border-[#D4A843] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos ({empleados.length})</TabsTrigger>
              <TabsTrigger value="presentes">
                Presentes ({empleados.filter((e) => e.status === "Presente").length})
              </TabsTrigger>
              <TabsTrigger value="ausentes">
                Ausentes ({empleados.filter((e) => e.status !== "Presente").length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value={tab}>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#7A6D5A]">
                  <Users className="mb-2 h-8 w-8 opacity-40" />
                  <p className="text-sm">No se encontraron empleados en esta categoría</p>
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Puesto</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((emp) => {
                    const UbIcon = ubicacionIcons[emp.tipoUbicacion] || MapPin
                    return (
                      <TableRow key={emp.id}>
                        <TableCell className="font-mono text-xs text-[#7A6D5A]">
                          {emp.id}
                        </TableCell>
                        <TableCell className="font-medium">{emp.nombre}</TableCell>
                        <TableCell className="text-sm">{emp.puesto}</TableCell>
                        <TableCell className="text-sm text-[#7A6D5A]">
                          {emp.departamento}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <UbIcon className="h-3.5 w-3.5 text-[#7A6D5A]" />
                            <span>{emp.ubicacion}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {emp.horaEntrada || "—"}
                        </TableCell>
                        <TableCell className="text-sm">{emp.horasTrabajadas}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[emp.status]}>{emp.status}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
