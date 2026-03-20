"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Hammer,
  Image,
  Info,
  Camera,
  Ruler,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Filter,
} from "lucide-react"

type PiezaWorkStatus = "por_iniciar" | "en_proceso" | "pausada" | "completada" | "bloqueada"

const mockPiezas = [
  {
    id: "1",
    tipo: "CORTE DIAMANTE",
    numero: "#2849",
    nombre: "Encimera Calacatta Gold",
    obra: "Torre Lujo - Etapa 4",
    medidas: "240 x 60 x 3 cm",
    acabado: "Pulido Espejo",
    estatus: "por_iniciar" as PiezaWorkStatus,
    prioridad: "alta",
  },
  {
    id: "2",
    tipo: "PULIDO",
    numero: "#2847",
    nombre: "Cubierta Nero Marquina",
    obra: "Residencial Playa",
    medidas: "180 x 55 x 2 cm",
    acabado: "Mate",
    estatus: "en_proceso" as PiezaWorkStatus,
    prioridad: "media",
    tiempoTranscurrido: "2h 15m",
  },
  {
    id: "3",
    tipo: "CORTE CNC",
    numero: "#2846",
    nombre: "Lavabo Integrado Carrara",
    obra: "Torre Lujo - Etapa 4",
    medidas: "80 x 50 x 3 cm",
    acabado: "Pulido Espejo",
    estatus: "pausada" as PiezaWorkStatus,
    prioridad: "alta",
    tiempoTranscurrido: "1h 30m",
    motivo: "Cambio de disco",
  },
  {
    id: "4",
    tipo: "ACABADO BORDES",
    numero: "#2844",
    nombre: "Muro Blanco Carrara",
    obra: "Hotel Grand Paradise",
    medidas: "240 x 120 x 2 cm",
    acabado: "Biselado",
    estatus: "completada" as PiezaWorkStatus,
    prioridad: "baja",
    tiempoTotal: "4h 20m",
  },
  {
    id: "5",
    tipo: "CORTE DIAMANTE",
    numero: "#2843",
    nombre: "Piso Emperador Dark",
    obra: "Residencial Playa",
    medidas: "60 x 60 x 2 cm",
    acabado: "Pulido",
    estatus: "bloqueada" as PiezaWorkStatus,
    prioridad: "media",
    motivo: "En espera de material",
  },
]

const statusConfig: Record<PiezaWorkStatus, { label: string; color: string; bg: string }> = {
  por_iniciar: { label: "POR INICIAR", color: "text-golden", bg: "bg-golden/15" },
  en_proceso: { label: "EN PROCESO", color: "text-blue-400", bg: "bg-blue-400/15" },
  pausada: { label: "PAUSADA", color: "text-semaforo-amarillo", bg: "bg-semaforo-amarillo/15" },
  completada: { label: "COMPLETADA", color: "text-semaforo-verde", bg: "bg-semaforo-verde/15" },
  bloqueada: { label: "BLOQUEADA", color: "text-semaforo-rojo", bg: "bg-semaforo-rojo/15" },
}

const prioridadConfig = {
  alta: "border-l-semaforo-rojo",
  media: "border-l-semaforo-amarillo",
  baja: "border-l-semaforo-verde",
}

