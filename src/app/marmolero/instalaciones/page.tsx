"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  Camera,
  MapPin,
  Clock,
  Ruler,
  Wrench,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

type InstallEstatus = "asignada" | "en_camino" | "en_instalacion" | "instalada"

const statusConfig: Record<InstallEstatus, { label: string; color: string; bg: string }> = {
  asignada: { label: "ASIGNADA", color: "text-golden", bg: "bg-golden/15" },
  en_camino: { label: "EN CAMINO", color: "text-blue-400", bg: "bg-blue-400/15" },
  en_instalacion: { label: "EN INSTALACION", color: "text-semaforo-amarillo", bg: "bg-semaforo-amarillo/15" },
  instalada: { label: "INSTALADA", color: "text-semaforo-verde", bg: "bg-semaforo-verde/15" },
}

interface PiezaInstalacion {
  id: string
  estatus: string
  created_at: string
  concepto: {
    tipo_pieza: string | null
    material_tipo: string | null
    medida_largo: number | null
    medida_ancho: number | null
    obra: {
      nombre: string | null
    } | null
  } | null
}

interface InstalacionDisplay {
  id: string
  pieza: string
  obra: string
  medidas: string
  tipo: string
  estatus: InstallEstatus
  fecha: string
}

export default function InstalacionesMarmoleroPage() {
  const { toast } = useToast()
  const [instalaciones, setInstalaciones] = useState<InstalacionDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchInstalaciones = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const { data, error } = await supabase
      .from("piezas")
      .select("*, concepto:conceptos_obra(tipo_pieza, material_tipo, medida_largo, medida_ancho, obra:obras(nombre))")
      .eq("instalado_por", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching instalaciones:", error)
      setLoading(false)
      return
    }

    if (data) {
      const mapped: InstalacionDisplay[] = data.map((p: PiezaInstalacion) => {
        const concepto = p.concepto
        const largo = concepto?.medida_largo || 0
        const ancho = concepto?.medida_ancho || 0
        return {
          id: p.id,
          pieza: concepto?.material_tipo || "Sin nombre",
          obra: concepto?.obra?.nombre || "Sin obra",
          medidas: `${largo} x ${ancho} cm`,
          tipo: concepto?.tipo_pieza || "PIEZA",
          estatus: (p.estatus as InstallEstatus) || "asignada",
          fecha: new Date(p.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }),
        }
      })
      setInstalaciones(mapped)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchInstalaciones()
  }, [fetchInstalaciones])

  const updateEstatus = async (id: string, newEstatus: InstallEstatus, label: string) => {
    setActionLoadingId(id)

    const { error } = await supabase
      .from("piezas")
      .update({ estatus: newEstatus })
      .eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      setActionLoadingId(null)
      return
    }

    setInstalaciones((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, estatus: newEstatus } : inst))
    )
    toast({
      title: label,
      description: `Pieza actualizada a ${statusConfig[newEstatus].label.toLowerCase()}`,
    })
    setActionLoadingId(null)
  }

  const counts = {
    asignada: instalaciones.filter(i => i.estatus === "asignada").length,
    en_camino: instalaciones.filter(i => i.estatus === "en_camino").length,
    en_instalacion: instalaciones.filter(i => i.estatus === "en_instalacion").length,
    instalada: instalaciones.filter(i => i.estatus === "instalada").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-marble-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-golden" />
      </div>
    )
  }

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
            <p className="text-xs text-marble-400">Trabajos de instalacion en obra</p>
          </div>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-1.5 mb-6">
          <div className="rounded-lg bg-marble-900 border border-marble-800 px-2 py-2.5 text-center">
            <p className="text-base font-bold text-golden">{counts.asignada}</p>
            <p className="text-[8px] font-medium text-marble-500">ASIGNADA</p>
          </div>
          <div className="rounded-lg bg-marble-900 border border-marble-800 px-2 py-2.5 text-center">
            <p className="text-base font-bold text-blue-400">{counts.en_camino}</p>
            <p className="text-[8px] font-medium text-marble-500">EN CAMINO</p>
          </div>
          <div className="rounded-lg bg-marble-900 border border-marble-800 px-2 py-2.5 text-center">
            <p className="text-base font-bold text-semaforo-amarillo">{counts.en_instalacion}</p>
            <p className="text-[8px] font-medium text-marble-500">INSTALANDO</p>
          </div>
          <div className="rounded-lg bg-marble-900 border border-marble-800 px-2 py-2.5 text-center">
            <p className="text-base font-bold text-semaforo-verde">{counts.instalada}</p>
            <p className="text-[8px] font-medium text-marble-500">COMPLETA</p>
          </div>
        </div>

        {/* Installation Cards */}
        {instalaciones.length === 0 ? (
          <div className="mt-12 text-center">
            <Wrench className="mx-auto h-10 w-10 text-marble-700" />
            <p className="mt-2 text-sm text-marble-500">No tienes instalaciones asignadas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {instalaciones.map((inst) => {
              const status = statusConfig[inst.estatus] || statusConfig.asignada
              const isActionLoading = actionLoadingId === inst.id
              return (
                <div
                  key={inst.id}
                  className="rounded-2xl border border-marble-800 bg-marble-900 overflow-hidden"
                >
                  <div className="p-4">
                    {/* Status + Type */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="rounded-full bg-golden/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-golden">
                        {inst.tipo}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-white">{inst.pieza}</p>

                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-marble-400 flex items-center gap-1.5">
                        <Wrench className="h-3 w-3 text-marble-500" />
                        {inst.obra}
                      </p>
                      <p className="text-xs text-marble-400 flex items-center gap-1.5">
                        <Ruler className="h-3 w-3 text-marble-500" />
                        {inst.medidas}
                      </p>
                      <p className="text-xs text-marble-400 flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-marble-500" />
                        {inst.fecha}
                      </p>
                    </div>
                  </div>

                  {/* Actions based on status */}
                  {inst.estatus === "asignada" && (
                    <button
                      onClick={() => updateEstatus(inst.id, "en_camino", "En camino")}
                      disabled={isActionLoading}
                      className="flex w-full items-center justify-center gap-2 bg-golden py-3 text-xs font-bold tracking-wide text-marble-950 active:bg-golden-dark transition-colors disabled:opacity-50"
                    >
                      {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                      CONFIRMAR SALIDA
                    </button>
                  )}

                  {inst.estatus === "en_camino" && (
                    <button
                      onClick={() => updateEstatus(inst.id, "en_instalacion", "Llegada confirmada")}
                      disabled={isActionLoading}
                      className="flex w-full items-center justify-center gap-2 border-t border-marble-800 py-3 text-xs font-semibold text-blue-400 active:bg-marble-800 transition-colors disabled:opacity-50"
                    >
                      {isActionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
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
                      <button
                        onClick={() => updateEstatus(inst.id, "instalada", "Instalacion completada")}
                        disabled={isActionLoading}
                        className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-semaforo-verde active:bg-marble-800 transition-colors disabled:opacity-50"
                      >
                        {isActionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Completar
                      </button>
                    </div>
                  )}

                  {inst.estatus === "instalada" && (
                    <div className="flex items-center justify-center gap-1.5 border-t border-marble-800 py-3 text-xs font-medium text-semaforo-verde">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Instalacion Completada
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

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
