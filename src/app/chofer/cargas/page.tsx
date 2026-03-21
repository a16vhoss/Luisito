"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  UserCircle,
  Forklift,
  Fuel,
  Camera,
  MapPin,
  Clock,
  ChevronRight,
  Truck,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const estatusConfig: Record<string, { label: string; color: string }> = {
  creada: { label: "PENDIENTE", color: "bg-marble-700 text-marble-300" },
  en_transito: { label: "EN TRÁNSITO", color: "bg-semaforo-amarillo/20 text-semaforo-amarillo" },
  entregada: { label: "ENTREGADA", color: "bg-semaforo-verde/20 text-semaforo-verde" },
}

export default function CargasPage() {
  const [loading, setLoading] = useState(true)
  const [cargas, setCargas] = useState<any[]>([])
  const [userName, setUserName] = useState("")
  const [vehiculo, setVehiculo] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const userId = user.id

      // Fetch user info
      const { data: userData } = await supabase
        .from("users")
        .select("nombre")
        .eq("id", userId)
        .single()

      if (userData) setUserName(userData.nombre || "")

      // Fetch assigned vehicle
      const { data: vehiculoData } = await supabase
        .from("vehiculos")
        .select("*")
        .eq("chofer_asignado_id", userId)
        .single()

      if (vehiculoData) setVehiculo(vehiculoData)

      // Fetch remisiones
      const { data: remisiones } = await supabase
        .from("remisiones")
        .select("*, obra:obras(nombre, ubicacion), items:remision_items(cantidad, concepto:conceptos_obra(tipo_pieza, material_tipo))")
        .eq("chofer_id", userId)
        .in("estatus", ["creada", "en_transito"])
        .order("created_at", { ascending: false })

      setCargas(remisiones || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const firstName = userName.split(" ")[0] || "Chofer"
  const initials = userName
    ? userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "CH"

  if (loading) {
    return (
      <div className="min-h-screen bg-marble-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-golden" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-marble-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-marble-950/95 backdrop-blur-lg">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-marble-900">
              <span className="text-xs font-bold text-golden">MC</span>
            </div>
            <span className="text-sm font-bold tracking-widest text-marble-200">
              MÁRMOL CALIBE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-2 text-marble-400 active:bg-marble-800">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-semaforo-rojo" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-golden text-xs font-bold text-marble-950">
              {initials}
            </div>
          </div>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Status badge */}
        {cargas.some((c) => c.estatus === "en_transito") && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-semaforo-verde/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-semaforo-verde">
              <span className="h-1.5 w-1.5 rounded-full bg-semaforo-verde animate-pulse" />
              RUTA EN CURSO
            </span>
          </div>
        )}

        {/* Greeting */}
        <h1 className="text-2xl font-bold text-white">Hola, {firstName}</h1>
        {vehiculo && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-marble-400">
            <Truck className="h-4 w-4" />
            Unidad: {vehiculo.marca} {vehiculo.modelo || ""} <span className="text-golden font-medium">[{vehiculo.placas}]</span>
          </p>
        )}

        {/* Action Cards */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Link
            href="/chofer/cargas"
            className="relative flex flex-col items-center gap-2 rounded-2xl bg-marble-900 p-4 py-5 active:bg-marble-800 transition-colors border border-marble-800"
          >
            {cargas.length > 0 && (
              <div className="absolute -top-2 -right-1">
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-semaforo-rojo px-1.5 text-[10px] font-bold text-white">
                  {cargas.length}
                </span>
              </div>
            )}
            <Forklift className="h-8 w-8 text-golden" />
            <span className="text-[11px] font-semibold tracking-wide text-marble-200">
              MIS CARGAS
            </span>
          </Link>

          <Link
            href="/chofer/gasolina"
            className="flex flex-col items-center gap-2 rounded-2xl bg-marble-900 p-4 py-5 active:bg-marble-800 transition-colors border border-marble-800"
          >
            <Fuel className="h-8 w-8 text-golden" />
            <span className="text-[11px] font-semibold tracking-wide text-marble-200">
              GASOLINA
            </span>
          </Link>

          <Link
            href="/chofer/fotos"
            className="flex flex-col items-center gap-2 rounded-2xl bg-marble-900 p-4 py-5 active:bg-marble-800 transition-colors border border-marble-800"
          >
            <Camera className="h-8 w-8 text-golden" />
            <span className="text-[11px] font-semibold tracking-wide text-marble-200">
              FOTOS
            </span>
          </Link>
        </div>

        {/* Today's Deliveries */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-widest text-marble-500 uppercase">
              Entregas Pendientes
            </h2>
            <span className="text-xs text-golden font-medium">{cargas.length} pendientes</span>
          </div>

          {cargas.length === 0 ? (
            <div className="rounded-2xl border border-marble-800 bg-marble-900 p-8 text-center">
              <Forklift className="mx-auto h-10 w-10 text-marble-700" />
              <p className="mt-3 text-sm font-medium text-marble-400">Sin cargas pendientes</p>
              <p className="mt-1 text-xs text-marble-600">No tienes remisiones asignadas por el momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cargas.map((carga) => {
                const status = estatusConfig[carga.estatus] || estatusConfig.creada
                const obraNombre = carga.obra?.nombre || "Sin obra"
                const obraUbicacion = carga.obra?.ubicacion || ""
                const totalPiezas = carga.items?.reduce((sum: number, item: any) => sum + (item.cantidad || 0), 0) || 0
                const materiales = carga.items?.map((item: any) => item.concepto?.tipo_pieza || item.concepto?.material_tipo).filter(Boolean).join(", ") || ""

                return (
                  <div
                    key={carga.id}
                    className="rounded-2xl border border-marble-800 bg-marble-900 p-4 active:bg-marble-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">REM #{carga.folio || carga.id?.slice(0, 5)}</p>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-marble-300">{obraNombre}</p>
                        {obraUbicacion && (
                          <p className="mt-0.5 text-[11px] text-marble-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {obraUbicacion}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-marble-600 mt-1 shrink-0" />
                    </div>
                    <div className="mt-3 flex items-center gap-4 border-t border-marble-800 pt-3 text-[11px] text-marble-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(carga.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {totalPiezas > 0 && <span>{totalPiezas} piezas</span>}
                      {materiales && <span className="truncate max-w-[140px]">{materiales}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
