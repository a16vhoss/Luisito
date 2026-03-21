"use client"

import React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Ruler,
  MapPin,
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  Scissors,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { desperdiciosDemo } from "@/lib/desperdicios-mock"

const calidadConfig = {
  buena: { label: "Buena", color: "bg-semaforo-verde/15 text-semaforo-verde" },
  regular: { label: "Regular", color: "bg-semaforo-amarillo/15 text-semaforo-amarillo" },
  solo_piezas_pequeñas: { label: "Solo piezas pequeñas", color: "bg-semaforo-rojo/15 text-semaforo-rojo" },
}

export default function DetalleDesperdicioPage() {
  const params = useParams()
  const { toast } = useToast()
  const id = params.id as string

  const desperdicio = desperdiciosDemo.find((d) => d.id === id)

  if (!desperdicio) {
    return (
      <div className="min-h-screen bg-[#FAF9F7]">
        <header className="bg-marble-950 px-5 pb-5 pt-4">
          <div className="flex items-center gap-3">
            <Link href="/taller/desperdicios" className="rounded-full p-1.5 active:bg-marble-800">
              <ArrowLeft className="h-5 w-5 text-marble-400" />
            </Link>
            <h1 className="text-lg font-bold text-white">Retazo no encontrado</h1>
          </div>
        </header>
        <div className="mt-12 text-center">
          <Scissors className="mx-auto h-12 w-12 text-marble-300" />
          <p className="mt-3 text-sm text-marble-400">Este retazo no existe en el inventario</p>
        </div>
      </div>
    )
  }

  const cal = calidadConfig[desperdicio.calidad]
  const areaM2 = (desperdicio.largo_cm * desperdicio.ancho_cm) / 10000

  const handleMarcarUsado = () => {
    toast({
      title: "Retazo marcado como usado",
      description: `${desperdicio.tipo_material} — ${desperdicio.largo_cm} × ${desperdicio.ancho_cm} cm`,
    })
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/taller/desperdicios" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Detalle Retazo</h1>
            <p className="text-xs text-marble-400">{desperdicio.tipo_material}</p>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 space-y-4">
        {/* Photo placeholder */}
        <div className="flex h-48 items-center justify-center rounded-2xl border-2 border-dashed border-marble-300 bg-marble-50">
          <div className="text-center">
            <Camera className="mx-auto h-10 w-10 text-marble-300" />
            <p className="mt-1 text-xs text-marble-400">Sin foto registrada</p>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center justify-center">
          {desperdicio.disponible ? (
            <span className="flex items-center gap-1.5 rounded-full bg-semaforo-verde/15 px-4 py-2 text-sm font-semibold text-semaforo-verde">
              <CheckCircle className="h-4 w-4" /> Disponible
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-marble-200 px-4 py-2 text-sm font-semibold text-marble-500">
              <Scissors className="h-4 w-4" /> Usado
            </span>
          )}
        </div>

        {/* Info card */}
        <div className="rounded-2xl border border-marble-200 bg-white shadow-sm">
          {/* Material */}
          <div className="flex items-center justify-between border-b border-marble-100 px-5 py-4">
            <span className="text-xs font-medium text-marble-400">Material</span>
            <span className="text-sm font-semibold text-marble-900">{desperdicio.tipo_material}</span>
          </div>

          {/* Dimensiones */}
          <div className="flex items-center justify-between border-b border-marble-100 px-5 py-4">
            <span className="text-xs font-medium text-marble-400 flex items-center gap-1">
              <Ruler className="h-3 w-3" /> Dimensiones
            </span>
            <span className="text-sm font-semibold text-marble-900">
              {desperdicio.largo_cm} × {desperdicio.ancho_cm} × {desperdicio.espesor_cm} cm
            </span>
          </div>

          {/* Área */}
          <div className="flex items-center justify-between border-b border-marble-100 px-5 py-4">
            <span className="text-xs font-medium text-marble-400">Área</span>
            <span className="text-sm font-semibold text-marble-900">{areaM2.toFixed(2)} m²</span>
          </div>

          {/* Calidad */}
          <div className="flex items-center justify-between border-b border-marble-100 px-5 py-4">
            <span className="text-xs font-medium text-marble-400">Calidad</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cal.color}`}>
              {cal.label}
            </span>
          </div>

          {/* Irregular */}
          {desperdicio.es_irregular && (
            <div className="flex items-center justify-between border-b border-marble-100 px-5 py-4">
              <span className="text-xs font-medium text-marble-400">Forma</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                <AlertTriangle className="h-3 w-3" /> Irregular
              </span>
            </div>
          )}

          {/* Ubicación */}
          {desperdicio.ubicacion_planta && (
            <div className="flex items-center justify-between border-b border-marble-100 px-5 py-4">
              <span className="text-xs font-medium text-marble-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Ubicación
              </span>
              <span className="text-sm font-semibold text-marble-900">{desperdicio.ubicacion_planta}</span>
            </div>
          )}

          {/* Notas */}
          {desperdicio.notas && (
            <div className="border-b border-marble-100 px-5 py-4">
              <span className="text-xs font-medium text-marble-400 flex items-center gap-1 mb-1">
                <FileText className="h-3 w-3" /> Notas
              </span>
              <p className="text-sm text-marble-700">{desperdicio.notas}</p>
            </div>
          )}

          {/* Fecha */}
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-xs font-medium text-marble-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Registrado
            </span>
            <span className="text-sm text-marble-600">
              {new Date(desperdicio.created_at).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Used info */}
        {!desperdicio.disponible && desperdicio.usado_en_pieza_id && (
          <div className="rounded-xl border border-marble-200 bg-marble-50 p-4">
            <p className="text-xs font-semibold tracking-wider text-marble-500 uppercase">
              Información de uso
            </p>
            <p className="mt-1 text-sm text-marble-700">
              Pieza: <span className="font-medium text-marble-900">{desperdicio.usado_en_pieza_id}</span>
            </p>
          </div>
        )}

        {/* Action */}
        {desperdicio.disponible && (
          <Button
            className="h-12 w-full rounded-xl bg-marble-950 text-sm font-bold tracking-wide text-white hover:bg-marble-800 active:bg-marble-900"
            onClick={handleMarcarUsado}
          >
            <Scissors className="mr-2 h-4 w-4" />
            MARCAR COMO USADO
          </Button>
        )}
      </div>
    </div>
  )
}
