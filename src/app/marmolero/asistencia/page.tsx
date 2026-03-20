"use client"

import React, { useState } from "react"
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
} from "lucide-react"

type RegistroEstado = "sin_registrar" | "entrada" | "salida"

const mockHistorial = [
  { fecha: "18 Mar 2026", entrada: "07:02", salida: "16:05", horas: "9h 03m", tipo: "normal" as const },
  { fecha: "17 Mar 2026", entrada: "07:00", salida: "16:00", horas: "9h 00m", tipo: "normal" as const },
  { fecha: "16 Mar 2026", entrada: "07:18", salida: "16:10", horas: "8h 52m", tipo: "retardo" as const },
  { fecha: "15 Mar 2026", entrada: "06:58", salida: "16:02", horas: "9h 04m", tipo: "normal" as const },
]

const mockPiezasHoy = [
  {
    id: "1",
    tipo: "CORTE DIAMANTE",
    numero: "#2849",
    nombre: "Encimera Calacatta Gold",
    medidas: "240 x 60 x 3 cm",
    acabado: "Pulido Espejo",
    estatus: "por_iniciar" as const,
  },
  {
    id: "2",
    tipo: "PULIDO",
    numero: "#2847",
    nombre: "Cubierta Nero Marquina",
    medidas: "180 x 55 x 2 cm",
    acabado: "Mate",
    estatus: "pendiente_liberacion" as const,
  },
  {
    id: "3",
    tipo: "ACABADO BORDES",
    numero: "#2844",
    nombre: "Muro Blanco Carrara",
    medidas: "240 x 120 x 2 cm",
    acabado: "Biselado",
    estatus: "en_espera_materiales" as const,
  },
]

const piezaStatusConfig = {
  por_iniciar: { label: "INICIAR TRABAJO", color: "bg-golden text-marble-950", actionable: true },
  pendiente_liberacion: { label: "PENDIENTE DE LIBERACIÓN DE CORTE", color: "bg-semaforo-amarillo/15 text-semaforo-amarillo", actionable: false },
  en_espera_materiales: { label: "EN ESPERA DE MATERIALES", color: "bg-marble-700 text-marble-400", actionable: false },
}

export default function AsistenciaPage() {
  const [estado, setEstado] = useState<RegistroEstado>("sin_registrar")
  const [horaEntrada, setHoraEntrada] = useState<string | null>(null)

  const handleRegistro = () => {
    if (estado === "sin_registrar") {
      const now = new Date()
      setHoraEntrada(
        now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
      )
      setEstado("entrada")
    } else if (estado === "entrada") {
      setEstado("salida")
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
              MÁRMOL CALIBE
            </span>
          </div>
          <button className="relative rounded-full p-2 text-marble-400 active:bg-marble-800">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Greeting */}
        <h1 className="text-2xl font-bold text-white">Buenos días, Roberto</h1>
        <p className="mt-1 flex items-center gap-1.5 text-xs tracking-wide text-marble-400">
          <MapPin className="h-3.5 w-3.5" />
          PLANTA DE FABRICACIÓN &bull; SECTOR A
        </p>

        {/* Big Attendance Button */}
        <div className="mt-8 flex flex-col items-center">
          <button
            onClick={handleRegistro}
            disabled={estado === "salida"}
            className={`flex h-40 w-40 flex-col items-center justify-center rounded-full border-2 transition-all active:scale-95 ${config.buttonColor} ${
              estado === "salida" ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {estado === "sin_registrar" && (
              <Hand className={`h-12 w-12 ${config.iconColor}`} />
            )}
            {estado === "entrada" && (
              <Clock className={`h-12 w-12 ${config.iconColor}`} />
            )}
            {estado === "salida" && (
              <CheckCircle2 className={`h-12 w-12 ${config.iconColor}`} />
            )}
            <span className="mt-2 text-xs font-semibold">
              {estado === "sin_registrar" ? "REGISTRAR ENTRADA" : estado === "entrada" ? "REGISTRAR SALIDA" : "COMPLETADO"}
            </span>
          </button>

          <p className="mt-4 text-xs text-marble-500">{config.label}</p>
          <span className={`mt-2 rounded-full px-3 py-1 text-[10px] font-semibold ${config.badgeColor}`}>
            {config.badge}
          </span>
        </div>

        {/* Piezas Asignadas */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold tracking-widest text-marble-500 uppercase">
              Piezas Asignadas
            </h2>
            <span className="rounded-full bg-golden/15 px-2.5 py-0.5 text-[10px] font-bold text-golden">
              {mockPiezasHoy.length} HOY
            </span>
          </div>

          <div className="space-y-3">
            {mockPiezasHoy.map((pieza) => {
              const pStatus = piezaStatusConfig[pieza.estatus]
              return (
                <div
                  key={pieza.id}
                  className="rounded-2xl border border-marble-800 bg-marble-900 p-4"
                >
                  {/* Type badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-golden/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-golden">
                      {pieza.tipo}
                    </span>
                    <span className="text-xs font-semibold text-marble-400">{pieza.numero}</span>
                  </div>

                  <p className="text-sm font-bold text-white">{pieza.nombre}</p>

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

                  {/* Action */}
                  <div className="mt-4">
                    {pStatus.actionable ? (
                      <button className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold tracking-wide ${pStatus.color} active:opacity-80 transition-opacity`}>
                        <Hammer className="h-4 w-4" />
                        {pStatus.label}
                      </button>
                    ) : (
                      <div className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-semibold ${pStatus.color}`}>
                        <AlertCircle className="h-3.5 w-3.5" />
                        {pStatus.label}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* History */}
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-marble-500 uppercase">
            Historial de Asistencia
          </h2>
          <div className="space-y-2">
            {mockHistorial.map((dia, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-marble-800 bg-marble-900 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    dia.tipo === "retardo" ? "bg-semaforo-amarillo/10" : "bg-semaforo-verde/10"
                  }`}>
                    <Clock className={`h-4 w-4 ${
                      dia.tipo === "retardo" ? "text-semaforo-amarillo" : "text-semaforo-verde"
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{dia.fecha}</p>
                    <p className="text-[11px] text-marble-500">
                      {dia.entrada} - {dia.salida}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-marble-300">{dia.horas}</p>
                  {dia.tipo === "retardo" && (
                    <span className="text-[10px] font-medium text-semaforo-amarillo">Retardo</span>
                  )}
                </div>
              </div>
            ))}
          </div>
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
