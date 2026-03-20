"use client"

import React from "react"
import Link from "next/link"
import {
  Bell,
  Settings,
  Plus,
  ClipboardList,
  Users,
  ChevronRight,
  Clock,
  Package,
  Truck,
} from "lucide-react"

const mockRemisiones = [
  {
    id: "1",
    folio: "REM #29441",
    material: "Calacatta Gold",
    lote: "LOT-2024-089",
    piezas: 12,
    m2: 34.5,
    estatus: "en_transito" as const,
    hora: "08:30",
  },
  {
    id: "2",
    folio: "REM #29440",
    material: "Nero Marquina",
    lote: "LOT-2024-088",
    piezas: 8,
    m2: 22.1,
    estatus: "entregada" as const,
    hora: "07:15",
  },
  {
    id: "3",
    folio: "REM #29439",
    material: "Blanco Carrara",
    lote: "LOT-2024-087",
    piezas: 15,
    m2: 41.8,
    estatus: "creada" as const,
    hora: "Ayer",
  },
  {
    id: "4",
    folio: "REM #29438",
    material: "Emperador Dark",
    lote: "LOT-2024-086",
    piezas: 6,
    m2: 18.2,
    estatus: "entregada" as const,
    hora: "Ayer",
  },
]

const estatusConfig = {
  creada: { label: "CREADA", color: "bg-marble-200 text-marble-600" },
  en_transito: { label: "EN TRÁNSITO", color: "bg-semaforo-amarillo/15 text-semaforo-amarillo border border-semaforo-amarillo/30" },
  entregada: { label: "ENTREGADA", color: "bg-semaforo-verde/15 text-semaforo-verde border border-semaforo-verde/30" },
}

export default function TallerDashboardPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Dark Header */}
      <header className="bg-marble-950 px-5 pb-6 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-marble-900">
              <span className="text-xs font-bold text-golden">MC</span>
            </div>
            <span className="text-sm font-bold tracking-widest text-marble-200">
              MÁRMOL CALIBE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative rounded-full p-2 text-marble-400 active:bg-marble-800">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-semaforo-rojo" />
            </button>
            <button className="rounded-full p-2 text-marble-400 active:bg-marble-800">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-4">
          <h1 className="text-xl font-bold text-white">Jefe de Taller</h1>
          <p className="mt-0.5 text-xs tracking-wide text-marble-400">
            OPERACIONES PLANTA PRINCIPAL
          </p>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Nueva Remisión - Big Card */}
        <Link
          href="/taller/remisiones/nueva"
          className="-mt-3 flex items-center gap-4 rounded-2xl bg-marble-950 p-5 shadow-lg active:bg-marble-900 transition-colors"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-golden/15">
            <Plus className="h-7 w-7 text-golden" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-white">Nueva Remisión</p>
            <p className="mt-0.5 text-xs text-marble-400">
              Iniciar despacho de material
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-marble-600" />
        </Link>

        {/* Two Action Cards */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href="/taller/salidas"
            className="flex flex-col items-center gap-2 rounded-2xl border border-marble-200 bg-white p-5 shadow-sm active:bg-marble-50 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-marble-100">
              <ClipboardList className="h-6 w-6 text-marble-700" />
            </div>
            <p className="text-xs font-semibold text-marble-700">SALIDA MATERIAL</p>
          </Link>
          <Link
            href="/taller/personal"
            className="flex flex-col items-center gap-2 rounded-2xl border border-marble-200 bg-white p-5 shadow-sm active:bg-marble-50 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-marble-100">
              <Users className="h-6 w-6 text-marble-700" />
            </div>
            <p className="text-xs font-semibold text-marble-700">PERSONAL PLANTA</p>
          </Link>
        </div>

        {/* Remisiones Recientes */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-widest text-marble-500 uppercase">
              Remisiones Recientes
            </h2>
            <Link href="/taller/remisiones" className="text-xs font-medium text-golden">
              Ver todas
            </Link>
          </div>

          <div className="space-y-2">
            {mockRemisiones.map((rem) => {
              const status = estatusConfig[rem.estatus]
              return (
                <div
                  key={rem.id}
                  className="rounded-xl border border-marble-200 bg-white p-4 shadow-sm active:bg-marble-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-marble-900">{rem.folio}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-marble-700">{rem.material}</p>
                      <p className="text-xs text-marble-400">{rem.lote}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-marble-300 mt-0.5" />
                  </div>
                  <div className="mt-2 flex items-center gap-3 border-t border-marble-100 pt-2 text-[11px] text-marble-400">
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" /> {rem.piezas} piezas
                    </span>
                    <span>{rem.m2} m²</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {rem.hora}
                    </span>
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
