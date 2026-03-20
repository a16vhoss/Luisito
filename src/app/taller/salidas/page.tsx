"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  User,
  MapPin,
  Filter,
} from "lucide-react"
import { Input } from "@/components/ui/input"

const mockSalidas = [
  {
    id: "1",
    tipo: "salida" as const,
    material: "Calacatta Gold - Lámina #L-089",
    cantidad: "3 piezas cortadas",
    destino: "Torre Lujo - Etapa 4",
    responsable: "Juan Pérez",
    remision: "REM #29441",
    fecha: "19 Mar 2026",
    hora: "08:15",
  },
  {
    id: "2",
    tipo: "salida" as const,
    material: "Nero Marquina - Lámina #L-076",
    cantidad: "8 piezas cortadas",
    destino: "Torre Lujo - Etapa 4",
    responsable: "Juan Pérez",
    remision: "REM #29440",
    fecha: "19 Mar 2026",
    hora: "07:00",
  },
  {
    id: "3",
    tipo: "entrada" as const,
    material: "Travertino Navona - Lote Nuevo",
    cantidad: "5 láminas completas",
    destino: "Almacén Principal",
    responsable: "Miguel Torres",
    remision: "OC #1234",
    fecha: "18 Mar 2026",
    hora: "16:30",
  },
  {
    id: "4",
    tipo: "salida" as const,
    material: "Blanco Carrara - Lámina #L-063",
    cantidad: "15 piezas cortadas",
    destino: "Residencial Playa",
    responsable: "Juan Pérez",
    remision: "REM #29439",
    fecha: "18 Mar 2026",
    hora: "09:45",
  },
  {
    id: "5",
    tipo: "entrada" as const,
    material: "Disco Diamante 350mm",
    cantidad: "10 unidades",
    destino: "Almacén Herramientas",
    responsable: "Carlos Mendoza",
    remision: "OC #1233",
    fecha: "17 Mar 2026",
    hora: "14:20",
  },
]

export default function SalidasPage() {
  const [filter, setFilter] = useState<"todas" | "entrada" | "salida">("todas")

  const filtered = mockSalidas.filter(
    (s) => filter === "todas" || s.tipo === filter
  )

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/taller/dashboard" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Salida de Material</h1>
            <p className="text-xs text-marble-400">Movimientos de almacén</p>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-500" />
          <Input
            placeholder="Buscar material, remisión..."
            className="h-10 rounded-xl border-marble-700 bg-marble-900 pl-9 text-sm text-white placeholder:text-marble-500 focus:border-golden focus:ring-golden"
          />
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 py-4">
          <div className="rounded-xl border border-marble-200 bg-white px-3 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-marble-900">24</p>
            <p className="text-[10px] font-medium tracking-wide text-marble-500">HOY</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white px-3 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-semaforo-rojo">18</p>
            <p className="text-[10px] font-medium tracking-wide text-marble-500">SALIDAS</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white px-3 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-semaforo-verde">6</p>
            <p className="text-[10px] font-medium tracking-wide text-marble-500">ENTRADAS</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {([
            { key: "todas", label: "Todas" },
            { key: "salida", label: "Salidas" },
            { key: "entrada", label: "Entradas" },
          ] as { key: "todas" | "entrada" | "salida"; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
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
        <div className="space-y-2">
          {filtered.map((mov) => (
            <div
              key={mov.id}
              className="rounded-xl border border-marble-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    mov.tipo === "salida"
                      ? "bg-semaforo-rojo/10"
                      : "bg-semaforo-verde/10"
                  }`}
                >
                  {mov.tipo === "salida" ? (
                    <ArrowUpRight className="h-4 w-4 text-semaforo-rojo" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4 text-semaforo-verde" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-marble-900">{mov.material}</p>
                  </div>
                  <p className="text-xs font-medium text-marble-600">{mov.cantidad}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-marble-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {mov.destino}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {mov.responsable}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" /> {mov.remision}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {mov.fecha} {mov.hora}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
