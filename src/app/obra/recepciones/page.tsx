"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  PackageCheck,
  Truck,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  Camera,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type RecepcionStatus = "pendiente" | "recibida" | "con_dano"

const initialRecepciones = [
  {
    id: "1",
    folio: "REM #29441",
    chofer: "Rodrigo Garcia",
    unidad: "KENWORTH T680 [M-452]",
    piezas: 12,
    m2: 34.5,
    material: "Calacatta Gold",
    fecha: "19 Mar 2026",
    hora: "10:30",
    estatus: "pendiente" as RecepcionStatus,
  },
  {
    id: "2",
    folio: "REM #29440",
    chofer: "Rodrigo Garcia",
    unidad: "KENWORTH T680 [M-452]",
    piezas: 8,
    m2: 22.1,
    material: "Nero Marquina",
    fecha: "19 Mar 2026",
    hora: "08:15",
    estatus: "recibida" as RecepcionStatus,
  },
  {
    id: "3",
    folio: "REM #29437",
    chofer: "Miguel Torres",
    unidad: "INTERNATIONAL LT [M-318]",
    piezas: 20,
    m2: 58.0,
    material: "Travertino Navona",
    fecha: "17 Mar 2026",
    hora: "15:45",
    estatus: "recibida" as RecepcionStatus,
  },
  {
    id: "4",
    folio: "REM #29435",
    chofer: "Rodrigo Garcia",
    unidad: "KENWORTH T680 [M-452]",
    piezas: 5,
    m2: 14.3,
    material: "Emperador Dark",
    fecha: "16 Mar 2026",
    hora: "11:20",
    estatus: "con_dano" as RecepcionStatus,
  },
]

const statusConfig: Record<RecepcionStatus, { label: string; color: string }> = {
  pendiente: { label: "PENDIENTE", color: "bg-semaforo-amarillo/15 text-semaforo-amarillo border border-semaforo-amarillo/30" },
  recibida: { label: "RECIBIDA", color: "bg-semaforo-verde/15 text-semaforo-verde border border-semaforo-verde/30" },
  con_dano: { label: "CON DANO", color: "bg-semaforo-rojo/15 text-semaforo-rojo border border-semaforo-rojo/30" },
}

export default function RecepcionesPage() {
  const { toast } = useToast()
  const [recepciones, setRecepciones] = useState(initialRecepciones)

  const pendientesCount = recepciones.filter((r) => r.estatus === "pendiente").length
  const recibidasCount = recepciones.filter((r) => r.estatus === "recibida").length
  const conDanoCount = recepciones.filter((r) => r.estatus === "con_dano").length

  const handleConfirmar = (id: string) => {
    const rec = recepciones.find((r) => r.id === id)
    if (!rec) return
    setRecepciones((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estatus: "recibida" as RecepcionStatus } : r))
    )
    toast({
      title: "Recepcion confirmada",
      description: `${rec.folio} - ${rec.material} recibida correctamente`,
    })
  }

  const handleReportarDano = (id: string) => {
    const rec = recepciones.find((r) => r.id === id)
    if (!rec) return
    setRecepciones((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estatus: "con_dano" as RecepcionStatus } : r))
    )
    toast({
      title: "Dano reportado",
      description: `${rec.folio} - Se reporto dano en ${rec.material}`,
    })
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/obra/dashboard" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Recepciones</h1>
            <p className="text-xs text-marble-400">Torre Lujo - Etapa 4</p>
          </div>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 py-4">
          <div className="rounded-xl border border-marble-200 bg-white px-3 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-semaforo-amarillo">{pendientesCount}</p>
            <p className="text-[9px] font-medium tracking-wide text-marble-500">PENDIENTES</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white px-3 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-semaforo-verde">{recibidasCount}</p>
            <p className="text-[9px] font-medium tracking-wide text-marble-500">RECIBIDAS</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white px-3 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-semaforo-rojo">{conDanoCount}</p>
            <p className="text-[9px] font-medium tracking-wide text-marble-500">CON DANO</p>
          </div>
        </div>

        {/* Pending alert */}
        {pendientesCount > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-semaforo-amarillo/30 bg-semaforo-amarillo/5 p-3">
            <Truck className="h-5 w-5 text-semaforo-amarillo shrink-0" />
            <div>
              <p className="text-xs font-semibold text-marble-900">Entrega en camino</p>
              <p className="text-[11px] text-marble-500">REM #29441 - Estimado: 10:30 AM</p>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {recepciones.map((rec) => {
            const status = statusConfig[rec.estatus]
            return (
              <div
                key={rec.id}
                className="overflow-hidden rounded-xl border border-marble-200 bg-white shadow-sm"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-marble-900">{rec.folio}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-golden">{rec.material}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-marble-300 mt-0.5 shrink-0" />
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-marble-400">
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" /> {rec.chofer}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" /> {rec.piezas} pzas &middot; {rec.m2} m2
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {rec.fecha} {rec.hora}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {rec.estatus === "pendiente" && (
                  <div className="flex border-t border-marble-100">
                    <button
                      onClick={() => handleConfirmar(rec.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-semaforo-verde active:bg-semaforo-verde/5 transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Confirmar Recepcion
                    </button>
                    <div className="w-px bg-marble-100" />
                    <button
                      onClick={() => handleReportarDano(rec.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-semaforo-rojo active:bg-semaforo-rojo/5 transition-colors"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Reportar Dano
                    </button>
                  </div>
                )}

                {rec.estatus === "con_dano" && (
                  <div className="border-t border-marble-100 px-4 py-2.5">
                    <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-semaforo-rojo/10 py-2 text-xs font-semibold text-semaforo-rojo active:bg-semaforo-rojo/20 transition-colors">
                      <Camera className="h-3.5 w-3.5" />
                      Ver Evidencia de Dano
                    </button>
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
