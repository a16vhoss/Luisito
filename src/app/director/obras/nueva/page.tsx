"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  HardHat,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function NuevaObraPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nombre: "",
    cliente: "",
    ubicacion: "",
    contrato_total: "",
    anticipo_porcentaje: "30",
    retencion_porcentaje: "5",
    fecha_inicio: "",
    fecha_fin_estimada: "",
    notas: "",
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.nombre.trim()) { setError("El nombre de la obra es requerido."); return }
    if (!form.cliente.trim()) { setError("El cliente es requerido."); return }
    if (!form.contrato_total || parseFloat(form.contrato_total) <= 0) {
      setError("Ingresa un monto de contrato válido.")
      return
    }

    setSaving(true)

    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from("obras").insert({
        nombre: form.nombre.trim(),
        cliente: form.cliente.trim(),
        ubicacion: form.ubicacion.trim() || null,
        contrato_total: parseFloat(form.contrato_total),
        anticipo_porcentaje: parseFloat(form.anticipo_porcentaje) || 0,
        retencion_porcentaje: parseFloat(form.retencion_porcentaje) || 0,
        estatus: "activa",
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin_estimada: form.fecha_fin_estimada || null,
        notas: form.notas.trim() || null,
      })

      if (dbError) throw dbError
      router.push("/director/obras")
    } catch (err: any) {
      setError(err.message || "Error al guardar la obra.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/director/obras"
          className="rounded-lg border border-[#E0DBD1] p-2 text-[#7A6D5A] hover:bg-[#F0EDE8]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Nueva Obra</h1>
          <p className="text-sm text-[#7A6D5A]">Registrar un nuevo proyecto</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info general */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#1E1A14] flex items-center gap-2">
            <HardHat className="h-4 w-4 text-[#D4A843]" />
            Informaci&oacute;n General
          </h2>

          <div>
            <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">
              Nombre de la obra *
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => updateField("nombre", e.target.value)}
              placeholder='Ej. Residencia "Las Nubes"'
              className="h-10 w-full rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">
              Cliente *
            </label>
            <input
              type="text"
              value={form.cliente}
              onChange={(e) => updateField("cliente", e.target.value)}
              placeholder="Ej. Arq. Roberto Medina"
              className="h-10 w-full rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">
              Ubicaci&oacute;n
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6D5A]" />
              <input
                type="text"
                value={form.ubicacion}
                onChange={(e) => updateField("ubicacion", e.target.value)}
                placeholder="Ej. Mérida, Yuc."
                className="h-10 w-full rounded-lg border border-[#E0DBD1] bg-white pl-9 pr-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
              />
            </div>
          </div>
        </div>

        {/* Financiero */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#1E1A14] flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#D4A843]" />
            Informaci&oacute;n Financiera
          </h2>

          <div>
            <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">
              Monto total del contrato (MXN) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.contrato_total}
              onChange={(e) => updateField("contrato_total", e.target.value)}
              placeholder="0.00"
              className="h-10 w-full rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">
                Anticipo (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={form.anticipo_porcentaje}
                onChange={(e) => updateField("anticipo_porcentaje", e.target.value)}
                className="h-10 w-full rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">
                Retenci&oacute;n (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={form.retencion_porcentaje}
                onChange={(e) => updateField("retencion_porcentaje", e.target.value)}
                className="h-10 w-full rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
              />
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#1E1A14] flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#D4A843]" />
            Fechas
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">
                Fecha de inicio
              </label>
              <input
                type="date"
                value={form.fecha_inicio}
                onChange={(e) => updateField("fecha_inicio", e.target.value)}
                className="h-10 w-full rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">
                Fecha estimada de entrega
              </label>
              <input
                type="date"
                value={form.fecha_fin_estimada}
                onChange={(e) => updateField("fecha_fin_estimada", e.target.value)}
                className="h-10 w-full rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
              />
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#1E1A14] flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#D4A843]" />
            Notas
          </h2>

          <textarea
            value={form.notas}
            onChange={(e) => updateField("notas", e.target.value)}
            rows={3}
            placeholder="Observaciones adicionales sobre la obra..."
            className="w-full rounded-lg border border-[#E0DBD1] bg-white px-3 py-2 text-sm text-[#1E1A14] placeholder:text-[#7A6D5A] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843] resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/director/obras"
            className="rounded-lg border border-[#E0DBD1] px-4 py-2.5 text-sm font-medium text-[#7A6D5A] hover:bg-[#F0EDE8]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D4A843] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#C49A3A] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Crear Obra
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
