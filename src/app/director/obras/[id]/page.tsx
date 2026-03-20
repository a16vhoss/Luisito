"use client"

import { useParams } from "next/navigation"
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
} from "lucide-react"

// Mock obra detail
const obraDetail = {
  id: "OBR-001",
  nombre: "Residencia \"Las Nubes\"",
  cliente: "Arq. Roberto Medina",
  clienteTel: "+52 999 123 4567",
  ubicacion: "Calle 60 #480, Col. Centro, Mérida, Yucatán",
  tipo: "Residencial",
  fechaInicio: "15 Ene 2026",
  fechaEntrega: "30 Abr 2026",
  presupuesto: "$485,000 MXN",
  avance: 93,
  status: "A Tiempo",
  color: "#22C55E",
  descripcion:
    "Instalación de pisos y revestimientos de mármol Carrara en cocina, 3 baños y escalera principal. Incluye cortes especiales y acabado pulido.",
  responsable: "Ing. Carlos Pérez",
  piezas: { entregadas: 42, total: 45, enProceso: 3 },
  m2Instalados: 108,
  m2Total: 120,
}

const remisiones = [
  {
    id: "REM-0142",
    fecha: "18 Mar 2026",
    material: "Carrara White 60x60",
    cantidad: "12 pzas",
    chofer: "Juan Canul",
    status: "Entregada",
  },
  {
    id: "REM-0138",
    fecha: "15 Mar 2026",
    material: "Carrara White 30x60",
    cantidad: "8 pzas",
    chofer: "Pedro Pech",
    status: "Entregada",
  },
  {
    id: "REM-0135",
    fecha: "12 Mar 2026",
    material: "Carrara White Escalera",
    cantidad: "6 pzas",
    chofer: "Juan Canul",
    status: "Entregada",
  },
  {
    id: "REM-0150",
    fecha: "20 Mar 2026",
    material: "Carrara White 60x60",
    cantidad: "3 pzas",
    chofer: "Pedro Pech",
    status: "En Tránsito",
  },
]

const personal = [
  { nombre: "Miguel Ángel Tun", rol: "Instalador Senior", status: "En obra", horas: "8h" },
  { nombre: "José Luis Chi", rol: "Instalador", status: "En obra", horas: "8h" },
  { nombre: "Ricardo May", rol: "Ayudante", status: "En obra", horas: "6h" },
]

const timeline = [
  { fecha: "18 Mar", evento: "Entrega parcial: 12 piezas Carrara 60x60", tipo: "entrega" },
  { fecha: "17 Mar", evento: "Inspección de calidad aprobada - Baño principal", tipo: "check" },
  { fecha: "15 Mar", evento: "Instalación completada - Cocina", tipo: "check" },
  { fecha: "12 Mar", evento: "Retraso menor por lluvia - 1 día", tipo: "alerta" },
  { fecha: "10 Mar", evento: "Inicio fase 3: Escalera principal", tipo: "evento" },
]

export default function ObraDetailPage() {
  const params = useParams()

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/obras"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#7A6D5A] hover:text-[#1E1A14]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Obras
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#1E1A14]">{obraDetail.nombre}</h1>
              <Badge
                className="text-xs"
                style={{
                  backgroundColor: `${obraDetail.color}20`,
                  color: obraDetail.color,
                }}
              >
                {obraDetail.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[#7A6D5A]">
              {obraDetail.id} &bull; {obraDetail.tipo}
            </p>
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
            <p className="mt-1 text-sm font-semibold text-[#1E1A14]">{obraDetail.cliente}</p>
            <p className="text-xs text-[#7A6D5A]">{obraDetail.clienteTel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A]">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Ubicación</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#1E1A14]">{obraDetail.ubicacion}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A]">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Fechas</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#1E1A14]">
              {obraDetail.fechaInicio} - {obraDetail.fechaEntrega}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#7A6D5A]">
              <FileText className="h-4 w-4" />
              <span className="text-xs">Presupuesto</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#1E1A14]">{obraDetail.presupuesto}</p>
            <p className="text-xs text-[#7A6D5A]">Resp: {obraDetail.responsable}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress + Description */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Descripción del Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#7A6D5A] leading-relaxed">{obraDetail.descripcion}</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-[#FAF9F7] p-3 text-center">
                <p className="text-2xl font-bold text-[#1E1A14]">
                  {obraDetail.piezas.entregadas}/{obraDetail.piezas.total}
                </p>
                <p className="text-xs text-[#7A6D5A]">Piezas Entregadas</p>
              </div>
              <div className="rounded-lg bg-[#FAF9F7] p-3 text-center">
                <p className="text-2xl font-bold text-[#1E1A14]">
                  {obraDetail.m2Instalados}/{obraDetail.m2Total}
                </p>
                <p className="text-xs text-[#7A6D5A]">m² Instalados</p>
              </div>
              <div className="rounded-lg bg-[#FAF9F7] p-3 text-center">
                <p className="text-2xl font-bold text-[#1E1A14]">{obraDetail.avance}%</p>
                <p className="text-xs text-[#7A6D5A]">Avance General</p>
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-[#F0EDE8]">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${obraDetail.avance}%`,
                  backgroundColor: obraDetail.color,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {item.tipo === "check" ? (
                      <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                    ) : item.tipo === "alerta" ? (
                      <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                    ) : item.tipo === "entrega" ? (
                      <Truck className="h-4 w-4 text-[#D4A843]" />
                    ) : (
                      <Clock className="h-4 w-4 text-[#7A6D5A]" />
                    )}
                    {i < timeline.length - 1 && (
                      <div className="mt-1 h-full w-px bg-[#E0DBD1]" />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs font-medium text-[#1E1A14]">{item.evento}</p>
                    <p className="text-[10px] text-[#7A6D5A]">{item.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Remisiones / Personal */}
      <Tabs defaultValue="remisiones">
        <TabsList>
          <TabsTrigger value="remisiones">Remisiones</TabsTrigger>
          <TabsTrigger value="personal">Personal Asignado</TabsTrigger>
        </TabsList>
        <TabsContent value="remisiones">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Remisión</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Chofer</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {remisiones.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="text-sm">{r.fecha}</TableCell>
                      <TableCell className="text-sm">{r.material}</TableCell>
                      <TableCell className="text-sm">{r.cantidad}</TableCell>
                      <TableCell className="text-sm">{r.chofer}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            r.status === "Entregada"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="personal">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Horas Hoy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personal.map((p) => (
                    <TableRow key={p.nombre}>
                      <TableCell className="font-medium">{p.nombre}</TableCell>
                      <TableCell className="text-sm">{p.rol}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-700">{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{p.horas}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
