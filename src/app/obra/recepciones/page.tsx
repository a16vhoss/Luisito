"use client"

import React, { useState, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

type RecepcionStatus = "pendiente" | "en_transito" | "entregada" | "con_dano"

const statusConfig: Record<string, { label: string; color: string }> = {
  pendiente: { label: "PENDIENTE", color: "bg-semaforo-amarillo/15 text-semaforo-amarillo border border-semaforo-amarillo/30" },
  en_transito: { label: "EN TRÁNSITO", color: "bg-blue-400/15 text-blue-400 border border-blue-400/30" },
  entregada: { label: "ENTREGADA", color: "bg-semaforo-verde/15 text-semaforo-verde border border-semaforo-verde/30" },
  con_dano: { label: "CON DAÑO", color: "bg-semaforo-rojo/15 text-semaforo-rojo border border-semaforo-rojo/30" },
}

export default function RecepcionesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [noObra, setNoObra] = useState(false)
  const [obraName, setObraName] = useState("")
  const [remisiones, setRemisiones] = useState<any[]>([])
  const [obraId, setObraId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        setNoObra(true)
        return
      }

      const { data: obra } = await supabase
        .from("obras")
        .select("*")
        .eq("residente_id", user.id)
        .eq("estatus", "activa")
        .single()

      if (!obra) {
        setLoading(false)
        setNoObra(true)
        return
      }

      setObraName(obra.nombre || "Obra")
      setObraId(obra.id)

      const { data: remisionesData } = await supabase
        .from("remisiones")
        .select("*, chofer:users!chofer_id(nombre), items:remision_items(cantidad, concepto:conceptos_obra(tipo_pieza))")
        .eq("obra_id", obra.id)
        .order("created_at", { ascending: false })

      setRemisiones(remisionesData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleConfirmar = async (remisionId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("remisiones")
      .update({ estatus: "entregada" })
      .eq("id", remisionId)

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo confirmar la recepción",
      })
      return
    }

    setRemisiones((prev) =>
      prev.map((r) => (r.id === remisionId ? { ...r, estatus: "entregada" } : r))
    )
    const rec = remisiones.find((r) => r.id === remisionId)
    toast({
      title: "Recepcion confirmada",
      description: `REM #${rec?.folio || remisionId.slice(0, 6)} recibida correctamente`,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-golden" />
      </div>
    )
  }

  if (noObra) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex flex-col items-center justify-center px-5">
        <Package className="h-12 w-12 text-marble-300" />
        <p className="mt-3 text-sm font-medium text-marble-500">No tiene obra asignada</p>
        <p className="mt-1 text-xs text-marble-400">Contacte al administrador para que le asigne una obra.</p>
      </div>
    )
  }

  const pendientesCount = remisiones.filter((r) => r.estatus === "pendiente" || r.estatus === "en_transito").length
  const entregadasCount = remisiones.filter((r) => r.estatus === "entregada").length
  const conDanoCount = remisiones.filter((r) => r.estatus === "con_dano").length

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
            <p className="text-xs text-marble-400">{obraName}</p>
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
            <p className="text-lg font-bold text-semaforo-verde">{entregadasCount}</p>
            <p className="text-[9px] font-medium tracking-wide text-marble-500">ENTREGADAS</p>
          </div>
          <div className="rounded-xl border border-marble-200 bg-white px-3 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-semaforo-rojo">{conDanoCount}</p>
            <p className="text-[9px] font-medium tracking-wide text-marble-500">CON DAÑO</p>
          </div>
        </div>

        {/* Pending alert */}
        {pendientesCount > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-semaforo-amarillo/30 bg-semaforo-amarillo/5 p-3">
            <Truck className="h-5 w-5 text-semaforo-amarillo shrink-0" />
            <div>
              <p className="text-xs font-semibold text-marble-900">Entregas pendientes</p>
              <p className="text-[11px] text-marble-500">{pendientesCount} remisión(es) por recibir</p>
            </div>
          </div>
        )}

        {/* List */}
        {remisiones.length === 0 ? (
          <div className="mt-12 text-center">
            <Package className="mx-auto h-10 w-10 text-marble-300" />
            <p className="mt-2 text-sm text-marble-400">No hay remisiones para esta obra</p>
          </div>
        ) : (
          <div className="space-y-3">
            {remisiones.map((rec) => {
              const status = statusConfig[rec.estatus] || { label: (rec.estatus || "").toUpperCase(), color: "bg-marble-200 text-marble-600" }
              const totalPiezas = (rec.items || []).reduce((sum: number, item: any) => sum + (item.cantidad || 0), 0)
              const tiposPieza = (rec.items || []).map((item: any) => item.concepto?.tipo_pieza).filter(Boolean).join(", ")
              return (
                <div
                  key={rec.id}
                  className="overflow-hidden rounded-xl border border-marble-200 bg-white shadow-sm"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-marble-900">REM #{rec.folio || rec.id.slice(0, 6)}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        {tiposPieza && (
                          <p className="mt-1 text-sm font-medium text-golden">{tiposPieza}</p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-marble-300 mt-0.5 shrink-0" />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-marble-400">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" /> {rec.chofer?.nombre || "Sin chofer"}
                      </span>
                      {totalPiezas > 0 && (
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" /> {totalPiezas} pzas
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(rec.created_at).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {(rec.estatus === "pendiente" || rec.estatus === "en_transito") && (
                    <div className="flex border-t border-marble-100">
                      <button
                        onClick={() => handleConfirmar(rec.id)}
                        className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-semaforo-verde active:bg-semaforo-verde/5 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmar Recepcion
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
        )}
      </div>
    </div>
  )
}
