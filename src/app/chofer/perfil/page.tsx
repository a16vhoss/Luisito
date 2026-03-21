"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Truck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  FileText,
  ChevronRight,
  LogOut,
  CreditCard,
  Fuel,
  Clock,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const menuItems = [
  { icon: FileText, label: "Mis Documentos", desc: "Licencia, INE, póliza" },
  { icon: CreditCard, label: "Tarjetas Asignadas", desc: "Tarjetas empresariales" },
  { icon: Fuel, label: "Historial de Gasolina", desc: "Ver todos los registros" },
  { icon: Clock, label: "Historial de Entregas", desc: "Ver entregas totales" },
  { icon: Shield, label: "Seguridad", desc: "Cambiar contraseña" },
]

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [vehiculo, setVehiculo] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const userId = user.id

      const [{ data: userData }, { data: vehiculoData }] = await Promise.all([
        supabase.from("users").select("*").eq("id", userId).single(),
        supabase.from("vehiculos").select("*").eq("chofer_asignado_id", userId).single(),
      ])

      setProfile(userData)
      setVehiculo(vehiculoData)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-marble-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-golden" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-marble-950 flex items-center justify-center">
        <p className="text-marble-400">No se pudo cargar el perfil</p>
      </div>
    )
  }

  const initials = profile.nombre
    ? profile.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "CH"

  return (
    <div className="min-h-screen bg-marble-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-marble-950/95 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link href="/chofer/cargas" className="rounded-full p-1.5 active:bg-marble-800">
            <ArrowLeft className="h-5 w-5 text-marble-400" />
          </Link>
          <h1 className="text-lg font-bold text-white">Mi Perfil</h1>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Avatar Card */}
        <div className="flex flex-col items-center rounded-2xl border border-marble-800 bg-marble-900 p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-golden text-2xl font-bold text-marble-950">
            {initials}
          </div>
          <h2 className="mt-3 text-lg font-bold text-white">{profile.nombre || "Sin nombre"}</h2>
          <p className="text-sm text-marble-400">{profile.rol || "Chofer"}</p>
          {vehiculo && (
            <div className="mt-3 flex items-center gap-2 rounded-full bg-marble-800 px-3 py-1.5">
              <Truck className="h-3.5 w-3.5 text-golden" />
              <span className="text-xs font-medium text-marble-300">
                {vehiculo.marca} {vehiculo.modelo || ""} [{vehiculo.placas}]
              </span>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-6 space-y-3">
          <h3 className="text-xs font-semibold tracking-widest text-marble-500 uppercase">
            Información
          </h3>
          <div className="space-y-1">
            {profile.email && (
              <div className="flex items-center gap-3 rounded-xl bg-marble-900 px-4 py-3">
                <Mail className="h-4 w-4 text-marble-500" />
                <span className="text-sm text-marble-300">{profile.email}</span>
              </div>
            )}
            {profile.telefono && (
              <div className="flex items-center gap-3 rounded-xl bg-marble-900 px-4 py-3">
                <Phone className="h-4 w-4 text-marble-500" />
                <span className="text-sm text-marble-300">{profile.telefono}</span>
              </div>
            )}
            {profile.licencia && (
              <div className="flex items-center gap-3 rounded-xl bg-marble-900 px-4 py-3">
                <Shield className="h-4 w-4 text-marble-500" />
                <div>
                  <span className="text-sm text-marble-300">{profile.licencia}</span>
                  {profile.licencia_vigencia && (
                    <span className="ml-2 text-[11px] text-semaforo-verde">Vigente hasta {profile.licencia_vigencia}</span>
                  )}
                </div>
              </div>
            )}
            {profile.created_at && (
              <div className="flex items-center gap-3 rounded-xl bg-marble-900 px-4 py-3">
                <Calendar className="h-4 w-4 text-marble-500" />
                <span className="text-sm text-marble-300">
                  Desde {new Date(profile.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="mt-6 space-y-3">
          <h3 className="text-xs font-semibold tracking-widest text-marble-500 uppercase">
            Opciones
          </h3>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className="flex w-full items-center gap-3 rounded-xl bg-marble-900 px-4 py-3 active:bg-marble-800 transition-colors"
              >
                <item.icon className="h-4 w-4 text-marble-500" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-marble-200">{item.label}</p>
                  <p className="text-[11px] text-marble-500">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-marble-600" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="mt-8 h-12 w-full rounded-xl border-semaforo-rojo/30 bg-semaforo-rojo/10 text-sm font-medium text-semaforo-rojo hover:bg-semaforo-rojo/20 active:bg-semaforo-rojo/30"
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = "/login"
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
