"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Bell,
  Hand,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  ChevronRight,
  Hammer,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

type RegistroEstado = "sin_registrar" | "entrada" | "salida"

type PiezaEstatus = "por_iniciar" | "pendiente_liberacion" | "en_espera_materiales" | "en_proceso"

const piezaStatusConfig: Record<PiezaEstatus, { label: string; color: string; actionable: boolean }> = {
  por_iniciar: { label: "INICIAR TRABAJO", color: "bg-golden text-marble-950", actionable: true },
  en_proceso: { label: "EN PROCESO", color: "bg-blue-400/15 text-blue-400", actionable: false },
  pendiente_liberacion: { label: "PENDIENTE DE LIBERACION DE CORTE", color: "bg-semaforo-amarillo/15 text-semaforo-amarillo", actionable: false },
  en_espera_materiales: { label: "EN ESPERA DE MATERIALES", color: "bg-marble-700 text-marble-400", actionable: false },
}

interface AsistenciaRecord {
  id: string
  usuario_id: string
  fecha: string
  hora_entrada: string | null
  hora_salida: string | null
  tipo: string
  registrado_en: string
}

export default function AsistenciaPage() {
  const { toast } = useToast()
  const [estado, setEstado] = useState<RegistroEstado>("sin_registrar")
  const [horaEntrada, setHoraEntrada] = useState<string | null>(null)
  const [historial, setHistorial] = useState<AsistenciaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  const today = new Date().toISOString().split("T")[0]

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    // Fetch attendance history
    const { data: historialData } = await supabase
      .from("asistencia")
      .select("*")
      .eq("usuario_id", user.id)
      .order("fecha", { ascending: false })
      .limit(30)

    if (historialData) {
      setHistorial(historialData)

      // Check today's status
      const todayRecord = historialData.find((r: AsistenciaRecord) => r.fecha === today)
      if (todayRecord) {
        if (todayRecord.hora_salida) {
          setEstado("salida")
          setHoraEntrada(todayRecord.hora_entrada)
        } else if (todayRecord.hora_entrada) {
          setEstado("entrada")
          setHoraEntrada(todayRecord.hora_entrada)
        }
      }
    }

    setLoading(false)
  }, [today])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRegistro = async () => {
    if (!userId || actionLoading) return
    setActionLoading(true)

    const now = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false })

    try {
      if (estado === "sin_registrar") {
        const { error } = await supabase.from("asistencia").insert({
          usuario_id: userId,
          fecha: today,
          hora_entrada: now,
          tipo: "normal",
          registrado_en: "planta",
        })

        if (error) throw error

        setHoraEntrada(now)
        setEstado("entrada")
        toast({
          title: "Entrada registrada",
          description: `Hora de entrada: ${now}`,
        })
      } else if (estado === "entrada") {
        const { error } = await supabase
          .from("asistencia")
          .update({ hora_salida: now })
          .eq("usuario_id", userId)
          .eq("fecha", today)

        if (error) throw error

        setEstado("salida")
        toast({
          title: "Salida registrada",
          description: "Jornada completada exitosamente",
        })
      }

      // Refresh history
      fetchData()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "No se pudo registrar",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const estadoConfig = {
    sin_registrar: {
      label: "TOCAR PARA INICIAR JORNADA",
      badge: "SIN REGISTRAR",
      badgeColor: "bg-semaforo-rojo/15 text-semaforo-rojo",
      buttonColor: "bg-golden/10 border-golden/40 text-golden",
      iconColor: "text-golden",
    },
    entrada: {
      label: "TOCAR PARA REGISTRAR SALIDA",
      badge: `ENTRADA: ${horaEntrada}`,
      badgeColor: "bg-semaforo-verde/15 text-semaforo-verde",
      buttonColor: "bg-semaforo-verde/10 border-semaforo-verde/40 text-semaforo-verde",
      iconColor: "text-semaforo-verde",
    },
    salida: {
      label: "JORNADA REGISTRADA",
      badge: "COMPLETADO",
      badgeColor: "bg-semaforo-verde/15 text-semaforo-verde",
      buttonColor: "bg-marble-800 border-marble-700 text-marble-500",
      iconColor: "text-marble-500",
    },
  }

  const config = estadoConfig[estado]

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha + "T12:00:00")
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
  }

  const calcularHoras = (entrada: string | null, salida: string | null) => {
    if (!entrada || !salida) return "--"
    const [eh, em] = entrada.split(":").map(Number)
    const [sh, sm] = salida.split(":").map(Number)
    const totalMin = (sh * 60 + sm) - (eh * 60 + em)
    if (totalMin <= 0) return "--"
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return `${h}h ${m.toString().padStart(2, "0")}m`
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
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-marble-900">
              <span className="text-xs font-bold text-golden">MC</span>
            </div>
            <span className="text-sm font-bold tracking-widest text-marble-200">
              MARMOL CALIBE
            </span>
          </div>
          <button className="relative rounded-full p-2 text-marble-400 active:bg-marble-800">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Greeting */}
        <h1 className="text-2xl font-bold text-white">Mi Asistencia</h1>
        <p className="mt-1 flex items-center gap-1.5 text-xs tracking-wide text-marble-400">
          <MapPin className="h-3.5 w-3.5" />
          PLANTA DE FABRICACION
        </p>

        {/* Big Attendance Button */}
        <div className="mt-8 flex flex-col items-center">
          <button
            onClick={handleRegistro}
            disabled={estado === "salida" || actionLoading}
            className={`flex h-40 w-40 flex-col items-center justify-center rounded-full border-2 transition-all active:scale-95 ${config.buttonColor} ${
              estado === "salida" ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {actionLoading ? (
              <Loader2 className={`h-12 w-12 animate-spin ${config.iconColor}`} />
            ) : estado === "sin_registrar" ? (
              <Hand className={`h-12 w-12 ${config.iconColor}`} />
            ) : estado === "entrada" ? (
              <Clock className={`h-12 w-12 ${config.iconColor}`} />
            ) : (
              <CheckCircle2 className={`h-12 w-12 ${config.iconColor}`} />
            )}
            <span className="mt-2 text-xs font-semibold">
              {actionLoading ? "REGISTRANDO..." : estado === "sin_registrar" ? "REGISTRAR ENTRADA" : estado === "entrada" ? "REGISTRAR SALIDA" : "COMPLETADO"}
            </span>
          </button>

          <p className="mt-4 text-xs text-marble-500">{config.label}</p>
          <span className={`mt-2 rounded-full px-3 py-1 text-[10px] font-semibold ${config.badgeColor}`}>
            {config.badge}
          </span>
        </div>

        {/* History */}
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-marble-500 uppercase">
            Historial de Asistencia
          </h2>

          {historial.length === 0 ? (
            <div className="mt-8 text-center">
              <Calendar className="mx-auto h-10 w-10 text-marble-700" />
              <p className="mt-2 text-sm text-marble-500">No hay registros de asistencia</p>
            </div>
          ) : (
            <div className="space-y-2">
              {historial.map((dia) => {
                const isRetardo = dia.tipo === "retardo"
                return (
                  <div
                    key={dia.id}
                    className="flex items-center justify-between rounded-xl border border-marble-800 bg-marble-900 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isRetardo ? "bg-semaforo-amarillo/10" : "bg-semaforo-verde/10"
                      }`}>
                        <Clock className={`h-4 w-4 ${
                          isRetardo ? "text-semaforo-amarillo" : "text-semaforo-verde"
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{formatFecha(dia.fecha)}</p>
                        <p className="text-[11px] text-marble-500">
                          {dia.hora_entrada || "--"} - {dia.hora_salida || "--"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-marble-300">
                        {calcularHoras(dia.hora_entrada, dia.hora_salida)}
                      </p>
                      {isRetardo && (
                        <span className="text-[10px] font-medium text-semaforo-amarillo">Retardo</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

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
