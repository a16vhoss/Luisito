"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Phone,
  FileText,
  Package,
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Camera,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Obra, ObraEstatus } from "@/types/database.types"

const statusLabels: Record<ObraEstatus, string> = {
  activa: "Activa",
  pausada: "Pausada",
  completada: "Completada",
  cancelada: "Cancelada",
}

const statusColors: Record<ObraEstatus, string> = {
  activa: "#22C55E",
  pausada: "#F59E0B",
  completada: "#3B82F6",
  cancelada: "#EF4444",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function ObraDetailPage() {
  const params = useParams()
  const obraId = params.id as string

  const [obra, setObra] = useState<Obra | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchObra() {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from("obras")
        .select("*")
        .eq("id", obraId)
        .single()

      if (fetchError) {
        setError("No se pudo cargar la obra.")
      } else {
        setObra(data as Obra)
      }
      setLoading(false)
    }
    if (obraId) fetchObra()
  }, [obraId])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4A843]" />
      </div>
    )
  }

  if (error || !obra) {
    return (
      <div className="space-y-4">
        <Link
          href="/director/obras"
          className="inline-flex items-center gap-1.5 text-sm text-[#7A6D5A] hover:text-[#1E1A14]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Obras
        </Link>
        <div className="flex h-48 items-center justify-center rounded-xl border border-[#E0DBD1] bg-white">
          <p className="text-sm text-[#7A6D5A]">{error ?? "Obra no encontrada."}</p>
        </div>
      </div>
    )
  }

  const color = statusColors[obra.estatus]
  const anticipoMonto = obra.contrato_total * (obra.anticipo_porcentaje / 100)
  const retencionMonto = obra.contrato_total * (obra.retencion_porcentaje / 100)

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/director/obras"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#7A6D5A] hover:text-[#1E1A14]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Obras
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#1E1A14]">{obra.nombre}</h1>
              <Badge
                className="text-xs"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                }}
              >
                {statusLabels[obra.estatus]}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Camera className="h-3.5 w-3.5" />
              Fotos
            </Button>
          </div>
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A]">
              <User className="h-4 w-4" />
              <span className="text-xs">Cliente</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#1E1A14]">{obra.cliente}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A]">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Ubicación</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#1E1A14]">
              {obra.ubicacion ?? "Sin especificar"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A]">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Fechas</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#1E1A14]">
              {formatDate(obra.fecha_inicio)} - {formatDate(obra.fecha_fin_estimada)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A]">
              <FileText className="h-4 w-4" />
              <span className="text-xs">Contrato</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#1E1A14]">
              {formatCurrency(obra.contrato_total)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Details + Notes */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detalles del Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            {obra.notas && (
              <p className="mb-4 text-sm text-[#7A6D5A] leading-relaxed">{obra.notas}</p>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-[#FAF9F7] p-3 text-center">
                <p className="text-2xl font-bold text-[#1E1A14]">
                  {obra.anticipo_porcentaje}%
                </p>
                <p className="text-xs text-[#7A6D5A]">Anticipo</p>
                <p className="mt-0.5 text-xs font-medium text-[#D4A843]">
                  {formatCurrency(anticipoMonto)}
                </p>
              </div>
              <div className="rounded-lg bg-[#FAF9F7] p-3 text-center">
                <p className="text-2xl font-bold text-[#1E1A14]">
                  {formatCurrency(obra.anticipo_recibido)}
                </p>
                <p className="text-xs text-[#7A6D5A]">Anticipo Recibido</p>
              </div>
              <div className="rounded-lg bg-[#FAF9F7] p-3 text-center">
                <p className="text-2xl font-bold text-[#1E1A14]">
                  {obra.retencion_porcentaje}%
                </p>
                <p className="text-xs text-[#7A6D5A]">Retención</p>
                <p className="mt-0.5 text-xs font-medium text-[#7A6D5A]">
                  {formatCurrency(retencionMonto)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline / Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Información</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#7A6D5A]">Estatus</p>
                <Badge
                  className="mt-1 text-xs"
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                  }}
                >
                  {statusLabels[obra.estatus]}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-[#7A6D5A]">Fecha de Inicio</p>
                <p className="text-sm font-medium text-[#1E1A14]">
                  {formatDate(obra.fecha_inicio)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#7A6D5A]">Entrega Estimada</p>
                <p className="text-sm font-medium text-[#1E1A14]">
                  {formatDate(obra.fecha_fin_estimada)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#7A6D5A]">Creada</p>
                <p className="text-sm font-medium text-[#1E1A14]">
                  {formatDate(obra.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
