"use client"

import React from "react"
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
} from "lucide-react"

// Mock data
const mockCargas = [
  {
    id: "1",
    folio: "REM #29441",
    obra: "Torre Lujo - Etapa 4",
    direccion: "Av. Bonampak 123, Cancún",
    piezas: 12,
    m2: 34.5,
    estatus: "en_transito" as const,
    hora_salida: "08:30",
  },
  {
    id: "2",
    folio: "REM #29442",
    obra: "Residencial Playa",
    direccion: "Blvd. Kukulcán Km 12, Cancún",
    piezas: 8,
    m2: 22.1,
    estatus: "creada" as const,
    hora_salida: "11:00",
  },
  {
    id: "3",
    folio: "REM #29443",
    obra: "Hotel Grand Paradise",
    direccion: "Av. Tulum 300, Cancún",
    piezas: 15,
    m2: 41.8,
    estatus: "creada" as const,
    hora_salida: "14:30",
  },
]

const estatusConfig = {
  creada: { label: "PENDIENTE", color: "bg-marble-700 text-marble-300" },
  en_transito: { label: "EN TRÁNSITO", color: "bg-semaforo-amarillo/20 text-semaforo-amarillo" },
  entregada: { label: "ENTREGADA", color: "bg-semaforo-verde/20 text-semaforo-verde" },
}

export default function CargasPage() {
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
              RG
            </div>
          </div>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Status badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-semaforo-verde/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-semaforo-verde">
            <span className="h-1.5 w-1.5 rounded-full bg-semaforo-verde animate-pulse" />
            RUTA EN CURSO
          </span>
        </div>

        {/* Greeting */}
        <h1 className="text-2xl font-bold text-white">Hola, Rodrigo</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-marble-400">
          <Truck className="h-4 w-4" />
          Unidad: KENWORTH T680 <span className="text-golden font-medium">[M-452]</span>
        </p>

        {/* Action Cards */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Link
            href="/chofer/cargas"
            className="relative flex flex-col items-center gap-2 rounded-2xl bg-marble-900 p-4 py-5 active:bg-marble-800 transition-colors border border-marble-800"
          >
            <div className="absolute -top-2 -right-1">
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-semaforo-rojo px-1.5 text-[10px] font-bold text-white">
                3
              </span>
            </div>
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

        {/* Last Delivery */}
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-marble-500 uppercase">
            Último Registro
          </h2>
          <div className="rounded-2xl border border-marble-800 bg-marble-900 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-white">REM #29440</p>
                <p className="mt-0.5 text-xs text-marble-400">Torre Lujo - Etapa 4</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-semaforo-verde/15 px-2.5 py-0.5 text-[10px] font-semibold text-semaforo-verde">
                ENTREGADA
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-[11px] text-marble-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> 07:45
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Cancún Centro
              </span>
            </div>
          </div>
        </div>

        {/* Today's Deliveries */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-widest text-marble-500 uppercase">
              Entregas de Hoy
            </h2>
            <span className="text-xs text-golden font-medium">{mockCargas.length} pendientes</span>
          </div>

          <div className="space-y-3">
            {mockCargas.map((carga) => {
              const status = estatusConfig[carga.estatus]
              return (
                <div
                  key={carga.id}
                  className="rounded-2xl border border-marble-800 bg-marble-900 p-4 active:bg-marble-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{carga.folio}</p>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-marble-300">{carga.obra}</p>
                      <p className="mt-0.5 text-[11px] text-marble-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {carga.direccion}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-marble-600 mt-1 shrink-0" />
                  </div>
                  <div className="mt-3 flex items-center gap-4 border-t border-marble-800 pt-3 text-[11px] text-marble-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Salida: {carga.hora_salida}
                    </span>
                    <span>{carga.piezas} piezas</span>
                    <span>{carga.m2} m²</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
