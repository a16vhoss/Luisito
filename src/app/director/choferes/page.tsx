"use client"

import { useState, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const statusColors: Record<string, string> = {
  "En Ruta": "bg-blue-100 text-blue-700",
  "En Planta": "bg-emerald-100 text-emerald-700",
  "Día Libre": "bg-gray-100 text-gray-600",
}

// Predefined positions for truck markers on the map
const markerPositions = [
  { left: "25%", top: "45%" },
  { left: "55%", top: "30%" },
  { left: "62%", top: "55%" },
  { left: "35%", top: "65%" },
  { left: "70%", top: "40%" },
  { left: "20%", top: "25%" },
  { left: "45%", top: "20%" },
  { left: "75%", top: "60%" },
]

function getShortName(nombre: string): string {
  const parts = nombre.split(" ")
  if (parts.length >= 2) {
    // First initial + first last name (skip middle names, last names start after first 1-2 parts)
    const firstName = parts[0]
    // Find the last name - typically the 3rd word for Hispanic names (first middle last1 last2)
    const lastName = parts.length >= 3 ? parts[2] : parts[1]
    return `${firstName[0]}. ${lastName}`
  }
  return nombre
}

interface ChoferDisplay {
  id: string
  nombre: string
  telefono: string
  vehiculo: string
  origen: string
  destino: string
  status: string
  carga: string
  eta: string
  distanciaRestante: string
  velocidad: string
  combustible: number
  ubicacionActual: string
  ultimaActualizacion: string
  remision: string
}

export default function ChoferesPage() {
  const [choferes, setChoferes] = useState<ChoferDisplay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChoferes() {
      const supabase = createClient()
      const today = new Date().toISOString().split("T")[0]

      const [usersRes, vehiculosRes, asistenciaRes, remisionesRes] = await Promise.all([
        supabase.from("users").select("*").eq("role", "chofer").eq("activo", true),
        supabase.from("vehiculos").select("*").eq("activo", true),
        supabase.from("asistencia").select("*").eq("fecha", today),
        supabase.from("remisiones").select("*, obra:obras(nombre, ubicacion)").in("estatus", ["creada", "en_transito"]),
      ])

      const users = usersRes.data ?? []
      const vehiculos = vehiculosRes.data ?? []
      const asistencias = asistenciaRes.data ?? []
      const remisiones = remisionesRes.data ?? []

      const mapped: ChoferDisplay[] = users.map((user: any) => {
        // Find assigned vehicle
        const vehiculo = vehiculos.find((v: any) => v.chofer_asignado_id === user.id)
        const vehiculoDesc = vehiculo
          ? `${vehiculo.marca ?? ""} ${vehiculo.modelo ?? ""} - ${vehiculo.placa ?? ""}`.trim()
          : "Sin vehículo"

        // Check today's asistencia
        const asistencia = asistencias.find((a: any) => a.user_id === user.id)

        // Find active remisiones for this chofer
        const activeRemisiones = remisiones.filter((r: any) => r.chofer_id === user.id)
        const hasActiveRemision = activeRemisiones.length > 0
        const remisionEnTransito = activeRemisiones.find((r: any) => r.estatus === "en_transito")

        // Determine status
        let status = "Día Libre"
        if (asistencia) {
          if (hasActiveRemision) {
            status = "En Ruta"
          } else {
            status = "En Planta"
          }
        }

        // Build destination and cargo info from active remision
        const mainRemision = remisionEnTransito ?? activeRemisiones[0]
        const destino = mainRemision?.obra?.nombre ?? "—"
        const carga = mainRemision
          ? mainRemision.descripcion_carga ?? mainRemision.notas ?? "Carga asignada"
          : status === "En Planta" ? "Sin carga asignada" : "—"

        return {
          id: user.id,
          nombre: user.nombre ?? `${user.nombre ?? ""}`,
          telefono: user.telefono ?? "—",
          vehiculo: vehiculoDesc,
          origen: hasActiveRemision ? "Planta Principal" : "—",
          destino,
          status,
          carga,
          eta: "—",
          distanciaRestante: "—",
          velocidad: "—",
          combustible: 0,
          ubicacionActual: status === "En Ruta" ? (destino !== "—" ? `Rumbo a ${destino}` : "—") : status === "En Planta" ? "Planta Principal" : "—",
          ultimaActualizacion: "—",
          remision: mainRemision?.folio ?? "—",
        }
      })

      setChoferes(mapped)
      setLoading(false)
    }
    fetchChoferes()
  }, [])

  // Computed resumen
  const resumenChoferes = {
    total: choferes.length,
    enRuta: choferes.filter((c) => c.status === "En Ruta").length,
    enPlanta: choferes.filter((c) => c.status === "En Planta").length,
    sinActividad: choferes.filter((c) => c.status === "Día Libre").length,
  }

  const choferesEnRuta = choferes.filter((c) => c.status === "En Ruta")

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4A843]" />
        <span className="ml-3 text-[#7A6D5A]">Cargando choferes...</span>
      </div>
    )
  }

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
              {/* Truck markers - dynamic based on en ruta choferes */}
              {choferesEnRuta.slice(0, markerPositions.length).map((c, i) => (
                <div key={c.id} className="absolute" style={{ left: markerPositions[i].left, top: markerPositions[i].top }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg animate-pulse">
                    <Truck className="h-4 w-4" />
                  </div>
                  <p className="mt-1 text-[9px] font-medium text-center text-[#1E1A14]">{getShortName(c.nombre)}</p>
                </div>
              ))}
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
              {/* Empty state for map */}
              {choferesEnRuta.length === 0 && (
                <p className="z-10 text-sm text-[#7A6D5A]">No hay choferes en ruta actualmente</p>
              )}
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
              {choferesEnRuta.length === 0 && (
                <p className="text-sm text-[#7A6D5A] text-center py-6">No hay entregas activas</p>
              )}
              {choferesEnRuta.map((c) => (
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
          {choferes.length === 0 ? (
            <p className="text-sm text-[#7A6D5A] text-center py-8">No se encontraron choferes activos</p>
          ) : (
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
                    <Badge className={(statusColors[c.status] ?? "bg-gray-100 text-gray-600") + " text-[10px]"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
