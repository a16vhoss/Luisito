"use client"

import React from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"

const mockProfile = {
  nombre: "Rodrigo García",
  email: "rodrigo.garcia@marmolcalibe.com",
  telefono: "+52 998 123 4567",
  unidad: "KENWORTH T680",
  placas: "M-452",
  licencia: "CDL-A #849271",
  vigencia: "Dic 2027",
  fechaIngreso: "15 Ene 2023",
  entregas: 1243,
  kmRecorridos: "87,450",
  gastoGasolina: "$245,800",
}

const menuItems = [
  { icon: FileText, label: "Mis Documentos", desc: "Licencia, INE, póliza" },
  { icon: CreditCard, label: "Tarjetas Asignadas", desc: "1 tarjeta activa" },
  { icon: Fuel, label: "Historial de Gasolina", desc: "Ver todos los registros" },
  { icon: Clock, label: "Historial de Entregas", desc: "1,243 entregas totales" },
  { icon: Shield, label: "Seguridad", desc: "Cambiar contraseña" },
]

export default function PerfilPage() {
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
            RG
          </div>
          <h2 className="mt-3 text-lg font-bold text-white">{mockProfile.nombre}</h2>
          <p className="text-sm text-marble-400">Chofer</p>
          <div className="mt-3 flex items-center gap-2 rounded-full bg-marble-800 px-3 py-1.5">
            <Truck className="h-3.5 w-3.5 text-golden" />
            <span className="text-xs font-medium text-marble-300">
              {mockProfile.unidad} [{mockProfile.placas}]
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-marble-800 bg-marble-900 px-3 py-3 text-center">
            <p className="text-lg font-bold text-golden">{mockProfile.entregas.toLocaleString()}</p>
            <p className="text-[10px] font-medium tracking-wide text-marble-500">ENTREGAS</p>
          </div>
          <div className="rounded-xl border border-marble-800 bg-marble-900 px-3 py-3 text-center">
            <p className="text-lg font-bold text-white">{mockProfile.kmRecorridos}</p>
            <p className="text-[10px] font-medium tracking-wide text-marble-500">KM TOTALES</p>
          </div>
          <div className="rounded-xl border border-marble-800 bg-marble-900 px-3 py-3 text-center">
            <p className="text-lg font-bold text-white">{mockProfile.gastoGasolina}</p>
            <p className="text-[10px] font-medium tracking-wide text-marble-500">GASOLINA</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 space-y-3">
          <h3 className="text-xs font-semibold tracking-widest text-marble-500 uppercase">
            Información
          </h3>
          <div className="space-y-1">
            <div className="flex items-center gap-3 rounded-xl bg-marble-900 px-4 py-3">
              <Mail className="h-4 w-4 text-marble-500" />
              <span className="text-sm text-marble-300">{mockProfile.email}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-marble-900 px-4 py-3">
              <Phone className="h-4 w-4 text-marble-500" />
              <span className="text-sm text-marble-300">{mockProfile.telefono}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-marble-900 px-4 py-3">
              <Shield className="h-4 w-4 text-marble-500" />
              <div>
                <span className="text-sm text-marble-300">{mockProfile.licencia}</span>
                <span className="ml-2 text-[11px] text-semaforo-verde">Vigente hasta {mockProfile.vigencia}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-marble-900 px-4 py-3">
              <Calendar className="h-4 w-4 text-marble-500" />
              <span className="text-sm text-marble-300">Desde {mockProfile.fechaIngreso}</span>
            </div>
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
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
