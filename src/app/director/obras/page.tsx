"use client"

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
  Filter,
  Search,
  ArrowUpRight,
  MapPin,
  Calendar,
  HardHat,
} from "lucide-react"
import { useState } from "react"

const obras = [
  {
    id: "OBR-001",
    nombre: "Residencia \"Las Nubes\"",
    cliente: "Arq. Roberto Medina",
    ubicacion: "Mérida, Yuc.",
    tipo: "Residencial",
    fechaInicio: "2026-01-15",
    fechaEntrega: "2026-04-30",
    presupuesto: "$485,000",
    avance: 93,
    status: "A Tiempo",
    color: "#22C55E",
    piezas: "42/45",
    m2: "120 m²",
  },
  {
    id: "OBR-002",
    nombre: "Hotel Regency Lobby",
    cliente: "Grupo Hotelero del Sureste",
    ubicacion: "Cancún, Q.R.",
    tipo: "Hospitalidad",
    fechaInicio: "2025-11-01",
    fechaEntrega: "2026-05-15",
    presupuesto: "$1,250,000",
    avance: 65,
    status: "En Riesgo",
    color: "#F59E0B",
    piezas: "78/120",
    m2: "340 m²",
  },
  {
    id: "OBR-003",
    nombre: "Torre Corporate VII",
    cliente: "Inmobiliaria Peninsular",
    ubicacion: "Mérida, Yuc.",
    tipo: "Corporativo",
    fechaInicio: "2026-02-01",
    fechaEntrega: "2026-08-30",
    presupuesto: "$2,100,000",
    avance: 39,
    status: "Crítico",
    color: "#EF4444",
    piezas: "35/90",
    m2: "580 m²",
  },
  {
    id: "OBR-004",
    nombre: "Plaza Kukulcán",
    cliente: "Desarrollos Peninsulares S.A.",
    ubicacion: "Mérida, Yuc.",
    tipo: "Comercial",
    fechaInicio: "2025-10-15",
    fechaEntrega: "2026-04-15",
    presupuesto: "$890,000",
    avance: 87,
    status: "A Tiempo",
    color: "#22C55E",
    piezas: "156/180",
    m2: "450 m²",
  },
  {
    id: "OBR-005",
    nombre: "Residencia Montejo 480",
    cliente: "Familia Cámara Zavala",
    ubicacion: "Mérida, Yuc.",
    tipo: "Residencial",
    fechaInicio: "2026-01-20",
    fechaEntrega: "2026-05-20",
    presupuesto: "$320,000",
    avance: 73,
    status: "En Riesgo",
    color: "#F59E0B",
    piezas: "22/30",
    m2: "85 m²",
  },
  {
    id: "OBR-006",
    nombre: "Club de Playa Sisal",
    cliente: "Inmuebles Costeros del Golfo",
    ubicacion: "Sisal, Yuc.",
    tipo: "Hospitalidad",
    fechaInicio: "2026-03-01",
    fechaEntrega: "2026-09-30",
    presupuesto: "$1,750,000",
    avance: 12,
    status: "A Tiempo",
    color: "#22C55E",
    piezas: "8/65",
    m2: "720 m²",
  },
  {
    id: "OBR-007",
    nombre: "Departamentos Altabrisa",
    cliente: "Grupo Inmobiliario VIVA",
    ubicacion: "Mérida, Yuc.",
    tipo: "Residencial",
    fechaInicio: "2026-02-10",
    fechaEntrega: "2026-07-15",
    presupuesto: "$560,000",
    avance: 45,
    status: "A Tiempo",
    color: "#22C55E",
    piezas: "30/66",
    m2: "200 m²",
  },
]

const statusColors: Record<string, string> = {
  "A Tiempo": "bg-emerald-100 text-emerald-700",
  "En Riesgo": "bg-amber-100 text-amber-700",
  "Crítico": "bg-red-100 text-red-700",
}

export default function ObrasPage() {
  const [filter, setFilter] = useState<string>("Todas")

  const filteredObras =
    filter === "Todas"
      ? obras
      : obras.filter((o) => o.status === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Obras</h1>
          <p className="mt-1 text-sm text-[#7A6D5A]">
            {obras.length} obras registradas &bull; {obras.filter((o) => o.status !== "Completada").length} activas
          </p>
        </div>
        <Button className="gap-2 bg-[#D4A843] text-white hover:bg-[#C49A3A]">
          <Plus className="h-4 w-4" />
          Nueva Obra
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Obras", value: obras.length, bg: "bg-[#FAF9F7]" },
          {
            label: "A Tiempo",
            value: obras.filter((o) => o.status === "A Tiempo").length,
            bg: "bg-emerald-50",
            dot: "#22C55E",
          },
          {
            label: "En Riesgo",
            value: obras.filter((o) => o.status === "En Riesgo").length,
            bg: "bg-amber-50",
            dot: "#F59E0B",
          },
          {
            label: "Crítico",
            value: obras.filter((o) => o.status === "Crítico").length,
            bg: "bg-red-50",
            dot: "#EF4444",
          },
        ].map((s) => (
          <Card
            key={s.label}
            className={`cursor-pointer border transition-shadow hover:shadow-md ${
              filter === s.label || (filter === "Todas" && s.label === "Total Obras")
                ? "ring-2 ring-[#D4A843]"
                : ""
            }`}
            onClick={() =>
              setFilter(s.label === "Total Obras" ? "Todas" : s.label)
            }
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
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7A6D5A]" />
                <input
                  type="text"
                  placeholder="Buscar obra..."
                  className="h-8 w-56 rounded-lg border border-[#E0DBD1] bg-[#FAF9F7] pl-8 pr-3 text-xs focus:border-[#D4A843] focus:outline-none"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead>Obra</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Presupuesto</TableHead>
                <TableHead>Avance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredObras.map((obra) => (
                <TableRow key={obra.id} className="group">
                  <TableCell className="text-xs font-mono text-[#7A6D5A]">
                    {obra.id}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/obras/${obra.id}`}
                      className="font-medium text-[#1E1A14] hover:text-[#D4A843]"
                    >
                      {obra.nombre}
                    </Link>
                    <p className="text-[10px] text-[#7A6D5A]">{obra.piezas} pzas &bull; {obra.m2}</p>
                  </TableCell>
                  <TableCell className="text-sm">{obra.cliente}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-[#7A6D5A]">
                      <MapPin className="h-3 w-3" />
                      {obra.ubicacion}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {obra.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {obra.presupuesto}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-[#F0EDE8]">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${obra.avance}%`,
                            backgroundColor: obra.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium">{obra.avance}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[obra.status] + " text-[10px]"}>
                      {obra.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/obras/${obra.id}`}>
                      <ArrowUpRight className="h-4 w-4 text-[#7A6D5A] opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
