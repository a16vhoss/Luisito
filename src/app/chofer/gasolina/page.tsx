"use client"

import React, { useEffect, useState } from "react"
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
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function GasolinaPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [monto, setMonto] = useState("")
  const [litros, setLitros] = useState("")
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [historial, setHistorial] = useState<any[]>([])
  const [vehiculo, setVehiculo] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Fetch assigned vehicle
      const { data: vehiculoData } = await supabase
        .from("vehiculos")
        .select("*")
        .eq("chofer_asignado_id", user.id)
        .single()

      if (vehiculoData) setVehiculo(vehiculoData)

      // Fetch fuel history
      const { data: gastos } = await supabase
        .from("gastos_gasolina")
        .select("*, vehiculo:vehiculos(placas, marca)")
        .eq("chofer_id", user.id)
        .order("created_at", { ascending: false })

      setHistorial(gastos || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleRegistrarCarga = async () => {
    if (!monto || !litros) {
      toast({
        title: "Campos requeridos",
        description: "Ingresa el monto y los litros para registrar la carga",
      })
      return
    }

    const montoNum = parseFloat(monto)
    const litrosNum = parseFloat(litros)

    if (isNaN(montoNum) || isNaN(litrosNum) || montoNum <= 0 || litrosNum <= 0) {
      toast({
        title: "Valores invalidos",
        description: "El monto y los litros deben ser numeros mayores a 0",
      })
      return
    }

    if (!userId) return

    setSubmitting(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("gastos_gasolina")
      .insert({
        chofer_id: userId,
        monto: montoNum,
        litros: litrosNum,
        vehiculo_id: vehiculo?.id || null,
      })
      .select("*, vehiculo:vehiculos(placas, marca)")
      .single()

    setSubmitting(false)

    if (error) {
      toast({
        title: "Error al registrar",
        description: error.message,
      })
      return
    }

    if (data) {
      setHistorial((prev) => [data, ...prev])
    }

    setMonto("")
    setLitros("")
    setFotoPreview(null)

    toast({
      title: "Carga registrada exitosamente",
      description: `$${montoNum.toFixed(2)} - ${litrosNum.toFixed(1)} litros`,
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
          <Link href="/chofer/cargas" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Registro de Gasolina</h1>
            {vehiculo && (
              <p className="text-xs text-marble-500">{vehiculo.marca} {vehiculo.modelo || ""} [{vehiculo.placas}]</p>
            )}
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
                  <p className="text-[11px] text-marble-500">o subir desde galeria</p>
                </div>
              </button>
            )}
          </div>

          {/* Submit */}
          <Button
            onClick={handleRegistrarCarga}
            disabled={submitting}
            className="h-12 w-full rounded-xl bg-golden text-sm font-bold tracking-wide text-marble-950 hover:bg-golden-light active:bg-golden-dark"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {submitting ? "REGISTRANDO..." : "REGISTRAR CARGA"}
          </Button>
        </div>

        {/* History */}
        <div className="mt-10">
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-marble-500 uppercase">
            Historial Reciente
          </h2>
          {historial.length === 0 ? (
            <div className="rounded-xl border border-marble-800 bg-marble-900 p-8 text-center">
              <Fuel className="mx-auto h-8 w-8 text-marble-700" />
              <p className="mt-3 text-sm font-medium text-marble-400">Sin registros</p>
              <p className="mt-1 text-xs text-marble-600">Aún no has registrado gastos de gasolina</p>
            </div>
          ) : (
            <div className="space-y-2">
              {historial.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-marble-800 bg-marble-900 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      ${Number(item.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] text-marble-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(item.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                      {" · "}
                      {Number(item.litros).toFixed(1)}L
                      {item.vehiculo?.placas && ` · ${item.vehiculo.placas}`}
                    </p>
                  </div>
                  <Fuel className="h-4 w-4 text-marble-600" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
