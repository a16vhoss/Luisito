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
  FileText,
  Package,
  Truck,
  CheckCircle2,
  Download,
  Camera,
  Loader2,
  DollarSign,
  Eye,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type {
  Obra,
  ObraEstatus,
  ConceptoObra,
  Remision,
  FinanzasObra,
  Estimacion,
  EstimacionEstatus,
} from "@/types/database.types"

// ── Helpers ──────────────────────────────────────────────────────────────

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

const remisionStatusStyles: Record<string, string> = {
  creada: "bg-stone-100 text-stone-700",
  en_transito: "bg-blue-100 text-blue-700",
  entregada: "bg-emerald-100 text-emerald-700",
}

const remisionStatusLabels: Record<string, string> = {
  creada: "Creada",
  en_transito: "En Tránsito",
  entregada: "Entregada",
}

const estimacionStatusStyles: Record<EstimacionEstatus, string> = {
  borrador: "bg-stone-100 text-stone-700",
  enviada: "bg-blue-100 text-blue-700",
  cobrada: "bg-emerald-100 text-emerald-700",
}

const estimacionStatusLabels: Record<EstimacionEstatus, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  cobrada: "Cobrada",
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

// ── Segmented Progress Bar for a single concepto ─────────────────────────

function ConceptoProgressBar({ concepto }: { concepto: ConceptoObra }) {
  const total = concepto.cantidad_vendida || 1
  const verificadas = (concepto.cantidad_verificada / total) * 100
  const instaladas = ((concepto.cantidad_instalada - concepto.cantidad_verificada) / total) * 100
  const enviadas = ((concepto.cantidad_enviada - concepto.cantidad_instalada) / total) * 100

  // Clamp negatives to 0 (in case of data inconsistencies)
  const seg = {
    verificadas: Math.max(0, verificadas),
    instaladas: Math.max(0, instaladas),
    enviadas: Math.max(0, enviadas),
  }
  const pendientes = Math.max(0, 100 - seg.verificadas - seg.instaladas - seg.enviadas)

  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-stone-200">
      {seg.verificadas > 0 && (
        <div
          className="bg-emerald-500"
          style={{ width: `${seg.verificadas}%` }}
        />
      )}
      {seg.instaladas > 0 && (
        <div
          className="bg-blue-500"
          style={{ width: `${seg.instaladas}%` }}
        />
      )}
      {seg.enviadas > 0 && (
        <div
          className="bg-amber-500"
          style={{ width: `${seg.enviadas}%` }}
        />
      )}
      {pendientes > 0 && (
        <div
          className="bg-stone-300"
          style={{ width: `${pendientes}%` }}
        />
      )}
    </div>
  )
}

// ── Empty state component ────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[#E0DBD1]">
      <p className="text-sm text-[#7A6D5A]">{message}</p>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────

