"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Camera,
  Image,
  Upload,
  Filter,
  Clock,
  User,
  Eye,
  Trash2,
} from "lucide-react"

type FotoCategory = "todas" | "recepcion" | "instalacion" | "verificacion" | "dano"

const mockFotos = [
  {
    id: "1",
    categoria: "instalacion" as const,
    pieza: "Cubierta Cocina Depto 401",
    zona: "Piso 4 - Depto 401",
    subidoPor: "Roberto Sánchez",
    fecha: "19 Mar 2026",
    hora: "09:45",
    count: 3,
  },
  {
    id: "2",
    categoria: "recepcion" as const,
    pieza: "REM #29441 - Calacatta Gold",
    zona: "Área de Recepción",
    subidoPor: "Mario Reyes",
    fecha: "19 Mar 2026",
    hora: "10:30",
    count: 5,
  },
  {
    id: "3",
    categoria: "verificacion" as const,
    pieza: "Muro Decorativo Lobby",
    zona: "Planta Baja - Lobby",
    subidoPor: "Mario Reyes",
    fecha: "17 Mar 2026",
    hora: "14:20",
    count: 4,
  },
  {
    id: "4",
    categoria: "dano" as const,
    pieza: "Piso Baño Secundario",
    zona: "Piso 3 - Depto 302",
    subidoPor: "Mario Reyes",
    fecha: "16 Mar 2026",
    hora: "11:00",
    count: 2,
  },
  {
    id: "5",
    categoria: "instalacion" as const,
    pieza: "Encimera Baño Principal",
    zona: "Piso 4 - Depto 401",
    subidoPor: "Roberto Sánchez",
    fecha: "16 Mar 2026",
    hora: "16:15",
    count: 3,
  },
]

const categoryConfig = {
  recepcion: { label: "RECEPCIÓN", color: "bg-blue-400/15 text-blue-400" },
  instalacion: { label: "INSTALACIÓN", color: "bg-golden/15 text-golden" },
  verificacion: { label: "VERIFICACIÓN", color: "bg-semaforo-verde/15 text-semaforo-verde" },
  dano: { label: "DAÑO", color: "bg-semaforo-rojo/15 text-semaforo-rojo" },
}

export default function FotosObraPage() {
  const [filter, setFilter] = useState<FotoCategory>("todas")

  const filtered = mockFotos.filter(
    (f) => filter === "todas" || f.categoria === filter
  )

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/obra/dashboard" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Evidencia Fotográfica</h1>
            <p className="text-xs text-marble-400">Torre Lujo - Etapa 4</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-golden active:bg-golden-dark">
            <Camera className="h-5 w-5 text-marble-950" />
          </button>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Stats bar */}
        <div className="flex items-center justify-between py-4">
          <p className="text-sm font-medium text-marble-700">
            <span className="font-bold text-marble-900">{mockFotos.reduce((s, f) => s + f.count, 0)}</span> fotos totales
          </p>
          <p className="text-xs text-marble-400">{mockFotos.length} registros</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto mb-4 -mx-5 px-5 no-scrollbar">
          {([
            { key: "todas", label: "Todas" },
            { key: "recepcion", label: "Recepción" },
            { key: "instalacion", label: "Instalación" },
            { key: "verificacion", label: "Verificación" },
            { key: "dano", label: "Daño" },
          ] as { key: FotoCategory; label: string }[]).map((f) => (
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

        {/* Upload area */}
        <button className="mb-4 flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-marble-300 bg-marble-100/50 p-4 active:bg-marble-100 transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-golden/10">
            <Upload className="h-5 w-5 text-golden" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-marble-700">Subir Fotos</p>
            <p className="text-xs text-marble-400">Tomar o seleccionar desde galería</p>
          </div>
        </button>

        {/* Photo Groups */}
        <div className="space-y-3">
          {filtered.map((foto) => {
            const cat = categoryConfig[foto.categoria]
            return (
              <div
                key={foto.id}
                className="overflow-hidden rounded-xl border border-marble-200 bg-white shadow-sm"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.color}`}>
                          {cat.label}
                        </span>
                        <span className="text-xs text-marble-400">{foto.count} fotos</span>
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-marble-900">{foto.pieza}</p>
                      <p className="text-xs text-marble-500">{foto.zona}</p>
                    </div>
                  </div>

                  {/* Thumbnail grid */}
                  <div className="mt-3 flex gap-1.5">
                    {Array.from({ length: Math.min(foto.count, 4) }).map((_, i) => (
                      <div
                        key={i}
                        className="relative flex h-16 flex-1 items-center justify-center rounded-lg bg-marble-100"
                      >
                        <Image className="h-5 w-5 text-marble-300" />
                        {i === 3 && foto.count > 4 && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-marble-900/60">
                            <span className="text-xs font-bold text-white">+{foto.count - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-[11px] text-marble-400">
                    <span className="flex items-center gap-0.5">
                      <User className="h-3 w-3" /> {foto.subidoPor}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" /> {foto.fecha} {foto.hora}
                    </span>
                  </div>
                </div>

                <div className="flex border-t border-marble-100">
                  <button className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-marble-600 active:bg-marble-50 transition-colors">
                    <Eye className="h-3.5 w-3.5" />
                    Ver Todas
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
