import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { obraId } = await req.json()

    if (!obraId) {
      return NextResponse.json(
        { error: "obraId is required" },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // ── 0. Verify the obra exists ──────────────────────────────
    const { data: obra, error: obraError } = await supabase
      .from("obras")
      .select("id, nombre")
      .eq("id", obraId)
      .single()

    if (obraError || !obra) {
      return NextResponse.json(
        { error: `Obra not found: ${obraError?.message ?? "no data"}` },
        { status: 404 }
      )
    }

    // ── 1. Find users for remisiones ───────────────────────────
    const { data: choferes } = await supabase
      .from("users")
      .select("id")
      .eq("role", "chofer")
      .eq("activo", true)
      .limit(1)

    const { data: jefesTaller } = await supabase
      .from("users")
      .select("id")
      .eq("role", "jefe_taller")
      .eq("activo", true)
      .limit(1)

    const choferId = choferes?.[0]?.id ?? null
    const jefeTallerId = jefesTaller?.[0]?.id ?? null

    const warnings: string[] = []

    // ── 2. Clean up existing data (order matters for FK) ───────
    // Delete remision_items via cascade on remisiones delete
    const { error: delRemErr } = await supabase
      .from("remisiones")
      .delete()
      .eq("obra_id", obraId)

    if (delRemErr) {
      return NextResponse.json(
        { error: `Failed to delete existing remisiones: ${delRemErr.message}` },
        { status: 500 }
      )
    }

    const { error: delConErr } = await supabase
      .from("conceptos_obra")
      .delete()
      .eq("obra_id", obraId)

    if (delConErr) {
      return NextResponse.json(
        { error: `Failed to delete existing conceptos: ${delConErr.message}` },
        { status: 500 }
      )
    }

    const { error: delFinErr } = await supabase
      .from("finanzas_obra")
      .delete()
      .eq("obra_id", obraId)

    if (delFinErr) {
      return NextResponse.json(
        { error: `Failed to delete existing finanzas: ${delFinErr.message}` },
        { status: 500 }
      )
    }

    const { error: delEstErr } = await supabase
      .from("estimaciones")
      .delete()
      .eq("obra_id", obraId)

    if (delEstErr) {
      return NextResponse.json(
        { error: `Failed to delete existing estimaciones: ${delEstErr.message}` },
        { status: 500 }
      )
    }

    // ── A. Insert conceptos_obra ───────────────────────────────
    const conceptosData = [
      {
        obra_id: obraId,
        tipo_pieza: "Piso vestíbulo 60x60",
        descripcion: "Piso vestíbulo 60x60",
        material_tipo: "Mármol Calacatta Gold",
        medida_largo: 60,
        medida_ancho: 60,
        medida_espesor: 2,
        cantidad_vendida: 85,
        cantidad_enviada: 72,
        cantidad_instalada: 65,
        cantidad_verificada: 60,
        precio_unitario: 3800,
      },
      {
        obra_id: obraId,
        tipo_pieza: "Muro recepción 120x60",
        descripcion: "Muro recepción 120x60",
        material_tipo: "Mármol Calacatta Gold",
        medida_largo: 120,
        medida_ancho: 60,
        medida_espesor: 2,
        cantidad_vendida: 24,
        cantidad_enviada: 24,
        cantidad_instalada: 20,
        cantidad_verificada: 18,
        precio_unitario: 7200,
      },
      {
        obra_id: obraId,
        tipo_pieza: "Cubierta bar 240x70",
        descripcion: "Cubierta bar 240x70",
        material_tipo: "Granito Negro Absoluto",
        medida_largo: 240,
        medida_ancho: 70,
        medida_espesor: 3,
        cantidad_vendida: 4,
        cantidad_enviada: 4,
        cantidad_instalada: 4,
        cantidad_verificada: 4,
        precio_unitario: 15500,
      },
      {
        obra_id: obraId,
        tipo_pieza: "Piso baños 40x40",
        descripcion: "Piso baños 40x40",
        material_tipo: "Mármol Crema Marfil",
        medida_largo: 40,
        medida_ancho: 40,
        medida_espesor: 2,
        cantidad_vendida: 120,
        cantidad_enviada: 100,
        cantidad_instalada: 85,
        cantidad_verificada: 70,
        precio_unitario: 1900,
      },
      {
        obra_id: obraId,
        tipo_pieza: "Escalón principal 120x30",
        descripcion: "Escalón principal 120x30",
        material_tipo: "Granito Negro Absoluto",
        medida_largo: 120,
        medida_ancho: 30,
        medida_espesor: 3,
        cantidad_vendida: 18,
        cantidad_enviada: 18,
        cantidad_instalada: 12,
        cantidad_verificada: 10,
        precio_unitario: 4200,
      },
      {
        obra_id: obraId,
        tipo_pieza: "Zócalo perimetral 60x10",
        descripcion: "Zócalo perimetral 60x10",
        material_tipo: "Mármol Crema Marfil",
        medida_largo: 60,
        medida_ancho: 10,
        medida_espesor: 2,
        cantidad_vendida: 200,
        cantidad_enviada: 180,
        cantidad_instalada: 150,
        cantidad_verificada: 130,
        precio_unitario: 650,
      },
    ]

    const { data: conceptos, error: conceptosError } = await supabase
      .from("conceptos_obra")
      .insert(conceptosData)
      .select("id, tipo_pieza")

    if (conceptosError || !conceptos) {
      return NextResponse.json(
        { error: `Failed to insert conceptos: ${conceptosError?.message}` },
        { status: 500 }
      )
    }

    // Map concept names to IDs for remision_items
    const conceptoMap = new Map(
      conceptos.map((c: { id: string; tipo_pieza: string }) => [c.tipo_pieza, c.id])
    )

    // ── B. Insert remisiones + remision_items ──────────────────
    let remisionesInserted = 0
    let remisionItemsInserted = 0

    if (!jefeTallerId) {
      warnings.push(
        "No user with role 'jefe_taller' found. Skipping remisiones."
      )
    } else {
      const remisionesData = [
        {
          folio: "",
          obra_id: obraId,
          chofer_id: choferId,
          creado_por: jefeTallerId,
          estatus: "entregada",
          notas: "Entrega piso vestíbulo - lote 1",
          created_at: "2026-03-05T10:00:00Z",
        },
        {
          folio: "",
          obra_id: obraId,
          chofer_id: choferId,
          creado_por: jefeTallerId,
          estatus: "entregada",
          notas: "Muros recepción completos",
          created_at: "2026-03-10T10:00:00Z",
        },
        {
          folio: "",
          obra_id: obraId,
          chofer_id: choferId,
          creado_por: jefeTallerId,
          estatus: "entregada",
          notas: "Cubiertas bar y escalones",
          created_at: "2026-03-14T10:00:00Z",
        },
        {
          folio: "",
          obra_id: obraId,
          chofer_id: choferId,
          creado_por: jefeTallerId,
          estatus: "en_transito",
          notas: "Piso baños segunda entrega",
          created_at: "2026-03-19T10:00:00Z",
        },
        {
          folio: "",
          obra_id: obraId,
          chofer_id: choferId,
          creado_por: jefeTallerId,
          estatus: "creada",
          notas: "Zócalo perimetral - pendiente despacho",
          created_at: "2026-03-20T10:00:00Z",
        },
      ]

      const { data: remisiones, error: remisionesError } = await supabase
        .from("remisiones")
        .insert(remisionesData)
        .select("id, notas")

      if (remisionesError || !remisiones) {
        return NextResponse.json(
          {
            error: `Failed to insert remisiones: ${remisionesError?.message}`,
          },
          { status: 500 }
        )
      }

      remisionesInserted = remisiones.length

      // Build remision_items linking remisiones to conceptos
      const remisionItemsData = [
        // Remision 1: Piso vestíbulo lote 1
        {
          remision_id: remisiones[0].id,
          concepto_id: conceptoMap.get("Piso vestíbulo 60x60"),
          cantidad: 40,
          descripcion: "Piso vestíbulo lote 1",
        },
        // Remision 2: Muros recepción
        {
          remision_id: remisiones[1].id,
          concepto_id: conceptoMap.get("Muro recepción 120x60"),
          cantidad: 24,
          descripcion: "Muros recepción completos",
        },
        // Remision 3: Cubiertas bar + escalones
        {
          remision_id: remisiones[2].id,
          concepto_id: conceptoMap.get("Cubierta bar 240x70"),
          cantidad: 4,
          descripcion: "Cubiertas bar completas",
        },
        {
          remision_id: remisiones[2].id,
          concepto_id: conceptoMap.get("Escalón principal 120x30"),
          cantidad: 18,
          descripcion: "Escalones principales",
        },
        // Remision 4: Piso baños
        {
          remision_id: remisiones[3].id,
          concepto_id: conceptoMap.get("Piso baños 40x40"),
          cantidad: 60,
          descripcion: "Piso baños segunda entrega",
        },
        // Remision 5: Zócalo perimetral
        {
          remision_id: remisiones[4].id,
          concepto_id: conceptoMap.get("Zócalo perimetral 60x10"),
          cantidad: 80,
          descripcion: "Zócalo perimetral parcial",
        },
        {
          remision_id: remisiones[4].id,
          concepto_id: conceptoMap.get("Piso vestíbulo 60x60"),
          cantidad: 32,
          descripcion: "Piso vestíbulo lote 2",
        },
      ]

      const { data: remisionItems, error: remisionItemsError } = await supabase
        .from("remision_items")
        .insert(remisionItemsData)
        .select("id")

      if (remisionItemsError) {
        return NextResponse.json(
          {
            error: `Failed to insert remision_items: ${remisionItemsError.message}`,
          },
          { status: 500 }
        )
      }

      remisionItemsInserted = remisionItems?.length ?? 0
    }

    // ── C. Insert finanzas_obra ────────────────────────────────
    const { error: finanzasError } = await supabase
      .from("finanzas_obra")
      .insert({
        obra_id: obraId,
        contrato_total: 1000000,
        anticipo_recibido: 300000,
        estimado_acumulado: 650000,
        retenido_acumulado: 32500,
        cobrado_acumulado: 520000,
      })

    if (finanzasError) {
      return NextResponse.json(
        { error: `Failed to insert finanzas_obra: ${finanzasError.message}` },
        { status: 500 }
      )
    }

    // ── D. Insert estimaciones ─────────────────────────────────
    const estimacionesData = [
      {
        obra_id: obraId,
        numero: 1,
        monto_bruto: 250000,
        retenciones: 12500,
        monto_neto: 237500,
        estatus: "cobrada",
        piezas_incluidas:
          "Piso vestíbulo lote 1 (40 pzas) + Muros recepción (24 pzas)",
      },
      {
        obra_id: obraId,
        numero: 2,
        monto_bruto: 280000,
        retenciones: 14000,
        monto_neto: 266000,
        estatus: "cobrada",
        piezas_incluidas:
          "Piso vestíbulo lote 2 (32 pzas) + Cubiertas bar (4 pzas) + Escalones (18 pzas)",
      },
      {
        obra_id: obraId,
        numero: 3,
        monto_bruto: 120000,
        retenciones: 6000,
        monto_neto: 114000,
        estatus: "enviada",
        piezas_incluidas:
          "Piso baños (60 pzas) + Zócalo parcial (80 pzas)",
      },
    ]

    const { data: estimaciones, error: estimacionesError } = await supabase
      .from("estimaciones")
      .insert(estimacionesData)
      .select("id")

    if (estimacionesError) {
      return NextResponse.json(
        {
          error: `Failed to insert estimaciones: ${estimacionesError.message}`,
        },
        { status: 500 }
      )
    }

    // ── Response ───────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      obra: obra.nombre,
      inserted: {
        conceptos_obra: conceptos.length,
        remisiones: remisionesInserted,
        remision_items: remisionItemsInserted,
        finanzas_obra: 1,
        estimaciones: estimaciones?.length ?? 0,
      },
      ...(warnings.length > 0 ? { warnings } : {}),
    })
  } catch (err) {
    console.error("Seed obra error:", err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unknown error during seeding",
      },
      { status: 500 }
    )
  }
}
