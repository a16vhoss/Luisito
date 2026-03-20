"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Bell,
  Search,
  Package,
  CheckCircle2,
  ShieldCheck,
  Image,
  Ruler,
  Hash,
  ChevronRight,
} from "lucide-react"

const stats = [
  { label: "RECIBIDAS", value: 142, color: "text-marble-900" },
  { label: "INSTALADAS", value: 88, color: "text-golden" },
  { label: "VERIFICADAS", value: 45, color: "text-semaforo-verde" },
]

type PiezaStatus = "en_espera" | "instalada" | "verificada" | "recibida"

const mockPiezas = [
  {
    id: "1",
    nombre: "Cubierta Cocina",
    material: "Calacatta Gold",
    dimensiones: "240 x 60 cm",
    sku: "CK-CAL-001",
    estatus: "en_espera" as PiezaStatus,
    espesor: "3 cm",
  },
  {
    id: "2",
    nombre: "Piso Vestíbulo A",
    material: "Nero Marquina",
    dimensiones: "60 x 60 cm",
    sku: "PV-NER-012",
    estatus: "instalada" as PiezaStatus,
    espesor: "2 cm",
  },
  {
    id: "3",
    nombre: "Encimera Baño Principal",
    material: "Calacatta Gold",
    dimensiones: "120 x 55 cm",
    sku: "EB-CAL-003",
    estatus: "verificada" as PiezaStatus,
    espesor: "3 cm",
  },
  {
    id: "4",
    nombre: "Muro Decorativo Lobby",
    material: "Blanco Carrara",
    dimensiones: "240 x 120 cm",
    sku: "MD-BLC-007",
    estatus: "recibida" as PiezaStatus,
    espesor: "2 cm",
  },
  {
    id: "5",
    nombre: "Barra Cocina",
    material: "Emperador Dark",
    dimensiones: "300 x 65 cm",
    sku: "BC-EMP-002",
    estatus: "en_espera" as PiezaStatus,
    espesor: "3 cm",
  },
  {
    id: "6",
    nombre: "Piso Baño Secundario",
    material: "Travertino Navona",
    dimensiones: "45 x 45 cm",
    sku: "PB-TRV-008",
    estatus: "instalada" as PiezaStatus,
    espesor: "2 cm",
  },
]

const statusConfig: Record<PiezaStatus, { label: string; color: string; action: string }> = {
  en_espera: { label: "EN ESPERA", color: "bg-semaforo-amarillo/15 text-semaforo-amarillo", action: "Marcar Instalada" },
  recibida: { label: "RECIBIDA", color: "bg-blue-400/15 text-blue-400", action: "Marcar Instalada" },
  instalada: { label: "INSTALADA", color: "bg-blue-500/15 text-blue-500", action: "Verificar Instalación" },
  verificada: { label: "VERIFICADA", color: "bg-semaforo-verde/15 text-semaforo-verde", action: "Verificada" },
}

export default function ObraDashboardPage() {
  const [search, setSearch] = useState("")

  const filtered = mockPiezas.filter((p) => {
    if (!search) return true
    return (
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.material.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="bg-marble-950 px-5 pb-6 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-marble-900">
              <span className="text-xs font-bold text-golden">MC</span>
            </div>
            <span className="text-sm font-bold tracking-widest text-marble-200">
              MÁRMOL CALIBE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-2 text-marble-400 active:bg-marble-800">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-semaforo-rojo" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-golden text-xs font-bold text-marble-950">
              MR
            </div>
          </div>
        </div>
        <div className="mt-4">
          <h1 className="text-xl font-bold text-white">Residente de Obra</h1>
          <p className="mt-0.5 text-xs tracking-wide text-marble-400">
            Torre Lujo - Etapa 4
          </p>
        </div>
      </header>

      <div className="px-5 pb-6">
        {/* Stats */}
        <div className="-mt-4 grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border-2 border-golden/20 bg-white p-3 text-center shadow-sm"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] font-semibold tracking-wider text-marble-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mt-5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marble-400" />
          <Input
            placeholder="Buscar pieza..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-xl border-marble-200 bg-white pl-9 text-sm text-marble-900 placeholder:text-marble-400 focus:border-golden focus:ring-golden shadow-sm"
          />
        </div>

        {/* Inventory Section */}
        <div className="mt-6">
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-marble-500 uppercase">
            Control de Inventario
          </h2>

          <div className="space-y-3">
            {filtered.map((pieza) => {
              const status = statusConfig[pieza.estatus]
              return (
                <div
                  key={pieza.id}
                  className="overflow-hidden rounded-xl border border-marble-200 bg-white shadow-sm"
                >
                  <div className="flex gap-3 p-4">
                    {/* Photo thumbnail */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-marble-100">
                      <Image className="h-8 w-8 text-marble-300" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-marble-900">{pieza.nombre}</p>
                          <p className="text-xs font-medium text-golden">{pieza.material}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-marble-500">
                        <span className="flex items-center gap-0.5">
                          <Ruler className="h-3 w-3" /> {pieza.dimensiones}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Hash className="h-3 w-3" /> {pieza.sku}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {pieza.estatus !== "verificada" && (
                    <div className="border-t border-marble-100 px-4 py-2.5">
                      <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-golden/10 py-2 text-xs font-semibold text-golden active:bg-golden/20 transition-colors">
                        {pieza.estatus === "en_espera" || pieza.estatus === "recibida" ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        )}
                        {status.action}
                      </button>
                    </div>
                  )}

                  {pieza.estatus === "verificada" && (
                    <div className="border-t border-marble-100 px-4 py-2.5">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-semaforo-verde">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verificación Completa
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="mt-12 text-center">
              <Package className="mx-auto h-10 w-10 text-marble-300" />
              <p className="mt-2 text-sm text-marble-400">No se encontraron piezas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
