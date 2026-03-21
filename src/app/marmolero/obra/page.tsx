"use client"

import React, { useState, useEffect, useCallback } from "react"
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
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

type PiezaWorkStatus = "por_iniciar" | "en_proceso" | "pausada" | "completada" | "bloqueada"

const statusConfig: Record<PiezaWorkStatus, { label: string; color: string; bg: string }> = {
  por_iniciar: { label: "POR INICIAR", color: "text-golden", bg: "bg-golden/15" },
  en_proceso: { label: "EN PROCESO", color: "text-blue-400", bg: "bg-blue-400/15" },
  pausada: { label: "PAUSADA", color: "text-semaforo-amarillo", bg: "bg-semaforo-amarillo/15" },
  completada: { label: "COMPLETADA", color: "text-semaforo-verde", bg: "bg-semaforo-verde/15" },
  bloqueada: { label: "BLOQUEADA", color: "text-semaforo-rojo", bg: "bg-semaforo-rojo/15" },
}

const prioridadConfig: Record<string, string> = {
  alta: "border-l-semaforo-rojo",
  media: "border-l-semaforo-amarillo",
  baja: "border-l-semaforo-verde",
}

interface PiezaFromDB {
  id: string
  estatus: string
  notas: string | null
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

interface PiezaDisplay {
  id: string
  tipo: string
  nombre: string
  obra: string
  medidas: string
  acabado: string
  estatus: PiezaWorkStatus
  prioridad: string
  tiempoTranscurrido?: string
  tiempoTotal?: string
  motivo?: string
}

export default function ObraMarmoleroPage() {
  const { toast } = useToast()
  const [filter, setFilter] = useState<"todas" | PiezaWorkStatus>("todas")
  const [piezas, setPiezas] = useState<PiezaDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchPiezas = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const { data, error } = await supabase
      .from("piezas")
      .select("*, concepto:conceptos_obra(tipo_pieza, material_tipo, medida_largo, medida_ancho, obra:obras(nombre))")
      .eq("instalado_por", user.id)
      .not("estatus", "eq", "verificada")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching piezas:", error)
      setLoading(false)
      return
    }

    if (data) {
      const mapped: PiezaDisplay[] = data.map((p: PiezaFromDB) => {
        const concepto = p.concepto
        const largo = concepto?.medida_largo || 0
        const ancho = concepto?.medida_ancho || 0
        return {
          id: p.id,
          tipo: concepto?.tipo_pieza || "PIEZA",
          nombre: concepto?.material_tipo || "Sin nombre",
          obra: concepto?.obra?.nombre || "Sin obra",
          medidas: `${largo} x ${ancho} cm`,
          acabado: concepto?.material_tipo || "--",
          estatus: (p.estatus as PiezaWorkStatus) || "por_iniciar",
          prioridad: "media",
          tiempoTranscurrido: undefined,
          tiempoTotal: undefined,
          motivo: p.notas || undefined,
        }
      })
      setPiezas(mapped)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPiezas()
  }, [fetchPiezas])

  const filtered = piezas.filter(
    (p) => filter === "todas" || p.estatus === filter
  )

  const updatePiezaStatus = async (id: string, newStatus: PiezaWorkStatus, toastTitle: string) => {
    const pieza = piezas.find((p) => p.id === id)
    if (!pieza) return

    const { error } = await supabase
      .from("piezas")
      .update({ estatus: newStatus })
      .eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setPiezas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estatus: newStatus } : p))
    )
    toast({
      title: toastTitle,
      description: `Pieza ${pieza.tipo} ${newStatus === "en_proceso" ? "en proceso" : newStatus === "pausada" ? "pausada" : newStatus === "completada" ? "completada" : newStatus}`,
    })
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
            <h1 className="text-lg font-bold text-white">Piezas Asignadas</h1>
            <p className="text-xs text-marble-400">Sector A - Nave 2</p>
          </div>
          <span className="rounded-full bg-golden/15 px-2.5 py-0.5 text-xs font-bold text-golden">
            {piezas.length}
          </span>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {([
            { count: piezas.filter(p => p.estatus === "por_iniciar").length, label: "Inicio", color: "text-golden" },
            { count: piezas.filter(p => p.estatus === "en_proceso").length, label: "Proceso", color: "text-blue-400" },
            { count: piezas.filter(p => p.estatus === "pausada").length, label: "Pausa", color: "text-semaforo-amarillo" },
            { count: piezas.filter(p => p.estatus === "completada").length, label: "Hecho", color: "text-semaforo-verde" },
            { count: piezas.filter(p => p.estatus === "bloqueada").length, label: "Bloq.", color: "text-semaforo-rojo" },
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
                className={`rounded-2xl border border-marble-800 bg-marble-900 overflow-hidden border-l-4 ${prioridadConfig[pieza.prioridad] || "border-l-marble-600"}`}
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
                  {pieza.tiempoTranscurrido && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-marble-400">
                      <Clock className="h-3 w-3" />
                      <span>Tiempo: <span className="font-medium text-marble-200">{pieza.tiempoTranscurrido}</span></span>
                    </div>
                  )}
                  {pieza.tiempoTotal && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-semaforo-verde">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Tiempo total: {pieza.tiempoTotal}</span>
                    </div>
                  )}
                  {pieza.motivo && pieza.estatus !== "completada" && (
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
                  <button
                    onClick={() => updatePiezaStatus(pieza.id, "en_proceso", "Trabajo iniciado")}
                    className="flex w-full items-center justify-center gap-2 bg-golden py-3 text-xs font-bold tracking-wide text-marble-950 active:bg-golden-dark transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    INICIAR TRABAJO
                  </button>
                )}
                {pieza.estatus === "en_proceso" && (
                  <div className="flex border-t border-marble-800">
                    <button
                      onClick={() => updatePiezaStatus(pieza.id, "pausada", "Trabajo pausado")}
                      className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-semaforo-amarillo active:bg-marble-800 transition-colors"
                    >
                      <Pause className="h-3.5 w-3.5" />
                      Pausar
                    </button>
                    <div className="w-px bg-marble-800" />
                    <button
                      onClick={() => updatePiezaStatus(pieza.id, "completada", "Trabajo completado")}
                      className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-semaforo-verde active:bg-marble-800 transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completar
                    </button>
                  </div>
                )}
                {pieza.estatus === "pausada" && (
                  <button
                    onClick={() => updatePiezaStatus(pieza.id, "en_proceso", "Trabajo reanudado")}
                    className="flex w-full items-center justify-center gap-2 border-t border-marble-800 py-3 text-xs font-semibold text-blue-400 active:bg-marble-800 transition-colors"
                  >
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
            <p className="mt-2 text-sm text-marble-500">
              {piezas.length === 0 ? "No tienes piezas asignadas" : "No hay piezas con este filtro"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
