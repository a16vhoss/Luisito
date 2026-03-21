import type { Desperdicio } from "@/types/database.types"

// ── Datos de demostración ──────────────────────────────────────────────────────

export const desperdiciosDemo: Desperdicio[] = [
  {
    id: "d-001",
    tipo_material: "Calacatta Gold",
    largo_cm: 145,
    ancho_cm: 62,
    espesor_cm: 2,
    es_irregular: false,
    calidad: "buena",
    ubicacion_planta: "Lote 1 - Rack A",
    foto_url: null,
    disponible: true,
    usado_en_pieza_id: null,
    lamina_id: null,
    notas: null,
    created_at: "2026-02-15T10:30:00Z",
  },
  {
    id: "d-002",
    tipo_material: "Nero Marquina",
    largo_cm: 88,
    ancho_cm: 45,
    espesor_cm: 2,
    es_irregular: false,
    calidad: "buena",
    ubicacion_planta: "Lote 1 - Rack B",
    foto_url: null,
    disponible: true,
    usado_en_pieza_id: null,
    lamina_id: null,
    notas: null,
    created_at: "2026-02-18T14:15:00Z",
  },
  {
    id: "d-003",
    tipo_material: "Blanco Carrara",
    largo_cm: 200,
    ancho_cm: 35,
    espesor_cm: 2,
    es_irregular: true,
    calidad: "regular",
    ubicacion_planta: "Lote 2 - Piso",
    foto_url: null,
    disponible: true,
    usado_en_pieza_id: null,
    lamina_id: null,
    notas: "Borde izquierdo irregular, medir antes de cortar",
    created_at: "2026-02-20T09:00:00Z",
  },
  {
    id: "d-004",
    tipo_material: "Crema Marfil",
    largo_cm: 120,
    ancho_cm: 60,
    espesor_cm: 2,
    es_irregular: false,
    calidad: "buena",
    ubicacion_planta: "Lote 1 - Rack C",
    foto_url: null,
    disponible: true,
    usado_en_pieza_id: null,
    lamina_id: null,
    notas: null,
    created_at: "2026-03-01T11:45:00Z",
  },
  {
    id: "d-005",
    tipo_material: "Emperador Dark",
    largo_cm: 55,
    ancho_cm: 40,
    espesor_cm: 3,
    es_irregular: false,
    calidad: "solo_piezas_pequeñas",
    ubicacion_planta: "Lote 2 - Rack A",
    foto_url: null,
    disponible: true,
    usado_en_pieza_id: null,
    lamina_id: null,
    notas: "Grieta en esquina superior derecha",
    created_at: "2026-03-05T08:20:00Z",
  },
  {
    id: "d-006",
    tipo_material: "Calacatta Gold",
    largo_cm: 75,
    ancho_cm: 50,
    espesor_cm: 2,
    es_irregular: true,
    calidad: "regular",
    ubicacion_planta: "Lote 1 - Rack A",
    foto_url: null,
    disponible: false,
    usado_en_pieza_id: "p-123",
    lamina_id: null,
    notas: null,
    created_at: "2026-01-10T16:00:00Z",
  },
  {
    id: "d-007",
    tipo_material: "Travertino Noce",
    largo_cm: 130,
    ancho_cm: 70,
    espesor_cm: 2,
    es_irregular: false,
    calidad: "buena",
    ubicacion_planta: "Lote 3 - Rack B",
    foto_url: null,
    disponible: true,
    usado_en_pieza_id: null,
    lamina_id: null,
    notas: null,
    created_at: "2026-03-10T13:30:00Z",
  },
  {
    id: "d-008",
    tipo_material: "Granito Gris Oxford",
    largo_cm: 95,
    ancho_cm: 48,
    espesor_cm: 3,
    es_irregular: false,
    calidad: "buena",
    ubicacion_planta: "Lote 2 - Rack C",
    foto_url: null,
    disponible: true,
    usado_en_pieza_id: null,
    lamina_id: null,
    notas: null,
    created_at: "2026-03-12T10:00:00Z",
  },
  {
    id: "d-009",
    tipo_material: "Negro Monterrey",
    largo_cm: 160,
    ancho_cm: 80,
    espesor_cm: 2,
    es_irregular: true,
    calidad: "buena",
    ubicacion_planta: "Lote 1 - Rack D",
    foto_url: null,
    disponible: false,
    usado_en_pieza_id: "p-456",
    lamina_id: null,
    notas: "Usado para cubierta de baño",
    created_at: "2025-12-20T09:15:00Z",
  },
  {
    id: "d-010",
    tipo_material: "Blanco Carrara",
    largo_cm: 68,
    ancho_cm: 52,
    espesor_cm: 2,
    es_irregular: false,
    calidad: "buena",
    ubicacion_planta: "Lote 3 - Rack A",
    foto_url: null,
    disponible: true,
    usado_en_pieza_id: null,
    lamina_id: null,
    notas: null,
    created_at: "2026-03-15T15:45:00Z",
  },
]

// ── Tipos de materiales disponibles ────────────────────────────────────────────

export const TIPOS_MATERIAL = [
  "Calacatta Gold",
  "Nero Marquina",
  "Blanco Carrara",
  "Crema Marfil",
  "Emperador Dark",
  "Travertino Noce",
  "Negro Monterrey",
  "Granito Gris Oxford",
] as const

// ── Búsqueda inteligente ───────────────────────────────────────────────────────

export interface BusquedaParams {
  largoCm: number
  anchoCm: number
  tipoMaterial?: string
}

export interface ResultadoBusqueda {
  desperdicio: Desperdicio
  orientacion: "normal" | "rotado"
  sobrante_largo_cm: number
  sobrante_ancho_cm: number
  porcentaje_aprovechamiento: number
}

export function buscarDesperdicioCompatible(
  params: BusquedaParams,
  desperdicios: Desperdicio[] = desperdiciosDemo
): ResultadoBusqueda[] {
  const { largoCm, anchoCm, tipoMaterial } = params
  const areaPieza = largoCm * anchoCm
  const resultados: ResultadoBusqueda[] = []

  for (const d of desperdicios) {
    if (!d.disponible) continue
    if (tipoMaterial && d.tipo_material !== tipoMaterial) continue

    const areaRetazo = d.largo_cm * d.ancho_cm

    // Orientación normal
    if (d.largo_cm >= largoCm && d.ancho_cm >= anchoCm) {
      resultados.push({
        desperdicio: d,
        orientacion: "normal",
        sobrante_largo_cm: d.largo_cm - largoCm,
        sobrante_ancho_cm: d.ancho_cm - anchoCm,
        porcentaje_aprovechamiento: Math.round((areaPieza / areaRetazo) * 100),
      })
      continue // no duplicar si ambas orientaciones funcionan
    }

    // Orientación rotada 90°
    if (d.largo_cm >= anchoCm && d.ancho_cm >= largoCm) {
      resultados.push({
        desperdicio: d,
        orientacion: "rotado",
        sobrante_largo_cm: d.largo_cm - anchoCm,
        sobrante_ancho_cm: d.ancho_cm - largoCm,
        porcentaje_aprovechamiento: Math.round((areaPieza / areaRetazo) * 100),
      })
    }
  }

  // Mejor aprovechamiento primero
  resultados.sort((a, b) => b.porcentaje_aprovechamiento - a.porcentaje_aprovechamiento)

  return resultados
}
