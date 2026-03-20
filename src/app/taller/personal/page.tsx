"use client"

import React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
  Users,
} from "lucide-react"
import { Input } from "@/components/ui/input"

const mockPersonal = [
  {
    id: "1",
    nombre: "Roberto Sánchez",
    puesto: "Marmolero - Corte",
    sector: "Sector A - Nave 1",
    entrada: "07:02",
    estatus: "presente" as const,
  },
  {
    id: "2",
    nombre: "Carlos Mendoza",
    puesto: "Marmolero - Pulido",
    sector: "Sector A - Nave 2",
    entrada: "07:05",
    estatus: "presente" as const,
  },
  {
    id: "3",
    nombre: "José Ramírez",
    puesto: "Marmolero - Instalación",
    sector: "Sector B - Nave 1",
    entrada: "07:15",
    estatus: "retardo" as const,
  },
  {
    id: "4",
    nombre: "Luis Hernández",
    puesto: "Marmolero - Corte",
    sector: "Sector A - Nave 1",
    entrada: null,
    estatus: "falta" as const,
  },
  {
    id: "5",
    nombre: "Pedro García",
    puesto: "Marmolero - Acabado",
    sector: "Sector B - Nave 2",
    entrada: "07:00",
    estatus: "presente" as const,
  },
  {
    id: "6",
    nombre: "Francisco López",
    puesto: "Marmolero - Corte",
    sector: "Sector A - Nave 2",
    entrada: null,
    estatus: "permiso" as const,
  },
  {
    id: "7",
    nombre: "Antonio Díaz",
    puesto: "Ayudante General",
    sector: "Sector A - Nave 1",
    entrada: "06:58",
    estatus: "presente" as const,
  },
  {
    id: "8",
    nombre: "Manuel Ruiz",
    puesto: "Marmolero - Pulido",
    sector: "Sector B - Nave 1",
    entrada: "07:01",
    estatus: "presente" as const,
  },
]

const estatusConfig = {
  presente: { label: "Presente", icon: UserCheck, color: "text-semaforo-verde", bg: "bg-semaforo-verde/10" },
  retardo: { label: "Retardo", icon: Clock, color: "text-semaforo-amarillo", bg: "bg-semaforo-amarillo/10" },
  falta: { label: "Falta", icon: UserX, color: "text-semaforo-rojo", bg: "bg-semaforo-rojo/10" },
  permiso: { label: "Permiso", icon: AlertCircle, color: "text-blue-400", bg: "bg-blue-400/10" },
}

export default function PersonalPage() {
  const presentes = mockPersonal.filter((p) => p.estatus === "presente").length
  const retardos = mockPersonal.filter((p) => p.estatus === "retardo").length
  const faltas = mockPersonal.filter((p) => p.estatus === "falta").length
  const permisos = mockPersonal.filter((p) => p.estatus === "permiso").length

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/taller/dashboard" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Personal Planta</h1>
            <p className="text-xs text-marble-400">Asistencia de hoy</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-marble-800 px-3 py-1.5">
            <Users className="h-3.5 w-3.5 text-golden" />
            <span className="text-xs font-semibold text-white">{mockPersonal.length}</span>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-500" />
          <Input
            placeholder="Buscar personal..."
            className="h-10 rounded-xl border-marble-700 bg-marble-900 pl-9 text-sm text-white placeholder:text-marble-500 focus:border-golden focus:ring-golden"
          />
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 py-4">
          <div className="rounded-xl border border-marble-200 bg-white px-2 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-semaforo-verde">{presentes}</p>
            <p className="text-[9px] font-medium tracking-wide text-marble-500">PRESENTES</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white px-2 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-semaforo-amarillo">{retardos}</p>
            <p className="text-[9px] font-medium tracking-wide text-marble-500">RETARDOS</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white px-2 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-semaforo-rojo">{faltas}</p>
            <p className="text-[9px] font-medium tracking-wide text-marble-500">FALTAS</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white px-2 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-blue-400">{permisos}</p>
            <p className="text-[9px] font-medium tracking-wide text-marble-500">PERMISOS</p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {mockPersonal.map((persona) => {
            const status = estatusConfig[persona.estatus]
            const StatusIcon = status.icon
            return (
              <div
                key={persona.id}
                className="flex items-center gap-3 rounded-xl border border-marble-200 bg-white p-4 shadow-sm"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${status.bg}`}>
                  <StatusIcon className={`h-5 w-5 ${status.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-marble-900 truncate">
                    {persona.nombre}
                  </p>
                  <p className="text-xs text-marble-500">{persona.puesto}</p>
                  <p className="text-[11px] text-marble-400">{persona.sector}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                  {persona.entrada && (
                    <p className="text-[11px] text-marble-400 flex items-center gap-0.5 justify-end mt-0.5">
                      <Clock className="h-3 w-3" /> {persona.entrada}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
