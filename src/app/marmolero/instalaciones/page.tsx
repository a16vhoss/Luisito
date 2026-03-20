"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  CheckCircle2,
  Camera,
  MapPin,
  Clock,
  Image,
  Ruler,
  Wrench,
  AlertTriangle,
  ChevronRight,
} from "lucide-react"

type InstallEstatus = "asignada" | "en_camino" | "en_instalacion" | "completada"

const mockInstalaciones = [
  {
    id: "1",
    pieza: "Encimera Calacatta Gold",
    numero: "#2849",
    obra: "Torre Lujo - Etapa 4",
    ubicacion: "Piso 4 - Depto 401 - Cocina",
    medidas: "240 x 60 x 3 cm",
    estatus: "asignada" as InstallEstatus,
    fechaProgramada: "19 Mar 2026",
    hora: "10:00",
  },
  {
    id: "2",
    pieza: "Cubierta Nero Marquina",
    numero: "#2847",
    obra: "Residencial Playa",
    ubicacion: "Casa 12 - Baño Principal",
    medidas: "180 x 55 x 2 cm",
    estatus: "en_camino" as InstallEstatus,
    fechaProgramada: "19 Mar 2026",
    hora: "14:00",
  },
  {
    id: "3",
    pieza: "Lavabo Integrado Carrara",
    numero: "#2846",
    obra: "Torre Lujo - Etapa 4",
    ubicacion: "Piso 3 - Depto 302 - Baño",
    medidas: "80 x 50 x 3 cm",
    estatus: "en_instalacion" as InstallEstatus,
    fechaProgramada: "18 Mar 2026",
    hora: "09:00",
    tiempoInstalacion: "1h 45m",
  },
  {
    id: "4",
    pieza: "Muro Blanco Carrara",
    numero: "#2844",
    obra: "Hotel Grand Paradise",
    ubicacion: "Planta Baja - Lobby Principal",
    medidas: "240 x 120 x 2 cm",
    estatus: "completada" as InstallEstatus,
    fechaProgramada: "17 Mar 2026",
    hora: "08:00",
    tiempoTotal: "3h 20m",
  },
]

const statusConfig: Record<InstallEstatus, { label: string; color: string; bg: string }> = {
  asignada: { label: "ASIGNADA", color: "text-golden", bg: "bg-golden/15" },
  en_camino: { label: "EN CAMINO", color: "text-blue-400", bg: "bg-blue-400/15" },
  en_instalacion: { label: "EN INSTALACIÓN", color: "text-semaforo-amarillo", bg: "bg-semaforo-amarillo/15" },
  completada: { label: "COMPLETADA", color: "text-semaforo-verde", bg: "bg-semaforo-verde/15" },
}

export default function InstalacionesMarmoleroPage() {
  return (
    <div className="min-h-screen bg-marble-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-marble-950/95 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link href="/marmolero/asistencia" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Mis Instalaciones</h1>
            <p className="text-xs text-marble-400">Trabajos de instalación en obra</p>
          </div>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-1.5 mb-6">
          <div className="rounded-lg bg-marble-900 border border-marble-800 px-2 py-2.5 text-center">
            <p className="text-base font-bold text-golden">1</p>
            <p className="text-[8px] font-medium text-marble-500">ASIGNADA</p>
          </div>
          <div className="rounded-lg bg-marble-900 border border-marble-800 px-2 py-2.5 text-center">
            <p className="text-base font-bold text-blue-400">1</p>
            <p className="text-[8px] font-medium text-marble-500">EN CAMINO</p>
          </div>
          <div className="rounded-lg bg-marble-900 border border-marble-800 px-2 py-2.5 text-center">
            <p className="text-base font-bold text-semaforo-amarillo">1</p>
            <p className="text-[8px] font-medium text-marble-500">INSTALANDO</p>
          </div>
          <div className="rounded-lg bg-marble-900 border border-marble-800 px-2 py-2.5 text-center">
            <p className="text-base font-bold text-semaforo-verde">1</p>
            <p className="text-[8px] font-medium text-marble-500">COMPLETA</p>
          </div>
        </div>

        {/* Installation Cards */}
        <div className="space-y-3">
          {mockInstalaciones.map((inst) => {
            const status = statusConfig[inst.estatus]
            return (
              <div
                key={inst.id}
                className="rounded-2xl border border-marble-800 bg-marble-900 overflow-hidden"
              >
                <div className="p-4">
                  {/* Status + Number */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-xs font-semibold text-marble-500">{inst.numero}</span>
                  </div>

                  <p className="text-sm font-bold text-white">{inst.pieza}</p>

                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-marble-400 flex items-center gap-1.5">
                      <Wrench className="h-3 w-3 text-marble-500" />
                      {inst.obra}
                    </p>
                    <p className="text-xs text-marble-400 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-marble-500" />
                      {inst.ubicacion}
                    </p>
                    <p className="text-xs text-marble-400 flex items-center gap-1.5">
                      <Ruler className="h-3 w-3 text-marble-500" />
                      {inst.medidas}
                    </p>
                    <p className="text-xs text-marble-400 flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-marble-500" />
                      {inst.fechaProgramada} a las {inst.hora}
                    </p>
                  </div>

                  {/* Time tracking */}
                  {"tiempoInstalacion" in inst && inst.tiempoInstalacion && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-semaforo-amarillo/10 px-3 py-1.5">
                      <Clock className="h-3 w-3 text-semaforo-amarillo" />
                      <span className="text-[11px] font-medium text-semaforo-amarillo">
                        Tiempo en instalación: {inst.tiempoInstalacion}
                      </span>
                    </div>
                  )}
                  {"tiempoTotal" in inst && inst.tiempoTotal && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-semaforo-verde/10 px-3 py-1.5">
                      <CheckCircle2 className="h-3 w-3 text-semaforo-verde" />
                      <span className="text-[11px] font-medium text-semaforo-verde">
                        Tiempo total: {inst.tiempoTotal}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions based on status */}
                {inst.estatus === "asignada" && (
                  <button className="flex w-full items-center justify-center gap-2 bg-golden py-3 text-xs font-bold tracking-wide text-marble-950 active:bg-golden-dark transition-colors">
                    <Wrench className="h-4 w-4" />
                    INICIAR INSTALACIÓN
                  </button>
                )}

                {inst.estatus === "en_camino" && (
                  <button className="flex w-full items-center justify-center gap-2 border-t border-marble-800 py-3 text-xs font-semibold text-blue-400 active:bg-marble-800 transition-colors">
                    <MapPin className="h-3.5 w-3.5" />
                    Confirmar Llegada a Obra
                  </button>
                )}

                {inst.estatus === "en_instalacion" && (
                  <div className="flex border-t border-marble-800">
                    <button className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-marble-400 active:bg-marble-800 transition-colors">
                      <Camera className="h-3.5 w-3.5" />
                      Tomar Foto
                    </button>
                    <div className="w-px bg-marble-800" />
                    <button className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-semaforo-amarillo active:bg-marble-800 transition-colors">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Reportar
                    </button>
                    <div className="w-px bg-marble-800" />
                    <button className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-semaforo-verde active:bg-marble-800 transition-colors">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completar
                    </button>
                  </div>
                )}

                {inst.estatus === "completada" && (
                  <div className="flex items-center justify-center gap-1.5 border-t border-marble-800 py-3 text-xs font-medium text-semaforo-verde">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Instalación Completada
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-medium tracking-widest text-marble-600">
            SECTOR A &bull; NAVE 2
          </p>
        </div>
      </div>
    </div>
  )
}
