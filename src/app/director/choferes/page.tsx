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
import {
  Truck,
  MapPin,
  Navigation,
  Clock,
  Phone,
  Package,
  AlertTriangle,
  Signal,
  Fuel,
} from "lucide-react"

const resumenChoferes = {
  total: 8,
  enRuta: 6,
  enPlanta: 1,
  sinActividad: 1,
}

const choferes = [
  {
    id: "CHF-001",
    nombre: "Juan Carlos Canul May",
    telefono: "+52 999 234 5678",
    vehiculo: "Kenworth T680 - YUC-4521",
    origen: "Planta Principal",
    destino: "Hotel Regency, Cancún",
    status: "En Ruta",
    carga: "Mármol Emperador Dark - 18 m²",
    eta: "14:30",
    distanciaRestante: "245 km",
    velocidad: "85 km/h",
    combustible: 72,
    ubicacionActual: "Carretera Mérida-Cancún km 180",
    ultimaActualizacion: "Hace 3 min",
    remision: "REM-0148",
  },
  {
    id: "CHF-002",
    nombre: "Pedro Antonio Pech Dzul",
    telefono: "+52 999 345 6789",
    vehiculo: "International ProStar - YUC-3892",
    origen: "Planta Principal",
    destino: "Plaza Kukulcán, Mérida",
    status: "En Ruta",
    carga: "Travertino Romano - 24 m²",
    eta: "11:45",
    distanciaRestante: "12 km",
    velocidad: "40 km/h",
    combustible: 58,
    ubicacionActual: "Periférico Norte, Mérida",
    ultimaActualizacion: "Hace 1 min",
    remision: "REM-0149",
  },
  {
    id: "CHF-003",
    nombre: "Ernesto Pool Canche",
    telefono: "+52 999 456 7890",
    vehiculo: "Freightliner M2 - YUC-5103",
    origen: "Planta Principal",
    destino: "Residencia Las Nubes",
    status: "En Ruta",
    carga: "Carrara White 60x60 - 3 pzas",
    eta: "12:15",
    distanciaRestante: "8 km",
    velocidad: "35 km/h",
    combustible: 45,
    ubicacionActual: "Col. Montes de Amé, Mérida",
    ultimaActualizacion: "Hace 2 min",
    remision: "REM-0150",
  },
  {
    id: "CHF-004",
    nombre: "Marco Antonio Dzib Ek",
    telefono: "+52 999 567 8901",
    vehiculo: "Kenworth T370 - YUC-2847",
    origen: "Cantera Ticul",
    destino: "Planta Principal",
    status: "En Ruta",
    carga: "Crema Maya (en bruto) - 40 m²",
    eta: "13:00",
    distanciaRestante: "52 km",
    velocidad: "70 km/h",
    combustible: 63,
    ubicacionActual: "Carretera Ticul-Mérida km 28",
    ultimaActualizacion: "Hace 5 min",
    remision: "REM-0151",
  },
  {
    id: "CHF-005",
    nombre: "Wilberth Chan Mis",
    telefono: "+52 999 678 9012",
    vehiculo: "International DuraStar - YUC-6234",
    origen: "Planta Principal",
    destino: "Torre Corporate VII",
    status: "En Ruta",
    carga: "Granito Negro Absoluto - 15 m²",
    eta: "12:00",
    distanciaRestante: "5 km",
    velocidad: "25 km/h",
    combustible: 81,
    ubicacionActual: "Av. Prolongación Montejo, Mérida",
    ultimaActualizacion: "Hace 1 min",
    remision: "REM-0152",
  },
  {
    id: "CHF-006",
    nombre: "Gaspar Tuyub Noh",
    telefono: "+52 999 789 0123",
    vehiculo: "Freightliner Cascadia - YUC-7891",
    origen: "Club de Playa Sisal",
    destino: "Planta Principal",
    status: "En Ruta",
    carga: "Vacío (retorno)",
    eta: "12:30",
    distanciaRestante: "38 km",
    velocidad: "75 km/h",
    combustible: 34,
    ubicacionActual: "Carretera Sisal-Mérida km 22",
    ultimaActualizacion: "Hace 4 min",
    remision: "—",
  },
  {
    id: "CHF-007",
    nombre: "Ángel Hau Cauich",
    telefono: "+52 999 890 1234",
    vehiculo: "Kenworth T370 - YUC-1456",
    origen: "Planta Principal",
    destino: "—",
    status: "En Planta",
    carga: "Sin carga asignada",
    eta: "—",
    distanciaRestante: "—",
    velocidad: "—",
    combustible: 90,
    ubicacionActual: "Planta Principal - Patio de carga",
    ultimaActualizacion: "Hace 10 min",
    remision: "—",
  },
  {
    id: "CHF-008",
    nombre: "David Uicab Pat",
    telefono: "+52 999 901 2345",
    vehiculo: "International ProStar - YUC-8234",
    origen: "—",
    destino: "—",
    status: "Día Libre",
    carga: "—",
    eta: "—",
    distanciaRestante: "—",
    velocidad: "—",
    combustible: 55,
    ubicacionActual: "—",
    ultimaActualizacion: "—",
    remision: "—",
  },
]

const statusColors: Record<string, string> = {
  "En Ruta": "bg-blue-100 text-blue-700",
  "En Planta": "bg-emerald-100 text-emerald-700",
  "Día Libre": "bg-gray-100 text-gray-600",
}