export default function ObraDetailPage() {
  const params = useParams()
  const obraId = params.id as string

  const [obra, setObra] = useState<Obra | null>(null)
  const [conceptos, setConceptos] = useState<ConceptoObra[]>([])
  const [remisiones, setRemisiones] = useState<Remision[]>([])
  const [finanzas, setFinanzas] = useState<FinanzasObra | null>(null)
  const [estimaciones, setEstimaciones] = useState<Estimacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAll() {
      const supabase = createClient()

      // Fetch all in parallel
      const [obraRes, conceptosRes, remisionesRes, finanzasRes, estimacionesRes] =
        await Promise.all([
          supabase.from("obras").select("*").eq("id", obraId).single(),
          supabase.from("conceptos_obra").select("*").eq("obra_id", obraId),
          supabase
            .from("remisiones")
            .select("*, chofer:users!chofer_id(nombre)")
            .eq("obra_id", obraId)
            .order("created_at", { ascending: false }),
          supabase.from("finanzas_obra").select("*").eq("obra_id", obraId).single(),
          supabase
            .from("estimaciones")
            .select("*")
            .eq("obra_id", obraId)
            .order("numero"),
        ])

      if (obraRes.error) {
        setError("No se pudo cargar la obra.")
        setLoading(false)
        return
      }

      setObra(obraRes.data as Obra)
      setConceptos((conceptosRes.data as ConceptoObra[]) ?? [])
      setRemisiones((remisionesRes.data as Remision[]) ?? [])
      setFinanzas(finanzasRes.data ? (finanzasRes.data as FinanzasObra) : null)
      setEstimaciones((estimacionesRes.data as Estimacion[]) ?? [])
      setLoading(false)
    }

    if (obraId) fetchAll()
  }, [obraId])

  // ── Loading state ──

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4A843]" />
      </div>
    )
  }

  // ── Error state ──

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

  // ── Derived data ──

  const color = statusColors[obra.estatus]

  const totals = conceptos.reduce(
    (acc, c) => ({
      vendidas: acc.vendidas + c.cantidad_vendida,
      enviadas: acc.enviadas + c.cantidad_enviada,
      instaladas: acc.instaladas + c.cantidad_instalada,
      verificadas: acc.verificadas + c.cantidad_verificada,
    }),
    { vendidas: 0, enviadas: 0, instaladas: 0, verificadas: 0 }
  )

  const overallProgress =
    totals.vendidas > 0
      ? Math.round((totals.verificadas / totals.vendidas) * 100)
      : 0

  const porCobrar = finanzas
    ? finanzas.estimado_acumulado - finanzas.cobrado_acumulado
    : 0

  // ── Render ──

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

      {/* 4 Info Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border-[#E0DBD1] bg-[#FAF9F7]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A]">
              <User className="h-4 w-4" />
              <span className="text-xs">Cliente</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#1E1A14]">{obra.cliente}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-[#E0DBD1] bg-[#FAF9F7]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A]">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Ubicacion</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#1E1A14]">
              {obra.ubicacion ?? "Sin especificar"}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-[#E0DBD1] bg-[#FAF9F7]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A]">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Fechas</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#1E1A14]">
              {formatDate(obra.fecha_inicio)} – {formatDate(obra.fecha_fin_estimada)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-[#E0DBD1] bg-[#FAF9F7]">
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

      {/* Progress Section (2 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Avance de Piezas (2/3) */}
        <Card className="col-span-1 rounded-xl border-[#E0DBD1] lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1E1A14]">Avance de Piezas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {conceptos.length === 0 ? (
              <EmptyState message="Sin conceptos registrados" />
            ) : (
              <>
                {/* 4 big numbers */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg bg-[#F0EDE8] p-4 text-center">
                    <Package className="mx-auto mb-1 h-5 w-5 text-[#7A6D5A]" />
                    <p className="text-2xl font-bold text-[#1E1A14]">{totals.vendidas}</p>
                    <p className="text-xs text-[#7A6D5A]">Vendidas</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-4 text-center">
                    <Truck className="mx-auto mb-1 h-5 w-5 text-amber-600" />
                    <p className="text-2xl font-bold text-amber-700">{totals.enviadas}</p>
                    <p className="text-xs text-amber-600">Enviadas</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4 text-center">
                    <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-700">{totals.instaladas}</p>
                    <p className="text-xs text-blue-600">Instaladas</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4 text-center">
                    <Eye className="mx-auto mb-1 h-5 w-5 text-emerald-600" />
                    <p className="text-2xl font-bold text-emerald-700">{totals.verificadas}</p>
                    <p className="text-xs text-emerald-600">Verificadas</p>
                  </div>
                </div>

                {/* Overall progress bar */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-sm font-medium text-[#1E1A14]">Progreso General</p>
                    <p className="text-sm font-bold text-[#D4A843]">{overallProgress}%</p>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-[#D4A843] transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#7A6D5A]">
                    {totals.verificadas} de {totals.vendidas} piezas verificadas
                  </p>
                </div>

                {/* Conceptos table */}
                <div className="overflow-x-auto rounded-lg border border-[#E0DBD1]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F0EDE8]">
                        <TableHead className="text-xs text-[#7A6D5A]">Concepto</TableHead>
                        <TableHead className="text-center text-xs text-[#7A6D5A]">Material</TableHead>
                        <TableHead className="text-center text-xs text-[#7A6D5A]">Medida</TableHead>
                        <TableHead className="text-center text-xs text-[#7A6D5A]">Vend.</TableHead>
                        <TableHead className="text-center text-xs text-[#7A6D5A]">Env.</TableHead>
                        <TableHead className="text-center text-xs text-[#7A6D5A]">Inst.</TableHead>
                        <TableHead className="text-center text-xs text-[#7A6D5A]">Verif.</TableHead>
                        <TableHead className="min-w-[120px] text-xs text-[#7A6D5A]">Avance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conceptos.map((c) => (
                        <TableRow key={c.id} className="border-[#E0DBD1]">
                          <TableCell className="text-sm font-medium text-[#1E1A14]">
                            {c.tipo_pieza}
                            {c.descripcion && (
                              <span className="block text-xs text-[#7A6D5A]">{c.descripcion}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center text-xs text-[#7A6D5A]">
                            {c.material_tipo}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-center text-xs text-[#7A6D5A]">
                            {c.medida_largo}x{c.medida_ancho}
                            {c.medida_espesor ? `x${c.medida_espesor}` : ""}
                          </TableCell>
                          <TableCell className="text-center text-sm">{c.cantidad_vendida}</TableCell>
                          <TableCell className="text-center text-sm text-amber-700">
                            {c.cantidad_enviada}
                          </TableCell>
                          <TableCell className="text-center text-sm text-blue-700">
                            {c.cantidad_instalada}
                          </TableCell>
                          <TableCell className="text-center text-sm text-emerald-700">
                            {c.cantidad_verificada}
                          </TableCell>
                          <TableCell>
                            <ConceptoProgressBar concepto={c} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-xs text-[#7A6D5A]">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Verificadas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                    Instaladas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
                    Enviadas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-stone-300" />
                    Pendientes
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right: Informacion (1/3) */}
        <Card className="rounded-xl border-[#E0DBD1]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1E1A14]">Informacion</CardTitle>
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
                <p className="text-xs text-[#7A6D5A]">Anticipo</p>
                <p className="text-sm font-medium text-[#1E1A14]">
                  {obra.anticipo_porcentaje}%
                </p>
              </div>
              <div>
                <p className="text-xs text-[#7A6D5A]">Retencion</p>
                <p className="text-sm font-medium text-[#1E1A14]">
                  {obra.retencion_porcentaje}%
                </p>
              </div>
              <div>
                <p className="text-xs text-[#7A6D5A]">Creada</p>
                <p className="text-sm font-medium text-[#1E1A14]">
                  {formatDate(obra.created_at)}
                </p>
              </div>
              {obra.notas && (
                <div>
                  <p className="text-xs text-[#7A6D5A]">Notas</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-[#1E1A14]">
                    {obra.notas}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Remisiones | Finanzas */}
      <Tabs defaultValue="remisiones" className="w-full">
        <TabsList className="mb-4 border-[#E0DBD1] bg-[#F0EDE8]">
          <TabsTrigger value="remisiones" className="gap-1.5 text-sm">
            <Truck className="h-3.5 w-3.5" />
            Remisiones
          </TabsTrigger>
          <TabsTrigger value="finanzas" className="gap-1.5 text-sm">
            <DollarSign className="h-3.5 w-3.5" />
            Finanzas
          </TabsTrigger>
        </TabsList>

        {/* ── Remisiones Tab ── */}
        <TabsContent value="remisiones">
          <Card className="rounded-xl border-[#E0DBD1]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#1E1A14]">Remisiones</CardTitle>
            </CardHeader>
            <CardContent>
              {remisiones.length === 0 ? (
                <EmptyState message="Sin remisiones registradas" />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-[#E0DBD1]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F0EDE8]">
                        <TableHead className="text-xs text-[#7A6D5A]">Folio</TableHead>
                        <TableHead className="text-xs text-[#7A6D5A]">Fecha</TableHead>
                        <TableHead className="text-xs text-[#7A6D5A]">Estatus</TableHead>
                        <TableHead className="text-xs text-[#7A6D5A]">Chofer</TableHead>
                        <TableHead className="text-xs text-[#7A6D5A]">Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {remisiones.map((r) => (
                        <TableRow key={r.id} className="border-[#E0DBD1]">
                          <TableCell className="text-sm font-medium text-[#1E1A14]">
                            {r.folio}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-[#7A6D5A]">
                            {formatDate(r.created_at)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${remisionStatusStyles[r.estatus] ?? "bg-stone-100 text-stone-700"}`}
                            >
                              {remisionStatusLabels[r.estatus] ?? r.estatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-[#1E1A14]">
                            {(r.chofer as { nombre: string } | null)?.nombre ?? "—"}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-[#7A6D5A]">
                            {r.notas ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Finanzas Tab ── */}
        <TabsContent value="finanzas">
          <div className="space-y-6">
            {/* Financial summary cards */}
            {finanzas ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card className="rounded-xl border-[#E0DBD1] bg-[#FAF9F7]">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-[#7A6D5A]">Contrato</p>
                    <p className="mt-1 text-lg font-bold text-[#1E1A14]">
                      {formatCurrency(finanzas.contrato_total)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-[#E0DBD1] bg-[#FAF9F7]">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-[#7A6D5A]">Anticipo Recibido</p>
                    <p className="mt-1 text-lg font-bold text-emerald-700">
                      {formatCurrency(finanzas.anticipo_recibido)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-[#E0DBD1] bg-[#FAF9F7]">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-[#7A6D5A]">Estimado Acumulado</p>
                    <p className="mt-1 text-lg font-bold text-blue-700">
                      {formatCurrency(finanzas.estimado_acumulado)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-[#E0DBD1] bg-[#FAF9F7]">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-[#7A6D5A]">Cobrado</p>
                    <p className="mt-1 text-lg font-bold text-[#D4A843]">
                      {formatCurrency(finanzas.cobrado_acumulado)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-[#E0DBD1] bg-[#FAF9F7]">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-[#7A6D5A]">Por Cobrar</p>
                    <p className="mt-1 text-lg font-bold text-red-600">
                      {formatCurrency(porCobrar)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <EmptyState message="Sin datos financieros registrados" />
            )}

            {/* Estimaciones table */}
            <Card className="rounded-xl border-[#E0DBD1]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#1E1A14]">Estimaciones</CardTitle>
              </CardHeader>
              <CardContent>
                {estimaciones.length === 0 ? (
                  <EmptyState message="Sin estimaciones registradas" />
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-[#E0DBD1]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#F0EDE8]">
                          <TableHead className="text-xs text-[#7A6D5A]">#</TableHead>
                          <TableHead className="text-xs text-[#7A6D5A]">Fecha</TableHead>
                          <TableHead className="text-xs text-[#7A6D5A]">Estatus</TableHead>
                          <TableHead className="text-right text-xs text-[#7A6D5A]">
                            Monto Bruto
                          </TableHead>
                          <TableHead className="text-right text-xs text-[#7A6D5A]">
                            Retenciones
                          </TableHead>
                          <TableHead className="text-right text-xs text-[#7A6D5A]">
                            Monto Neto
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {estimaciones.map((e) => (
                          <TableRow key={e.id} className="border-[#E0DBD1]">
                            <TableCell className="text-sm font-medium text-[#1E1A14]">
                              {e.numero}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-[#7A6D5A]">
                              {formatDate(e.created_at)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${estimacionStatusStyles[e.estatus]}`}
                              >
                                {estimacionStatusLabels[e.estatus]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm text-[#1E1A14]">
                              {formatCurrency(e.monto_bruto)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-red-600">
                              -{formatCurrency(e.retenciones)}
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold text-[#1E1A14]">
                              {formatCurrency(e.monto_neto)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
