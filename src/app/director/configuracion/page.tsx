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
  Settings,
  Users,
  Shield,
  Bell,
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Key,
  Eye,
  Pencil,
} from "lucide-react"
import { useState } from "react"

const usuarios = [
  {
    id: "USR-001",
    nombre: "Andrée Hossfeldt",
    email: "andree@marmolcalibe.com",
    telefono: "+52 999 111 2222",
    rol: "Director General",
    permisos: "Administrador",
    status: "Activo",
    ultimoAcceso: "19 Mar 2026, 08:30",
  },
  {
    id: "USR-002",
    nombre: "Carlos A. Pérez Novelo",
    email: "carlos.perez@marmolcalibe.com",
    telefono: "+52 999 222 3333",
    rol: "Supervisor de Obra",
    permisos: "Operaciones",
    status: "Activo",
    ultimoAcceso: "19 Mar 2026, 07:15",
  },
  {
    id: "USR-003",
    nombre: "Lic. María Gómez",
    email: "maria.gomez@marmolcalibe.com",
    telefono: "+52 999 333 4444",
    rol: "Contadora",
    permisos: "Finanzas",
    status: "Activo",
    ultimoAcceso: "18 Mar 2026, 17:45",
  },
  {
    id: "USR-004",
    nombre: "Armando Nah Dzib",
    email: "armando.nah@marmolcalibe.com",
    telefono: "+52 999 444 5555",
    rol: "Almacenista",
    permisos: "Almacén",
    status: "Activo",
    ultimoAcceso: "19 Mar 2026, 06:55",
  },
  {
    id: "USR-005",
    nombre: "Roberto Medina (Externo)",
    email: "roberto@medina-arq.com",
    telefono: "+52 999 123 4567",
    rol: "Cliente - Arquitecto",
    permisos: "Solo Lectura",
    status: "Activo",
    ultimoAcceso: "17 Mar 2026, 10:20",
  },
  {
    id: "USR-006",
    nombre: "Jorge Iván Caamal Ku",
    email: "jorge.caamal@marmolcalibe.com",
    telefono: "+52 999 555 6666",
    rol: "Ayudante General",
    permisos: "Básico",
    status: "Inactivo",
    ultimoAcceso: "10 Mar 2026, 15:30",
  },
]

const roles = [
  {
    nombre: "Administrador",
    descripcion: "Acceso completo a todos los módulos y configuración",
    usuarios: 1,
    permisos: ["Dashboard", "Obras", "Personal", "Almacén", "Choferes", "Finanzas", "Reportes", "Configuración"],
  },
  {
    nombre: "Operaciones",
    descripcion: "Gestión de obras, personal en campo y remisiones",
    usuarios: 2,
    permisos: ["Dashboard", "Obras", "Personal", "Choferes"],
  },
  {
    nombre: "Finanzas",
    descripcion: "Facturación, presupuestos y reportes financieros",
    usuarios: 1,
    permisos: ["Dashboard", "Finanzas", "Reportes"],
  },
  {
    nombre: "Almacén",
    descripcion: "Control de inventario, entradas y salidas de material",
    usuarios: 1,
    permisos: ["Dashboard", "Almacén"],
  },
  {
    nombre: "Solo Lectura",
    descripcion: "Visualización de avance de obra (clientes externos)",
    usuarios: 1,
    permisos: ["Dashboard (limitado)", "Obras (solo lectura)"],
  },
  {
    nombre: "Básico",
    descripcion: "Acceso mínimo para personal operativo",
    usuarios: 3,
    permisos: ["Dashboard (limitado)"],
  },
]

const configuracionGeneral = [
  { seccion: "Empresa", campo: "Razón Social", valor: "Mármol Calibe S.A. de C.V." },
  { seccion: "Empresa", campo: "RFC", valor: "MCA201015XXX" },
  { seccion: "Empresa", campo: "Dirección", valor: "Calle 21 #234, Parque Industrial Yucatán, Mérida" },
  { seccion: "Empresa", campo: "Teléfono", valor: "+52 999 987 6543" },
  { seccion: "Operación", campo: "Horario Laboral", valor: "Lunes a Viernes 07:00 - 17:00, Sábado 07:00 - 13:00" },
  { seccion: "Operación", campo: "Zona Horaria", valor: "America/Merida (CST)" },
  { seccion: "Notificaciones", campo: "Alertas Stock Crítico", valor: "Activado" },
  { seccion: "Notificaciones", campo: "Reportes Automáticos", valor: "Lunes 08:00" },
  { seccion: "Notificaciones", campo: "Alertas GPS", valor: "Activado (velocidad > 100 km/h)" },
]

