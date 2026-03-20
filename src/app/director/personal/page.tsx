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
} from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const resumenAsistencia = {
  total: 52,
  presentes: 44,
  ausentes: 5,
  permisos: 3,
  porcentaje: 84.6,
}

const empleados = [
  {
    id: "EMP-001",
    nombre: "Miguel Ángel Tun Canul",
    puesto: "Instalador Senior",
    departamento: "Instalaciones",
    ubicacion: "Residencia Las Nubes",
    tipoUbicacion: "obra",
    horaEntrada: "07:02",
    horaSalida: null,
    status: "Presente",
    horasTrabajadas: "8h 15m",
  },
  {
    id: "EMP-002",
    nombre: "José Luis Chi Pech",
    puesto: "Cortador CNC",
    departamento: "Taller",
    ubicacion: "Planta Principal",
    tipoUbicacion: "planta",
    horaEntrada: "06:58",
    horaSalida: null,
    status: "Presente",
    horasTrabajadas: "8h 19m",
  },
  {
    id: "EMP-003",
    nombre: "Juan Carlos Canul May",
    puesto: "Chofer",
    departamento: "Logística",
    ubicacion: "En ruta → Hotel Regency",
    tipoUbicacion: "ruta",
    horaEntrada: "06:45",
    horaSalida: null,
    status: "Presente",
    horasTrabajadas: "8h 32m",
  },
  {
    id: "EMP-004",
    nombre: "Pedro Antonio Pech Dzul",
    puesto: "Chofer",
    departamento: "Logística",
    ubicacion: "En ruta → Plaza Kukulcán",
    tipoUbicacion: "ruta",
    horaEntrada: "07:10",
    horaSalida: null,
    status: "Presente",
    horasTrabajadas: "8h 07m",
  },
  {
    id: "EMP-005",
    nombre: "Ricardo Alejandro May Uc",
    puesto: "Pulidor",
    departamento: "Taller",
    ubicacion: "Planta Principal",
    tipoUbicacion: "planta",
    horaEntrada: "07:00",
    horaSalida: null,
    status: "Presente",
    horasTrabajadas: "8h 17m",
  },
  {
    id: "EMP-006",
    nombre: "Fernando Euán Couoh",
    puesto: "Instalador",
    departamento: "Instalaciones",
    ubicacion: "Torre Corporate VII",
    tipoUbicacion: "obra",
    horaEntrada: null,
    horaSalida: null,
    status: "Ausente",
    horasTrabajadas: "—",
  },
  {
    id: "EMP-007",
    nombre: "Carlos Alberto Pérez Novelo",
    puesto: "Supervisor de Obra",
    departamento: "Operaciones",
    ubicacion: "Hotel Regency",
    tipoUbicacion: "obra",
    horaEntrada: "06:50",
    horaSalida: null,
    status: "Presente",
    horasTrabajadas: "8h 27m",
  },
  {
    id: "EMP-008",
    nombre: "Armando Nah Dzib",
    puesto: "Almacenista",
    departamento: "Almacén",
    ubicacion: "Planta Principal",
    tipoUbicacion: "planta",
    horaEntrada: null,
    horaSalida: null,
    status: "Permiso",
    horasTrabajadas: "—",
  },
  {
    id: "EMP-009",
    nombre: "Luis Enrique Balam Pool",
    puesto: "Cortador Manual",
    departamento: "Taller",
    ubicacion: "Planta Principal",
    tipoUbicacion: "planta",
    horaEntrada: "07:05",
    horaSalida: null,
    status: "Presente",
    horasTrabajadas: "8h 12m",
  },
  {
    id: "EMP-010",
    nombre: "Jorge Iván Caamal Ku",
    puesto: "Ayudante General",
    departamento: "Instalaciones",
    ubicacion: "Depto. Altabrisa",
    tipoUbicacion: "obra",
    horaEntrada: "07:15",
    horaSalida: null,
    status: "Presente",
    horasTrabajadas: "8h 02m",
  },
]

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

export default function PersonalPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState("todos")

  const filtered =
    tab === "todos"
      ? empleados
      : tab === "presentes"
      ? empleados.filter((e) => e.status === "Presente")
      : tab === "ausentes"
      ? empleados.filter((e) => e.status === "Ausente" || e.status === "Permiso")
      : empleados

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
              <p className="text-2xl font-bold text-[#1E1A14]">{resumenAsistencia.total}</p>
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
              <p className="text-2xl font-bold text-[#1E1A14]">{resumenAsistencia.presentes}</p>
              <p className="text-xs text-[#7A6D5A]">Presentes ({resumenAsistencia.porcentaje}%)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <UserX className="h-5 w-5 text-[#EF4444]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{resumenAsistencia.ausentes}</p>
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
              <p className="text-2xl font-bold text-[#1E1A14]">{resumenAsistencia.permisos}</p>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
