"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Fuel,
  Camera,
  Upload,
  DollarSign,
  Droplets,
  CreditCard,
  CheckCircle2,
  Clock,
} from "lucide-react"
import Link from "next/link"

const mockHistorial = [
  { id: "1", fecha: "18 Mar 2026", monto: 1850.0, litros: 78.5, estacion: "Pemex Av. Tulum" },
  { id: "2", fecha: "15 Mar 2026", monto: 2100.0, litros: 89.2, estacion: "BP Bonampak" },
  { id: "3", fecha: "12 Mar 2026", monto: 1650.0, litros: 70.1, estacion: "Pemex Puerto Juárez" },
]

export default function GasolinaPage() {
  const [monto, setMonto] = useState("")
  const [litros, setLitros] = useState("")
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-marble-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-marble-950/95 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link href="/chofer/cargas" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Registro de Gasolina</h1>
            <p className="text-xs text-marble-500">KENWORTH T680 [M-452]</p>
          </div>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-golden/10 ring-2 ring-golden/30">
            <Fuel className="h-8 w-8 text-golden" />
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Monto */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-wider text-marble-400 uppercase">
              Monto ($)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-500" />
              <Input
                type="number"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="h-12 rounded-xl border-marble-700 bg-marble-900 pl-9 text-lg font-semibold text-white placeholder:text-marble-600 focus:border-golden focus:ring-golden"
              />
            </div>
          </div>

          {/* Litros */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-wider text-marble-400 uppercase">
              Litros
            </Label>
            <div className="relative">
              <Droplets className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-500" />
              <Input
                type="number"
                placeholder="0.0"
                value={litros}
                onChange={(e) => setLitros(e.target.value)}
                className="h-12 rounded-xl border-marble-700 bg-marble-900 pl-9 text-lg font-semibold text-white placeholder:text-marble-600 focus:border-golden focus:ring-golden"
              />
            </div>
          </div>

          {/* Tarjeta */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-wider text-marble-400 uppercase">
              Tarjeta
            </Label>
            <div className="flex items-center gap-3 rounded-xl border border-marble-700 bg-marble-900 px-4 py-3">
              <CreditCard className="h-5 w-5 text-golden" />
              <div>
                <p className="text-sm font-medium text-white">**** **** **** 4521</p>
                <p className="text-[11px] text-marble-500">Tarjeta Empresarial</p>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-wider text-marble-400 uppercase">
              Foto del Ticket
            </Label>
            {fotoPreview ? (
              <div className="relative rounded-xl border border-marble-700 bg-marble-900 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-lg bg-marble-800 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-semaforo-verde" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">ticket_gasolina.jpg</p>
                    <p className="text-[11px] text-marble-500">Foto capturada correctamente</p>
                  </div>
                </div>
                <button
                  onClick={() => setFotoPreview(null)}
                  className="absolute right-3 top-3 text-xs text-semaforo-rojo"
                >
                  Eliminar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setFotoPreview("preview")}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-marble-700 bg-marble-900/50 py-8 active:bg-marble-800 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-marble-800">
                  <Camera className="h-6 w-6 text-golden" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-marble-300">Tomar Foto</p>
                  <p className="text-[11px] text-marble-500">o subir desde galería</p>
                </div>
              </button>
            )}
          </div>

          {/* Submit */}
          <Button
            className="h-12 w-full rounded-xl bg-golden text-sm font-bold tracking-wide text-marble-950 hover:bg-golden-light active:bg-golden-dark"
          >
            <Upload className="mr-2 h-4 w-4" />
            REGISTRAR CARGA
          </Button>
        </div>

        {/* History */}
        <div className="mt-10">
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-marble-500 uppercase">
            Historial Reciente
          </h2>
          <div className="space-y-2">
            {mockHistorial.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-marble-800 bg-marble-900 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    ${item.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-marble-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.fecha} &middot; {item.litros}L &middot; {item.estacion}
                  </p>
                </div>
                <Fuel className="h-4 w-4 text-marble-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