const statusColors: Record<string, string> = {
  Activo: "bg-emerald-100 text-emerald-700",
  Inactivo: "bg-gray-100 text-gray-600",
}

const permisosColors: Record<string, string> = {
  Administrador: "bg-purple-100 text-purple-700",
  Operaciones: "bg-blue-100 text-blue-700",
  Finanzas: "bg-emerald-100 text-emerald-700",
  "Almacén": "bg-orange-100 text-orange-700",
  "Solo Lectura": "bg-gray-100 text-gray-600",
  "Básico": "bg-gray-100 text-gray-600",
}

export default function ConfiguracionPage() {
  const [tab, setTab] = useState("usuarios")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Configuración</h1>
          <p className="mt-1 text-sm text-[#7A6D5A]">
            Usuarios, roles, permisos y configuración general del sistema
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAF9F7]">
              <Users className="h-5 w-5 text-[#D4A843]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{usuarios.length}</p>
              <p className="text-xs text-[#7A6D5A]">Usuarios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <Shield className="h-5 w-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">
                {usuarios.filter((u) => u.status === "Activo").length}
              </p>
              <p className="text-xs text-[#7A6D5A]">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Key className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{roles.length}</p>
              <p className="text-xs text-[#7A6D5A]">Roles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Bell className="h-5 w-5 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">3</p>
              <p className="text-xs text-[#7A6D5A]">Alertas Activas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="roles">Roles y Permisos</TabsTrigger>
          <TabsTrigger value="general">Configuración General</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Usuarios del Sistema</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7A6D5A]" />
                    <input
                      type="text"
                      placeholder="Buscar usuario..."
                      className="h-8 w-56 rounded-lg border border-[#E0DBD1] bg-[#FAF9F7] pl-8 pr-3 text-xs focus:border-[#D4A843] focus:outline-none"
                    />
                  </div>
                  <Button className="gap-2 bg-[#D4A843] text-white hover:bg-[#C49A3A]" size="sm">
                    <Plus className="h-3.5 w-3.5" />
                    Nuevo Usuario
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Permisos</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usr) => (
                    <TableRow key={usr.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0EDE8] text-xs font-bold text-[#7A6D5A]">
                            {usr.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div>
                            <p className="font-medium text-[#1E1A14]">{usr.nombre}</p>
                            <div className="flex items-center gap-2 text-[10px] text-[#7A6D5A]">
                              <Mail className="h-3 w-3" />
                              {usr.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{usr.rol}</TableCell>
                      <TableCell>
                        <Badge className={permisosColors[usr.permisos] + " text-[10px]"}>
                          {usr.permisos}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[#7A6D5A]">{usr.ultimoAcceso}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[usr.status] + " text-[10px]"}>
                          {usr.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-3.5 w-3.5 text-[#7A6D5A]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid grid-cols-2 gap-4">
            {roles.map((role) => (
              <Card key={role.nombre}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{role.nombre}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      {role.usuarios} usuario{role.usuarios !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-[#7A6D5A]">{role.descripcion}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permisos.map((perm) => (
                      <Badge key={perm} variant="outline" className="text-[10px]">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Configuración General</CardTitle>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {["Empresa", "Operación", "Notificaciones"].map((seccion) => (
                  <div key={seccion}>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1E1A14]">
                      {seccion === "Empresa" && <Building2 className="h-4 w-4 text-[#D4A843]" />}
                      {seccion === "Operación" && <Settings className="h-4 w-4 text-[#D4A843]" />}
                      {seccion === "Notificaciones" && <Bell className="h-4 w-4 text-[#D4A843]" />}
                      {seccion}
                    </h3>
                    <div className="space-y-2">
                      {configuracionGeneral
                        .filter((c) => c.seccion === seccion)
                        .map((cfg) => (
                          <div
                            key={cfg.campo}
                            className="flex items-center justify-between rounded-lg bg-[#FAF9F7] px-4 py-3"
                          >
                            <span className="text-sm text-[#7A6D5A]">{cfg.campo}</span>
                            <span className="text-sm font-medium text-[#1E1A14]">{cfg.valor}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