export default function ChoferesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Choferes &amp; GPS</h1>
          <p className="mt-1 text-sm text-[#7A6D5A]">
            Rastreo en tiempo real de la flota y entregas activas
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Signal className="h-4 w-4" />
          Actualizar GPS
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAF9F7]">
              <Truck className="h-5 w-5 text-[#D4A843]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{resumenChoferes.total}</p>
              <p className="text-xs text-[#7A6D5A]">Total Choferes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Navigation className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{resumenChoferes.enRuta}</p>
              <p className="text-xs text-[#7A6D5A]">En Ruta</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <MapPin className="h-5 w-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{resumenChoferes.enPlanta}</p>
              <p className="text-xs text-[#7A6D5A]">En Planta</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1E1A14]">{resumenChoferes.sinActividad}</p>
              <p className="text-xs text-[#7A6D5A]">Día Libre</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Placeholder + Active Routes */}
      <div className="grid grid-cols-3 gap-6">
        {/* Map */}
        <Card className="col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mapa de Flota en Tiempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative flex h-80 items-center justify-center rounded-lg bg-[#F0EDE8] overflow-hidden">
              {/* Simulated map background */}
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 800 400" className="h-full w-full">
                  {/* Road lines */}
                  <line x1="100" y1="200" x2="700" y2="200" stroke="#7A6D5A" strokeWidth="2" />
                  <line x1="400" y1="50" x2="400" y2="350" stroke="#7A6D5A" strokeWidth="2" />
                  <line x1="200" y1="100" x2="600" y2="300" stroke="#7A6D5A" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="150" y1="300" x2="650" y2="100" stroke="#7A6D5A" strokeWidth="1" strokeDasharray="5,5" />
                  <circle cx="400" cy="200" r="80" stroke="#7A6D5A" strokeWidth="1" fill="none" />
                </svg>
              </div>
              {/* Truck markers */}
              <div className="absolute left-[25%] top-[45%]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg animate-pulse">
                  <Truck className="h-4 w-4" />
                </div>
                <p className="mt-1 text-[9px] font-medium text-center text-[#1E1A14]">J. Canul</p>
              </div>
              <div className="absolute left-[55%] top-[30%]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg animate-pulse">
                  <Truck className="h-4 w-4" />
                </div>
                <p className="mt-1 text-[9px] font-medium text-center text-[#1E1A14]">P. Pech</p>
              </div>
              <div className="absolute left-[62%] top-[55%]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
                  <Truck className="h-4 w-4" />
                </div>
                <p className="mt-1 text-[9px] font-medium text-center text-[#1E1A14]">E. Pool</p>
              </div>
              <div className="absolute left-[35%] top-[65%]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
                  <Truck className="h-4 w-4" />
                </div>
                <p className="mt-1 text-[9px] font-medium text-center text-[#1E1A14]">M. Dzib</p>
              </div>
              <div className="absolute left-[70%] top-[40%]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
                  <Truck className="h-4 w-4" />
                </div>
                <p className="mt-1 text-[9px] font-medium text-center text-[#1E1A14]">W. Chan</p>
              </div>
              <div className="absolute left-[20%] top-[25%]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
                  <Truck className="h-4 w-4" />
                </div>
                <p className="mt-1 text-[9px] font-medium text-center text-[#1E1A14]">G. Tuyub</p>
              </div>
              {/* Planta marker */}
              <div className="absolute left-[48%] top-[48%]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4A843] text-white shadow-lg border-2 border-white">
                  <MapPin className="h-5 w-5" />
                </div>
                <p className="mt-1 text-[9px] font-bold text-center text-[#1E1A14]">PLANTA</p>
              </div>
              {/* Legend overlay */}
              <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 p-2 text-[10px]">
                <p className="font-semibold text-[#1E1A14] mb-1">Península de Yucatán</p>
                <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-blue-500" /> En Ruta</div>
                <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-[#D4A843]" /> Planta</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Routes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Entregas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {choferes
                .filter((c) => c.status === "En Ruta")
                .map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border border-[#E0DBD1] p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-[#1E1A14]">{c.nombre.split(" ").slice(0, 2).join(" ")}</p>
                      <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                        ETA {c.eta}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#7A6D5A] mb-1">{c.destino}</p>
                    <p className="text-[10px] text-[#7A6D5A]">{c.carga}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-[#7A6D5A]">
                      <span>{c.distanciaRestante}</span>
                      <span>{c.velocidad}</span>
                      <div className="flex items-center gap-1">
                        <Fuel className="h-3 w-3" />
                        <span>{c.combustible}%</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Todos los Choferes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chofer</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Carga</TableHead>
                <TableHead>Ubicación Actual</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Combustible</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {choferes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-medium text-[#1E1A14]">{c.nombre}</p>
                    <p className="text-[10px] text-[#7A6D5A]">{c.telefono}</p>
                  </TableCell>
                  <TableCell className="text-xs">{c.vehiculo}</TableCell>
                  <TableCell className="text-sm">{c.destino}</TableCell>
                  <TableCell className="text-xs text-[#7A6D5A]">{c.carga}</TableCell>
                  <TableCell>
                    <p className="text-xs">{c.ubicacionActual}</p>
                    <p className="text-[10px] text-[#7A6D5A]">{c.ultimaActualizacion}</p>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{c.eta}</TableCell>
                  <TableCell>
                    {c.combustible > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-10 rounded-full bg-[#F0EDE8]">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${c.combustible}%`,
                              backgroundColor:
                                c.combustible < 40 ? "#EF4444" : c.combustible < 60 ? "#F59E0B" : "#22C55E",
                            }}
                          />
                        </div>
                        <span className="text-xs">{c.combustible}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#7A6D5A]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[c.status] + " text-[10px]"}>
                      {c.status}
                    </Badge>
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