export default function ObraMarmoleroPage() {
  const [filter, setFilter] = useState<"todas" | PiezaWorkStatus>("todas")

  const filtered = mockPiezas.filter(
    (p) => filter === "todas" || p.estatus === filter
  )

  return (
    <div className="min-h-screen bg-marble-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-marble-950/95 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link href="/marmolero/asistencia" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Piezas Asignadas</h1>
            <p className="text-xs text-marble-400">Sector A - Nave 2</p>
          </div>
          <span className="rounded-full bg-golden/15 px-2.5 py-0.5 text-xs font-bold text-golden">
            {mockPiezas.length}
          </span>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {([
            { count: mockPiezas.filter(p => p.estatus === "por_iniciar").length, label: "Inicio", color: "text-golden" },
            { count: mockPiezas.filter(p => p.estatus === "en_proceso").length, label: "Proceso", color: "text-blue-400" },
            { count: mockPiezas.filter(p => p.estatus === "pausada").length, label: "Pausa", color: "text-semaforo-amarillo" },
            { count: mockPiezas.filter(p => p.estatus === "completada").length, label: "Hecho", color: "text-semaforo-verde" },
            { count: mockPiezas.filter(p => p.estatus === "bloqueada").length, label: "Bloq.", color: "text-semaforo-rojo" },
          ]).map((s, i) => (
            <div key={i} className="rounded-lg bg-marble-900 px-2 py-2 text-center border border-marble-800">
              <p className={`text-base font-bold ${s.color}`}>{s.count}</p>
              <p className="text-[8px] font-medium text-marble-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto mb-4 -mx-5 px-5 no-scrollbar">
          {([
            { key: "todas", label: "Todas" },
            { key: "por_iniciar", label: "Por Iniciar" },
            { key: "en_proceso", label: "En Proceso" },
            { key: "pausada", label: "Pausadas" },
            { key: "completada", label: "Completadas" },
            { key: "bloqueada", label: "Bloqueadas" },
          ] as { key: "todas" | PiezaWorkStatus; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                filter === f.key
                  ? "bg-golden text-marble-950"
                  : "bg-marble-800 text-marble-400 active:bg-marble-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Pieza Cards */}
        <div className="space-y-3">
          {filtered.map((pieza) => {
            const pStatus = statusConfig[pieza.estatus]
            return (
              <div
                key={pieza.id}
                className={`rounded-2xl border border-marble-800 bg-marble-900 overflow-hidden border-l-4 ${prioridadConfig[pieza.prioridad as keyof typeof prioridadConfig]}`}
              >
                <div className="p-4">
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-golden/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-golden">
                      {pieza.tipo}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${pStatus.bg} ${pStatus.color}`}>
                        {pStatus.label}
                      </span>
                      <span className="text-xs font-semibold text-marble-500">{pieza.numero}</span>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-white">{pieza.nombre}</p>
                  <p className="text-xs text-marble-400">{pieza.obra}</p>

                  {/* Details */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] font-medium tracking-wider text-marble-500">MEDIDAS</p>
                      <p className="text-xs font-semibold text-marble-200">{pieza.medidas}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium tracking-wider text-marble-500">ACABADO</p>
                      <p className="text-xs font-semibold text-marble-200">{pieza.acabado}</p>
                    </div>
                  </div>

                  {/* Time / Motivo */}
                  {"tiempoTranscurrido" in pieza && pieza.tiempoTranscurrido && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-marble-400">
                      <Clock className="h-3 w-3" />
                      <span>Tiempo: <span className="font-medium text-marble-200">{pieza.tiempoTranscurrido}</span></span>
                    </div>
                  )}
                  {"tiempoTotal" in pieza && pieza.tiempoTotal && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-semaforo-verde">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Tiempo total: {pieza.tiempoTotal}</span>
                    </div>
                  )}
                  {"motivo" in pieza && pieza.motivo && pieza.estatus !== "completada" && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-semaforo-amarillo">
                      <AlertCircle className="h-3 w-3" />
                      <span>{pieza.motivo}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-3 flex gap-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-marble-800 active:bg-marble-700">
                      <Camera className="h-4 w-4 text-marble-400" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-marble-800 active:bg-marble-700">
                      <Info className="h-4 w-4 text-marble-400" />
                    </button>
                  </div>
                </div>

                {/* Main Action */}
                {pieza.estatus === "por_iniciar" && (
                  <button className="flex w-full items-center justify-center gap-2 bg-golden py-3 text-xs font-bold tracking-wide text-marble-950 active:bg-golden-dark transition-colors">
                    <Play className="h-4 w-4" />
                    INICIAR TRABAJO
                  </button>
                )}
                {pieza.estatus === "en_proceso" && (
                  <div className="flex border-t border-marble-800">
                    <button className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-semaforo-amarillo active:bg-marble-800 transition-colors">
                      <Pause className="h-3.5 w-3.5" />
                      Pausar
                    </button>
                    <div className="w-px bg-marble-800" />
                    <button className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-semaforo-verde active:bg-marble-800 transition-colors">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completar
                    </button>
                  </div>
                )}
                {pieza.estatus === "pausada" && (
                  <button className="flex w-full items-center justify-center gap-2 border-t border-marble-800 py-3 text-xs font-semibold text-blue-400 active:bg-marble-800 transition-colors">
                    <Play className="h-3.5 w-3.5" />
                    Reanudar Trabajo
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 text-center">
            <Hammer className="mx-auto h-10 w-10 text-marble-700" />
            <p className="mt-2 text-sm text-marble-500">No hay piezas con este filtro</p>
          </div>
        )}
      </div>
    </div>
  )
}
