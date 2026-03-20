"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  Image,
  Ruler,
  Hash,
  Clock,
  User,
  Filter,
} from "lucide-react"
import { Input } from "@/components/ui/input"

type InstallStatus = "pendiente" | "en_proceso" | "instalada" | "verificada"

const mockInstalaciones = [
  {
    id: "1",
    nombre: "Cubierta Cocina Depto 401",
    material: "Calacatta Gold",
    dimensiones: "240 x 60 cm",
    sku: "CK-CAL-001",
    estatus: "pendiente" as InstallStatus,
    instalador: "Sin asignar",
    zona: "Piso 4 - Depto 401",
  },
  {
    id: "2",
    nombre: "Piso Vestíbulo A",
    material: "Nero Marquina",
    dimensiones: "60 x 60 cm",
    sku: "PV-NER-012",
    estatus: "en_proceso" as InstallStatus,
    instalador: "Roberto Sánchez",
    zona: "Planta Baja - Vestíbulo",
    progreso: 65,
  },
  {
    id: "3",
    nombre: "Encimera Baño Principal",
    material: "Calacatta Gold",
    dimensiones: "120 x 55 cm",
    sku: "EB-CAL-003",
    estatus: "instalada" as InstallStatus,
    instalador: "Roberto Sánchez",
    zona: "Piso 4 - Depto 401",
    fechaInstalacion: "18 Mar 2026",
  },
  {
    id: "4",
    nombre: "Muro Decorativo Lobby",
    material: "Blanco Carrara",
    dimensiones: "240 x 120 cm",
    sku: "MD-BLC-007",
    estatus: "verificada" as InstallStatus,
    instalador: "Carlos Mendoza",
    zona: "Planta Baja - Lobby",
    fechaInstalacion: "16 Mar 2026",
    fechaVerificacion: "17 Mar 2026",
  },
  {
    id: "5",
    nombre: "Barra Cocina Depto 502",
    material: "Emperador Dark",
    dimensiones: "300 x 65 cm",
    sku: "BC-EMP-002",
    estatus: "pendiente" as InstallStatus,
    instalador: "Sin asignar",
    zona: "Piso 5 - Depto 502",
  },
]

const statusConfig: Record<InstallStatus, { label: string; color: string }> = {
  pendiente: { label: "PENDIENTE", color: "bg-marble-200 text-marble-600" },
  en_proceso: { label: "EN PROCESO", color: "bg-blue-400/15 text-blue-400" },
  instalada: { label: "INSTALADA", color: "bg-semaforo-amarillo/15 text-semaforo-amarillo" },
  verificada: { label: "VERIFICADA", color: "bg-semaforo-verde/15 text-semaforo-verde" },
}

export default function InstalacionesPage() {
  const [filter, setFilter] = useState<"todas" | InstallStatus>("todas")

  const filtered = mockInstalaciones.filter(
    (p) => filter === "todas" || p.estatus === filter
  )

  const pendientes = mockInstalaciones.filter((p) => p.estatus === "pendiente").length
  const enProceso = mockInstalaciones.filter((p) => p.estatus === "en_proceso").length
  const instaladas = mockInstalaciones.filter((p) => p.estatus === "instalada").length
  const verificadas = mockInstalaciones.filter((p) => p.estatus === "verificada").length

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/obra/dashboard" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Instalaciones</h1>
            <p className="text-xs text-marble-400">Torre Lujo - Etapa 4</p>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-500" />
          <Input
            placeholder="Buscar pieza o zona..."
            className="h-10 rounded-xl border-marble-700 bg-marble-900 pl-9 text-sm text-white placeholder:text-marble-500 focus:border-golden focus:ring-golden"
          />
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 py-4">
          <div className="rounded-xl border border-marble-200 bg-white px-2 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-marble-600">{pendientes}</p>
            <p className="text-[8px] font-medium tracking-wide text-marble-500">PENDIENTE</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white px-2 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-blue-400">{enProceso}</p>
            <p className="text-[8px] font-medium tracking-wide text-marble-500">EN PROCESO</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white px-2 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-semaforo-amarillo">{instaladas}</p>
            <p className="text-[8px] font-medium tracking-wide text-marble-500">INSTALADA</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white px-2 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-semaforo-verde">{verificadas}</p>
            <p className="text-[8px] font-medium tracking-wide text-marble-500">VERIFICADA</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto mb-4 -mx-5 px-5 no-scrollbar">
          {([
            { key: "todas", label: "Todas" },
            { key: "pendiente", label: "Pendientes" },
            { key: "en_proceso", label: "En Proceso" },
            { key: "instalada", label: "Instaladas" },
            { key: "verificada", label: "Verificadas" },
          ] as { key: "todas" | InstallStatus; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.key
                  ? "bg-marble-950 text-white"
                  : "bg-marble-200 text-marble-600 active:bg-marble-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map((pieza) => {
            const status = statusConfig[pieza.estatus]
            return (
              <div
                key={pieza.id}
                className="overflow-hidden rounded-xl border border-marble-200 bg-white shadow-sm"
              >
                <div className="flex gap-3 p-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-marble-100">
                    <Image className="h-6 w-6 text-marble-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-marble-900 truncate">{pieza.nombre}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-golden">{pieza.material}</p>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-marble-400">
                      <span className="flex items-center gap-0.5">
                        <Ruler className="h-3 w-3" /> {pieza.dimensiones}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <User className="h-3 w-3" /> {pieza.instalador}
                      </span>
                      <span>{pieza.zona}</span>
                    </div>

                    {/* Progress bar for en_proceso */}
                    {"progreso" in pieza && pieza.progreso !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] text-marble-500 mb-1">
                          <span>Progreso</span>
                          <span className="font-medium text-blue-400">{pieza.progreso}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-marble-100">
                          <div
                            className="h-1.5 rounded-full bg-blue-400 transition-all"
                            style={{ width: `${pieza.progreso}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action */}
                {pieza.estatus === "instalada" && (
                  <div className="border-t border-marble-100 px-4 py-2.5">
                    <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-golden/10 py-2 text-xs font-semibold text-golden active:bg-golden/20 transition-colors">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verificar Instalación
                    </button>
                  </div>
                )}
                {pieza.estatus === "verificada" && (
                  <div className="border-t border-marble-100 px-4 py-2.5">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-semaforo-verde">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verificada el {pieza.fechaVerificacion}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
